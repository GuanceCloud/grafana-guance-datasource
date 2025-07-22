import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  workspaceUUIDs?: any[];
  qtype?: string;
  queryText?: string;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  workspaceUUIDs: [],
  qtype: 'dql',
  queryText: '',
};

export interface DataSourceResponseSerie {
  name: string[],
  columns: string[],
  values: string[],
}

export interface DataSourceResponseData {
  series: DataSourceResponseSerie[],
}

export interface DataSourceResponseContent {
  data: DataSourceResponseData[],
}
export interface DataSourceResponse {
  // datapoints: DataPoint[];
  content: DataSourceResponseContent;
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  endpoint?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}

export interface MyVariableQuery {
  workspaceUUIDs?: any[];
  qtype: string,
  rawQuery: string;
}

export const DEFAULT_VARIABLE_QUERY: Partial<MyVariableQuery> = {
  workspaceUUIDs: [],
  qtype: 'dql',
  rawQuery: '',
};
