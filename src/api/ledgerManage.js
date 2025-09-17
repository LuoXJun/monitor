import request from '@/config/axios'

//获取台账类型下拉
export const getLedgerInfoType = (query) => {
  return request.get({
    url: '/ledgerInfo/type',
    params: query
  })
}

//获取材料类型（含台账类型）树形下拉框
export const getLedgerInfoListTree = (query) => {
  return request.get({
    url: '/ledgerInfo/listTree',
    params: query
  })
}

//获取查询台账动态表头：渲染列
export const getLedgerInfoHeader = (query) => {
  return request.get({
    url: '/ledgerInfo/header/' + query,
  })
}


//计算保存台账信息
export const getLedgerCalculation = (query) => {
  return request.get({
    url: '/ledgerInfo/calculation/' + query,
  })
}

//获取台账信息分页
export const getLedgerInfoPage = (query) => {
  return request.get({
    url: '/ledgerInfo/page',
    params: query
  })
}

//获取根据处理流程获得台账详细信息
export const getledgerInfoInfo = (query) => {
  return request.get({
    url: '/ledgerInfo/info/' + query,
  })
}


//更新台账信息
export const getLedgerInfoUpdate = (data) => {
  return request.post({
    url: '/ledgerInfo/update',
    data
  })
}

//获取下载报告的地址
export const getownloadUUrl = (query) => {
  return request.get({
    url: '/ledgerInfo/download/url/' + query,
  })
}

//提取设备数据
export const getextractQuipdata = (data) => {
  return request.post({
    url: '/ledgerInfo/extract/quipdata',
    data
  })
}

//设备数据的样品编号
export const gettestdata = () => {
  return request.get({
    url: '/ledgerInfo/testdata/',
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
