import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import QueryEditorHelp from './components/QueryEditorHelp';
import { VariableQueryEditor } from './components/VariableQueryEditor';
import { MyQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, MyQuery, MyDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  .setQueryEditorHelp(QueryEditorHelp)
  .setVariableQueryEditor(VariableQueryEditor);
