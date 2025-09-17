import request from '@/config/axios'
// 获取设备分类
export const getDeviceTypeList = (query) => {
  return request.get({
    url: '/equipmentCategory/list',
    params: query
  })
}

// 新增设备分类
export const createDeviceType = (data) => {
  return request.post({
    url: '/equipmentCategory/create',
    data
  })
}

//编辑设备种类
export const updateDeviceType = (data) => {
  return request.put({
    url: '/equipmentCategory/update',
    data
  })
}

//删除设备种类
export const deleteDeviceType = (id) => {
  return request.delete({
     url: '/equipmentCategory/delete?id=' + id
     })
}

// 获取设备种类详情
export const getDeviceTypeDetail = (id) => {
  return request.get({
     url: '/equipmentCategory/get?id=' + id
     })
}

//获取设备信息
export const getDeviceInfoPage = (query) => {
  return request.get({
    url: '/equipmentInfo/page',
    params: query
  })
}

//新增设备信息
export const createDeviceInfo = (data) => {
  return request.post({
    url: '/equipmentInfo/create',
    data
  })
}
// 编辑设备信息
export const updateDeviceInfo = (data) => {
  return request.put({
    url: '/equipmentInfo/update',
    data
  })
}

//删除设备种类
export const deleteDeviceInfo = (id) => {
  return request.delete({
     url: '/equipmentInfo/delete?id=' + id
     })
}

// 获取设备种类详情
export const getDeviceinfoDetail = (id) => {
  return request.get({
     url: '/equipmentInfo/get?id=' + id
     })
}


// 获取检定历史
export const getExamineHistoryPage = (query) => {
  return request.get({
    url: '/equipmentExamineHistory/list',
    params: query
  })
}


//删除
export const deleteExamineHistory = (id) => {
  return request.delete({
     url: '/equipmentExamineHistory/delete?id=' + id
     })
}

//检定
export const createVerification = (data) => {
  return request.post({
    url: '/equipmentInfo/examine',
    data
  })
}