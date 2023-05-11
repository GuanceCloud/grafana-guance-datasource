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
  const reg = /(=|in)\s+\[?\'?re\(`\.\*\`\)\'?\]?/ig
  const notReg = /(!=|not in)\s+\[?\'?re\(`\.\*\`\)\'?\]?/ig
  return query
    .replace(notReg, '!= re(`.*`)')
    .replace(reg, '= re(`.*`)')
}
