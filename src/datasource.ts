import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  ScopedVars,
  MutableDataFrame,
  MutableField,
  FieldType,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv, TemplateSrv, isFetchError } from '@grafana/runtime';
import _ from 'lodash';
import defaults from 'lodash/defaults';
import { DataSourceResponse, DEFAULT_QUERY, DEFAULT_VARIABLE_QUERY, MyDataSourceOptions, MyQuery, MyVariableQuery } from './types';
import { typeOf, replaceQueryVariable, replacePromQLQueryVariable, formatQueryWorkspaceUUIDs, formatLegend, interpolateQueryExpr } from './utils';
import { lastValueFrom } from 'rxjs';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;

  constructor(
    instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>,
    private readonly templateSrv: TemplateSrv = getTemplateSrv()
  ) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.url!;
  }

  /**
   * Chart Query
   */
  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const timeRange = [options.range.from.valueOf(), options.range.to.valueOf()];
    const maxPointCount = options.maxDataPoints || 360;
    const scopedVars = this.getScopedVars(options.scopedVars);

    // format request params
    let queryList: any = [];
    const queryMetadata: Map<number, { legendFormat?: string }> = new Map();
    
    options.targets.forEach((target, index) => {
      // DO NOT send request if query is hidden.
      if (target.hide) {
        return;
      }
      
      const query = defaults(target, DEFAULT_QUERY);
      const queryType = query.qtype || 'dql';
      const replaceVariableFunc = queryType === 'promql' ? replacePromQLQueryVariable : replaceQueryVariable;
      
      // Use custom interpolation function that handles single/multi/ALL values
      const interpolateFunc = (value: string | string[] = [], variable: any) => {
        return interpolateQueryExpr(value, variable, queryType);
      };
      
      let q = this.templateSrv.replace((query.queryText || ''), scopedVars, interpolateFunc);
      q = replaceVariableFunc(q);
      if (!q) {
        return;
      }

      const qtype = query.qtype || 'dql';
      const { regionCode, workspaceUUIDs } = formatQueryWorkspaceUUIDs(query.workspaceUUIDs);
      
      // Store legend format for this query
      queryMetadata.set(queryList.length, {
        legendFormat: query.legendFormat,
      });
      
      queryList.push({
        qtype,
        query: {
          q,
          targetRegion: regionCode,
          workspaceUUIDs,
          timeRange,
          maxPointCount,
        }
      });
    });

    // send request
    const resData = await this.queryData(queryList);

    // format reaponse data
    let dataList: any = []
    resData.forEach((res: any, queryIndex: number) => {
      const metadata = queryMetadata.get(queryIndex);
      const legendFormat = metadata?.legendFormat;
      
      res.series.forEach((serie: any) => {
        const columns = serie.columns || [];
        const serieName = serie.name;
        
        // Build labels object from serie.name
        // serie.name could be a string, array, or the labels might be in serie.tags/serie.labels
        const labels: Record<string, any> = {};
        
        // Check if serie has tags or labels property
        if (serie.tags) {
          Object.assign(labels, serie.tags);
        }
        if (serie.labels) {
          Object.assign(labels, serie.labels);
        }
        
        // If serieName is an array, parse it
        if (Array.isArray(serieName)) {
          serieName.forEach((nameItem: string) => {
            const parts = nameItem.split('=');
            if (parts.length === 2) {
              labels[parts[0]] = parts[1];
            }
          });
        }
        
        // Generate display name using legend format or default
        let displayName = '';
        if (legendFormat) {
          displayName = formatLegend(legendFormat, labels);
        }
        // if (!displayName) {
        //   // Default: use the serie name
        //   displayName = Array.isArray(serieName) ? serieName.join(', ') : String(serieName || '');
        // }
        
        const fields: MutableField[] = columns.map((columnName: string, columnIndex: number) => {
        const values = (serie.values || [])
          .sort((a: any, b: any) => {
            return a[0] - b[0];
          })
          .map((value: [string, number]) => value[columnIndex]);
          let fieldType: FieldType;
          if (columnName === 'time') {
            fieldType = FieldType.time;
          } else {
            fieldType = (typeof(values[0]) === 'number') ? FieldType.number : FieldType.string;
          }
          
          // For non-time fields, apply the display name and labels
          const field: MutableField = {
            name: columnName,
            type: fieldType,
            values: values,
            config: columnName !== 'time' ? {
              displayNameFromDS: displayName,
            } : {},
          };
          
          // if (columnName !== 'time') {
          //   field.labels = labels;
          // }
          
          return field;
        })
        const data = new MutableDataFrame({
          fields: fields,
          name: displayName,
        });
        dataList.push(data);
      })
    })

    return { data: dataList };
  }

  /**
   * Get Query Variables
   */
  getScopedVars (scopedVars: ScopedVars) {
    const variables = this.templateSrv.getVariables();
    const vars = { ...scopedVars };

    variables.forEach((variable: any) => {
      const variableName = variable.name;
      let variableValue = variable.current.value;
  
      if (typeOf(variableValue) !== 'array') {
        variableValue = [variableValue];
      }
  
      // re(`.*`) means all value in DQL.
      if (variableValue[0] === '$__all') {
        vars[variableName] = {
          text: variable.current.text,
          value: 're(`.*`)',
        }
      }
    });

    return vars;
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    return this.request('/healthz')
      .then((res) => {
        return {
          status: 'success',
          message: 'Success',
        };
      })
      .catch((err) => {
        let message = err.data && err.data.message || err.statusText;
        if (err.status !== 400) {
          message = 'Connect Error'
        }
        return {
          status: 'error',
          message,
        };
      });
  }

  /**
   * For dashboard variables.
   */
  async metricFindQuery(query: MyVariableQuery, options?: any) {
    // format request params
    const { workspaceUUIDs: queryWorkspaceUUIDs, qtype = 'dql', rawQuery: q } = defaults(query, DEFAULT_VARIABLE_QUERY);
    const { regionCode, workspaceUUIDs } = formatQueryWorkspaceUUIDs(queryWorkspaceUUIDs);
    const timeRange = [options.range.from.valueOf(), options.range.to.valueOf()];
    const queryList = q ? [{
      qtype,
      query: {
        q,
        regionCode,
        workspaceUUIDs,
        timeRange: timeRange,
        disableMultipleField: false,
        limit: 50,
      }
    }] : [];

    // send request
    const resData = await this.queryData(queryList);
  
    // format response data
    const series = resData && resData[0] && resData[0].series;
    if (!series || !series.length) {
      return [];
    }
    const values = series[0].values?.map((value: any) => ({ text: value.at(-1) }));
    return values;
  }

  /**
   * Query data with DQL.
   */
  async queryData(queries?: any) {
    if (!queries || !queries.length) {
      return [];
    }
    const queryList = queries.map((queryItem: any) => {
      const { qtype = 'dql', query = {} } = queryItem;
      return {
        qtype,
        query: {
          ...query,
        }
      }
    });

    const params = {
      queries_body: JSON.stringify({ queries: queryList }),
    };

    return this.request('/query', params)
      .then((res) => {
        return res.data?.content?.data;
      })
      .catch((err) => {
        let message = err;
        if (isFetchError(err)) {
          message = err.data && err.data.message || err.statusText;
        }
        throw new Error(message);
      })
  }
  
  async queryWorkspaceList(search = '') {
    const params = {
      pageIndex: 1,
      pageSize: 100,
      search: search || undefined,
    };
    return this.request('/workspaces', params)
      .then((res) => {
        return res?.data?.content || [];
      })
      .catch((err) => {
        let message = err;
        if (isFetchError(err)) {
          message = err.data && err.data.message || err.statusText;
        }
        throw new Error(message);
      })
  }

  async queryCurrentWorkspace() {
    return this.request('/workspace')
      .then((res) => {
        return res?.data?.content || [];
      })
      .catch((err) => {
        let message = err;
        if (isFetchError(err)) {
          message = err.data && err.data.message || err.statusText;
        }
        throw new Error(message);
      })
  }

  async request(url: string, params?: any) {
    return lastValueFrom(getBackendSrv()
      .fetch<DataSourceResponse>({
        url: `${this.baseUrl}${url}`,
        params: params || {},
        method: 'GET',
      }));
  }
}
