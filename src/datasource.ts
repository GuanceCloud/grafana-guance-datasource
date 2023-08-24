import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  ScopedVars,
  MutableDataFrame,
  MutableField,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv, TemplateSrv, isFetchError } from '@grafana/runtime';
import _ from 'lodash';
import defaults from 'lodash/defaults';
import { DataSourceResponse, DEFAULT_QUERY, MyDataSourceOptions, MyQuery, MyVariableQuery } from './types';
import { typeOf, replaceQueryVariable } from './utils';
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
    options.targets.forEach((target) => {
      // DO NOT send request if query is hidden.
      if (target.hide) {
        return;
      }
      
      const query = defaults(target, DEFAULT_QUERY);
      let q = this.templateSrv.replace((query.queryText || ''), scopedVars, 'json');
      q = replaceQueryVariable(q);

      queryList.push({
        q: q,
        timeRange: timeRange,
        maxPointCount: maxPointCount,
      });
    });

    // send request
    const resData = await this.queryData(queryList);

    // format reaponse data
    let dataList: any = []
    resData.forEach((res: any) => {
      res.series.forEach((serie: any) => {
        const columns = serie.columns || [];
        const fields: MutableField[] = columns.map((columnName: string, columnIndex: number) => {
        const values = (serie.values || [])
          .sort((a: any, b: any) => {
            return a[0] - b[0];
          })
          .map((value: [string, number]) => value[columnIndex]);
          let fieldType = '';
          if (columnName === 'time') {
            fieldType = 'time';
          } else {
            fieldType = (typeof(values[0]) === 'number') ? 'number' : 'string';
          }
          return {
            name: columnName,
            type: fieldType,
            values: values,
          };
        })
        const data = new MutableDataFrame({
          fields: fields,
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
    const q = query.rawQuery;
    const timeRange = [options.range.from.valueOf(), options.range.to.valueOf()];
    const queryList = [{
      q: q,
      timeRange: timeRange,
      disableMultipleField: false,
      limit: 50,
    }];

    // send request
    const resData = await this.queryData(queryList);
  
    // format response data
    const series = resData[0].series;
    if (!series || !series.length) {
      return [];
    }
    const values = series[0].values?.map((value: any) => ({ text: value[1] }));
    return values;
  }

  /**
   * Query data with DQL.
   */
  async queryData(queries?: any) {
    const queryList = queries.map((query: any) => {
      return {
        qtype: 'dql',
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

  async request(url: string, params?: any) {
    return lastValueFrom(getBackendSrv()
      .fetch<DataSourceResponse>({
        url: `${this.baseUrl}${url}`,
        params: params || {},
        method: 'GET',
      }));
  }
}
