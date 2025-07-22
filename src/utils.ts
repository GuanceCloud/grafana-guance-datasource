import {
  CURRENT_REGION_NAME,
  ALL_WORKSPACE_UUID,
  ALL_WORKSPACE_NAME,
  REGION_WORKSPACE_SPLITTER,
} from './constants';

/**
 * get obj type string
 * @param obj 对象
 * @returns {*} 返回对象数据类型
 */
export function typeOf(obj: any): any {
  const toString = Object.prototype.toString;
  const map: any = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
  };
  return map[toString.call(obj)];
}

/**
 * replace 're(`.*`)' to re(`.*`)
 * host = re(`.*`) WITHOUT quotation mark, means all value in DQL.
 */
export function replaceQueryVariable(query: string): string {
  const reg = /(=|in)\s*\[?[\'\"]?re\(`\.\*\`\)[\'\"]?\]?/ig
  const notReg = /(!=|not in)\s*\[?[\'\"]re\(`\.\*\`\)[\'\"]\]?/ig
  return query
    .replace(notReg, "!= re(`.*`)")
    .replace(reg, "= re(`.*`)")
}

export function replacePromQLQueryVariable(query: string): string {
  const reg = /(=|in)\s*\[?[\'\"]?re\(`\.\*\`\)[\'\"]?\]?/ig
  const notReg = /(!=|not in)\s*\[?[\'\"]re\(`\.\*\`\)[\'\"]\]?/ig
  return query
    .replace(notReg, "!~'.*'")
    .replace(reg, "=~'.*'")
}

// 格式选择空间ID的下拉选项信息
export const formatWorkspaceOptions = (res: any[], currentWorkspaceUUID: string, currentWorkspaceName: string, currentRegionCode: string) => {
  const options: any = [];

  if (res && (res.length > 0)) {
    // 本空间
    let defaultRegionIndex = res.findIndex((item: any) => item.regionCode === currentRegionCode);
    if (defaultRegionIndex === -1) {
      options.push({
        value: currentRegionCode,
        label: CURRENT_REGION_NAME,
        options: [],
      });
      defaultRegionIndex = 0;
    }

    res.forEach((item: any, index: number) => {
      const workspaceUUIDPrefix = item.regionCode === currentRegionCode ? '' : item.regionCode + REGION_WORKSPACE_SPLITTER;
      const subOption: any[] = [];
      item.data.forEach((subItem: any) => {
        subOption.push({
          value: workspaceUUIDPrefix + subItem.workspaceUUID,
          label: subItem.workspaceName,
        })
      });

      // 当前空间
      if (index === defaultRegionIndex) {
        subOption.unshift({
          value: currentWorkspaceUUID,
          label: currentWorkspaceName,
        })
      }

      // 全部空间
      subOption.unshift({
        value: workspaceUUIDPrefix + ALL_WORKSPACE_UUID,
        label: ALL_WORKSPACE_NAME,
      })

      const optionItem = {
        value: item.regionCode,
        label: item.regionCode === currentRegionCode ? CURRENT_REGION_NAME : item.regionName,
        options: subOption,
      };

      options.push(optionItem);
    })
  }

  return options;
}

// 格式存储的空间ID
export const formatWorkspaceUUIDs = (workspaceUUIDOptions: any[], currentWorkspaceUUID: string, currentRegionCode: string) => {
  const values = workspaceUUIDOptions.map((option: any) => option.value);

  if (values.length === 0) {
    // 清空时
    // workspaceUUIDOptions = [{
    //   value: currentWorkspaceUUID,
    //   label: CURRENT_WORKSPACE_NAME
    // }];
  } else if (values.length >= 2) {
    const oldSplits = values[0].split(REGION_WORKSPACE_SPLITTER);
    const oldRegionCode = oldSplits.length === 2 ? oldSplits[0] : currentRegionCode;
    const newSplits = values.at(-1).split(REGION_WORKSPACE_SPLITTER);
    const newRegionCode = newSplits.length === 2 ? newSplits[0] : currentRegionCode;
    if (oldRegionCode !== newRegionCode) {
      // 改变站点
      workspaceUUIDOptions = [workspaceUUIDOptions.at(-1)];
    } else {
      // 选择全部站点
      const workspaceUUIDs = values.map((item: string) => item.split(REGION_WORKSPACE_SPLITTER).at(-1));
      if (workspaceUUIDs.includes(ALL_WORKSPACE_UUID)) {
        // 最后一项选中的是全部空间 或 之前选中的是全部空间 都只要保留最后一项
        workspaceUUIDOptions = [workspaceUUIDOptions.at(-1)];
      }
    }
  }

  // deduplicate
  const list: any[] = [];
  const listValues: string[] = [];
  workspaceUUIDOptions.forEach((item: any) => {
    if (!listValues.includes(item.value)) {
      list.push({
        ...item,
        value: item.value,
      });
      listValues.push(item.value);
    }
  })

  return list;
}

// 格式数据请求时的 workspaceUUIDs 字段
export const formatQueryWorkspaceUUIDs = (queryWorkspaceUUIDs: string[] | undefined) => {
  let regionCode = undefined
  let workspaceUUIDs: string[] | undefined = queryWorkspaceUUIDs || undefined;
  if (workspaceUUIDs) {
    workspaceUUIDs = workspaceUUIDs
      .map((item: any) => item?.value)
      .filter((item: any) => !!item);
    if (workspaceUUIDs.length === 0) {
      workspaceUUIDs = undefined;
    } else if (workspaceUUIDs.length > 0) {
      // if (workspaceUUIDs.length === 1 && workspaceUUIDs[0] === CURRENT_WORKSPACE_UUID) {
      //   workspaceUUIDs = undefined;
      // } else {
        const splits = workspaceUUIDs[0].split(REGION_WORKSPACE_SPLITTER);
        if (splits.length === 2) {
          regionCode = splits[0];
          workspaceUUIDs = workspaceUUIDs
            .map((item: string) => item.split(REGION_WORKSPACE_SPLITTER).at(-1) || '')
            .filter((item: any) => !!item);
        }
      // }
    }
  }
  return {
    regionCode,
    workspaceUUIDs,
  }
}
