import '../styles.css';
import React, { useRef, useEffect } from 'react';
import { InlineField, QueryField, Select, AsyncMultiSelect, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery, DEFAULT_QUERY } from '../types';
import { formatWorkspaceOptions, formatWorkspaceUUIDs } from '../utils';
import { CURRENT_WORKSPACE_NAME, qtypeOptions } from '../constants';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery, datasource }: Props) {
  // 使用useRef存储持久化数据
  const persistentData = useRef({
    currentWorkspaceUUID: '',
    currentWorkspaceName: '',
    currentRegionCode: '',
    hasAuthedWorkspace: false,
  });

  const { workspaceUUIDs, queryText, qtype, legendFormat } = {
    ...DEFAULT_QUERY,
    ...query, // 合并传入的查询参数
  };


  const setWorkspaceUUIDs = (workspaceUUIDOptions: any[]) => {
    const { currentWorkspaceUUID, currentRegionCode } = persistentData.current || {};
    const workspaceUUIDsData = formatWorkspaceUUIDs(workspaceUUIDOptions, currentWorkspaceUUID, currentRegionCode)
    onChange({
      ...query,
      workspaceUUIDs: workspaceUUIDsData,
    });
    onRunQuery();
  };

  const setQtype = (qtype: string) => {
    if (qtype === query.qtype) {
      return;
    }
    onChange({
      ...query,
      qtype,
      queryText: '',
    });
  };

  const onQueryTextChange = (queryText: string) => {
    onChange({ ...query, queryText });
  };

  const onLegendFormatChange = (event: React.FormEvent<HTMLInputElement>) => {
    onChange({ ...query, legendFormat: event.currentTarget.value });
  };

  const getWorkspaceList = (search: string) => {
    return getCurrentWorkspace()
      .then(() => {
        return datasource.queryWorkspaceList(search)
      })
      .then((res: any) => {
        const { currentWorkspaceUUID, currentWorkspaceName, currentRegionCode } = persistentData.current || {};
        const options = formatWorkspaceOptions(res, currentWorkspaceUUID, currentWorkspaceName, currentRegionCode);
        
        if (!search) {
          const hasAuthedWorkspace: boolean = options.length > 0
          // 更新持久化数据
          persistentData.current.hasAuthedWorkspace = hasAuthedWorkspace;
        }

        return options;
      })
  }

  const getCurrentWorkspace = () => {
    // 检查持久化数据中是否已有值
    if (persistentData.current.currentWorkspaceUUID) {
      return Promise.resolve();
    }

    return datasource.queryCurrentWorkspace()
      .then((res: any) => {
        const { uuid, name, regionCode }= res;

        // 更新持久化数据
        persistentData.current.currentWorkspaceUUID = uuid;
        persistentData.current.currentWorkspaceName = name;
        persistentData.current.currentRegionCode = regionCode;
      })
  }

  // 监听数据源变化
  useEffect(() => {
    onRunQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasource]); // 监听 datasource 对象变化

  return (
    <div className="query-editor-container">
      <InlineField
        label="Workspace"
        labelWidth={15}
        grow={true}
        className="query-editor-container-workspace-select"
        style={{ display: persistentData.current.hasAuthedWorkspace || workspaceUUIDs && workspaceUUIDs.length > 0 ? 'flex' : 'none' }}
        >
        <AsyncMultiSelect
          isSearchable={true}
          isClearable={true}
          showAllSelectedWhenOpen={false}
          closeMenuOnSelect={false}
          loadOptions={getWorkspaceList}
          defaultOptions
          value={workspaceUUIDs}
          placeholder={CURRENT_WORKSPACE_NAME + ' (Default)'}
          getOptionLabel={(option: any) => option.value === persistentData.current.currentWorkspaceUUID ? CURRENT_WORKSPACE_NAME : option.label}
          onChange={v => setWorkspaceUUIDs(v)}
        />
      </InlineField>

      <InlineField label="Query Type" labelWidth={15} grow={true}>
        <Select
          options={qtypeOptions}
          value={qtype}
          onChange={({ value = '' }) => setQtype(value)}
        />
      </InlineField>

      <InlineField label="Query" labelWidth={15} grow={true} className="query-editor-container-query-field">
        <QueryField
          onChange={onQueryTextChange}
          onRunQuery={onRunQuery}
          // By default QueryField calls onChange if onBlur is not defined, this will trigger a rerender
          // And slate will claim the focus, making it impossible to leave the field.
          onBlur={onRunQuery}
          placeholder={'Enter Query (run with Shift+Enter)'}
          query={queryText || ''}
          portalOrigin="guance"
        />
      </InlineField>

      <InlineField 
        label="Legend" 
        labelWidth={15} 
        grow={true}
        tooltip="Controls the name of the time series using label pattern. For example: {{hostname}} - {{app_name}}"
      >
        <Input
          type="text"
          placeholder="Optional, For example: {{hostname}}"
          value={legendFormat || ''}
          onChange={onLegendFormatChange}
          onBlur={onRunQuery}
        />
      </InlineField>
    </div>
  );
}
