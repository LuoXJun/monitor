import request from '@/config/axios'

/**
 * 获取工作台顶部统计数据
 * @param {*} query
 * @returns
 */
export const getTaskState = (query) => {
  return request.get({
    url: '/dashboard/getTaskState',
    params: query
  })
}

/**
 * 设备鉴定到期提醒统计
 * @param {*} query
 * @returns
 */
export const getEquipmentCheckStat = (query) => {
  return request.get({
    url: '/dashboard/getEquipmentCheckStat',
    params: query
  })
}

/**
 * 任务分布情况统计
 * @param {*} query
 * @returns
 */
export const getTaskDistribution = (query) => {
  return request.get({
    url: '/dashboard/getTaskDistribution',
    params: query
  })
}

/**
 * 获取任务数量统计
 * @param {*} query
 * @returns
 */
export const getTaskQuantityState = (query) => {
  return request.get({
    url: '/dashboard/getTaskQuantityState',
    params: query
  })
}

/**
 * 报表统计
 * @param {*} query
 * @returns
 */
export const getReportList = (query) => {
  return request.get({
    url: '/dashboard/getReportList',
    params: query
  })
}
