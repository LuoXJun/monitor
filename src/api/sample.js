import request from '@/config/axios'

//获取设备信息
export const getSampleInfoPage = (query) => {
  return request.get({
    url: '/sampleInfo/page',
    params: query
  })
}

//新增设备信息
export const createSampleInfo = (data) => {
  return request.post({
    url: '/sampleInfo/create',
    data
  })
}
// 编辑设备信息
export const updateSampleInfo = (data) => {
  return request.put({
    url: '/sampleInfo/update',
    data
  })
}

//删除设备种类
export const deleteSampleInfo = (id) => {
  return request.delete({
    url: '/sampleInfo/delete?id=' + id
  })
}

// 获取设备种类详情
export const getSampleInfoDetail = (id) => {
  return request.get({
    url: '/sampleInfo/get?id=' + id
  })
}
export const getSampleInfoDetailByProcessInstanceId = (id) => {
  return request.get({
    url: '/sampleInfo/getSample?processInstanceId=' + id
  })
}

//获取用户列表
export const getUserList = (params) => {
  return request.get({ url: '/system/user/page', params })
}

/**
 * 填报记录列表
 */
export const getFillHistoryPage = (params) => {
  return request.get({ url: '/tb/fill-history/page', params })
}

export const getFillHistoryDetail = (params) => {
  return request.get({ url: '/tb/fill-history/get', params })
}

export const getWtFillDetail = (params) => {
  return request.get({ url: '/sampleInfo/getBusinessInfo', params })
}

// 获取不分页用户数据
export const getUserListNoPage = (params) => {
  return request.get({ url: 'system/user/simple-list', params })
}
