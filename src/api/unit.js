import request from '@/config/axios'

// 获取单位列表
export const getUnitPage = (query) => {
  return request.get({
    url: '/unitInfo/page',
    params: query
  })
}

// 新增单位
export const createUnit = (data) => {
  return request.post({
    url: '/unitInfo/create',
    data
  })
}

//编辑单位
export const updateUnit = (data) => {
  return request.put({
    url: '/unitInfo/update',
    data
  })
}

// 删除单位

export const deleteUnit = (id) => {
  return request.delete({
     url: '/unitInfo/delete?id=' + id
     })
}

// 获取单位详情
export const getUnitDetail = (id) => {
  return request.get({
     url: '/unitInfo/get?id=' + id
     })
}
