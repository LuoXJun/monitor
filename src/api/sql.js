import request from '@/config/axios'

// 获取自建填报表列表
export const getDbPage = (query) => {
  return request.get({
    url: '/db/getTablePage',
    params: query
  })
}

export const getDbList = (query) => {
  return request.get({
    url: '/db/getTableList',
    params: query
  })
}

// 新建自建填报表

export const createDb = (data) => {
  return request.post({ url: '/db/createTable', data })
}

/**
 * 更新自检填报表
 * @param {*} data
 * @returns
 */
export const updateDb = (data) => {
  return request.post({ url: '/db/updateTable', data })
}

//获取公共字段

export const getCommonField = (query) => {
  return request.get({
    url: '/db/getCommonFields',
    params: query
  })
}

//获取自建表详情
export const getFieldDetail = (query) => {
  return request.get({
    url: '/db/getTableField',
    params: query
  })
}

//删除自建表
export const deleteDb = (tableName) => {
  return request.delete({ url: `/db/deleteTable/${tableName}` })
}

// export const batchDeleteDb = (ids = []) => {
//   return request.delete({ url: `/db/batchDeleteTable` })
// }

// 删除字段校验
export const delFieldCheck = (data) => {
  return request.post({ url: `/db/delFieldCheck`, data })
}
