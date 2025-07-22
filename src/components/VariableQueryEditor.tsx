import '../styles.css';
import React, { useState, useRef, useEffect } from 'react';
import { InlineField, Select, TextArea, AsyncMultiSelect } from '@grafana/ui';
import { DataSource } from '../datasource';
import { MyVariableQuery, DEFAULT_VARIABLE_QUERY } from '../types';
import { formatWorkspaceOptions, formatWorkspaceUUIDs } from '../utils';
import { CURRENT_WORKSPACE_NAME, qtypeOptions } from '../constants';

interface VariableQueryProps {
  query: MyVariableQuery;
  onChange: (query: MyVariableQuery, definition: string) => void;
  datasource: DataSource;
}

export const VariableQueryEditor = ({ onChange, query, datasource }: VariableQueryProps) => {
  // 使用useRef存储持久化数据
  const persistentData = useRef({
    currentWorkspaceUUID: '',
    currentWorkspaceName: '',
    currentRegionCode: '',
    hasAuthedWorkspace: false,
  });
  
  const [state, setState] = useState({
    ...DEFAULT_VARIABLE_QUERY,
    ...query, // 合并传入的查询参数
  });

  const setWorkspaceUUIDs = (workspaceUUIDOptions: any[]) => {
    const { currentWorkspaceUUID, currentRegionCode } = persistentData.current || {};
    const workspaceUUIDsData = formatWorkspaceUUIDs(workspaceUUIDOptions, currentWorkspaceUUID, currentRegionCode)
    setState({
      ...state,
      workspaceUUIDs: workspaceUUIDsData,
    });
    
    onChange({
      ...state,
      workspaceUUIDs: workspaceUUIDsData,
    }, `${state.rawQuery}`);
  };

  const handleQtypeChange = (qtype: string) => {
    if (qtype === state.qtype) {
      return;
    }
    setState({
      ...state,
      qtype,
      rawQuery: '',
    });
  }

  const saveQuery = () => {
    onChange(state, `${state.rawQuery}`);
  };

  const handleChange = (event: React.FormEvent<HTMLTextAreaElement>) =>
    setState({
      ...state,
      [event.currentTarget.name]: event.currentTarget.value,
    });

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

          setState({ ...state })

          onChange(state, `${state.rawQuery}`);
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

        setState({ ...state })
      })
  }

  // 监听数据源变化
  useEffect(() => {
    // 数据源切换
      
    // 重置持久化数据（清空旧数据源的工作区信息）
    persistentData.current = {
      currentWorkspaceUUID: '',
      currentWorkspaceName: '',
      currentRegionCode: '',
      hasAuthedWorkspace: false,
    };
      
    getWorkspaceList(''); // 加载新数据源的工作区列表
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasource, onChange]); // 监听 datasource 对象变化

  return (
    <div className="variable-query-editor-container">
      <InlineField
        label="Workspace"
        labelWidth={15}
        grow={true}
        className="variable-query-editor-container-workspace-select"
        style={{ display: persistentData.current.hasAuthedWorkspace || state.workspaceUUIDs && state.workspaceUUIDs.length > 0 ? 'flex' : 'none' }}
        >
        <AsyncMultiSelect
          isSearchable={true}
          isClearable={true}
          showAllSelectedWhenOpen={false}
          closeMenuOnSelect={false}
          loadOptions={getWorkspaceList}
          defaultOptions
          value={state.workspaceUUIDs}
          placeholder={CURRENT_WORKSPACE_NAME + ' (Default)'}
          getOptionLabel={(option: any) => option.value === persistentData.current.currentWorkspaceUUID ? CURRENT_WORKSPACE_NAME : option.label}
          onChange={v => setWorkspaceUUIDs(v)}
        />
      </InlineField>

      <InlineField label="Query Type" labelWidth={15} grow={false}>
        <Select
          options={qtypeOptions}
          value={state.qtype}
          onBlur={saveQuery}
          onChange={({ value = '' }) => handleQtypeChange(value)}
        />
      </InlineField>

      <InlineField label="Query" labelWidth={15} grow={true}>
        <TextArea
          name="rawQuery"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={state.rawQuery}
          rows={5}
        />
      </InlineField>
    </div>
  );
};
