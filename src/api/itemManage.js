import request from '@/config/axios'

// 获取项目分页
export const getItemPage = (query) => {
  return request.get({
    url: '/projectInfo/page',
    params: query
  })
}

// 新增项目
export const createItem = (data) => {
  return request.post({
    url: '/projectInfo/create',
    data
  })
}

//编辑项目
export const updateItem = (data) => {
  return request.put({
    url: '/projectInfo/update',
    data
  })
}
//删除项目
export const deleteItem = (id) => {
  return request.delete({
    url: '/projectInfo/delete?id=' + id
  })
}

// 获取单位详情
export const getItemDetail = (id) => {
  return request.get({
    url: '/projectInfo/get?id=' + id
  })
}

// 获取项目列表
export const getItemList = (query) => {
  return request.get({
    url: '/projectInfo/list',
    params: query
  })
}

// 获取项目树列表
export const getTreeList = (query) => {
  return request.get({
    url: '/projectInfo/listTree',
    params: query
  })
}

/**
 * 获取项目管理的导入模版
 * @param {*} query
 * @returns
 */
export const getImportTemplate = (query = {}) => {
  return request.download({
    url: '/projectInfo/get-import-template',
    params: query
  })
}

export const importProject = (data) => {
  return request.post({
    url: '/projectInfo/import',
    data
  })
}

// 获取任务数量统计
export const getTaskCount = (query) => {
  return request.get({
    url: '/dashboard/getTaskCount',
    params: query
  })
}
