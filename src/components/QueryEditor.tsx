import React from 'react';
import { InlineField, QueryField } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onQueryTextChange = (queryText: string) => {
    onChange({ ...query, queryText });
  };

  const { queryText } = query;

  return (
    <div className="gf-form">
      <InlineField label="Query" labelWidth={10} grow={true}>
        <QueryField
          onChange={onQueryTextChange}
          onRunQuery={onRunQuery}
          // By default QueryField calls onChange if onBlur is not defined, this will trigger a rerender
          // And slate will claim the focus, making it impossible to leave the field.
          onBlur={() => {}}
          placeholder={'Enter DQL (run with Shift+Enter)'}
          query={queryText || ''}
          portalOrigin="guance"
        />
      </InlineField>
    </div>
  );
}
