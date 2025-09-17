import { floatToFixed2 } from '@/utils'

// 格式化金额【分转元】
// @ts-ignore
export const fenToYuanFormat = (_, __, cellValue: any, ___) => {
  return `￥${floatToFixed2(cellValue)}`
}

/**
 * 把字符串过滤成只剩中文/英文/数字/下划线，并且不以数字开头
 * @param input 
 * @returns 
 */
export function formatDBPrevCnKeyName(input = '') {
  // 过滤掉前后的空格
  let filtered = input.trim()

  // 移除开头的数字
  filtered = filtered.replace(/^\d+/, '')

  // 替换掉不允许的字符
  filtered = filtered.replace(/[^a-zA-Z\u4e00-\u9fa5_\d]/g, '')

  return filtered
}
