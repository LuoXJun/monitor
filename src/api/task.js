import request from '@/config/axios'

/**
 * 任务发起
 * @param {*} data
 * @returns
 */
export const createTask = (data) => {
  return request.post({
    url: '/biz/processInstance/create',
    data
  })
}

/**
 * 审核节点通过任务
 * @param {*} data
 * @returns
 */
export const approveTask = (data) => {
  return request.put({
    url: '/biz/processInstance/approve',
    data
  })
}

/**
 * 审核节点拒绝任务
 * @param {*} data
 * @returns
 */
export const reject0Task = (data) => {
  return request.put({
    url: '/biz/processInstance/reject',
    data
  })
}
/**
 * 审核节点拒绝任务
 * @param {*} data
 * @returns
 */
export const rejectTask = (data) => {
  return request.put({
    url: '/biz/processInstance/reject2',
    data
  })
}

export const cancelTask = (id, reason) => {
  const data = {
    id: id,
    reason: reason
  }

  return request.delete({
    url: '/biz/processInstance/cancel-by-start-user',
    data
  })
}

/**
 * 获得发起的任务列表
 */
export const getSampleInfoSendTaskPage = (query) => {
  return request.get({
    url: '/sampleInfo/sendTaskPage',
    params: query
  })
}

/**
 * 获得待办的任务列表
 */
export const getSampleInfoTodoTaskPage = (query) => {
  return request.get({
    url: '/sampleInfo/todoPage',
    params: query
  })
}

/**
 * 获得已办的任务列表
 * @param {*} query
 * @returns
 */
export const getSampleInfoDoneTaskPage = (query) => {
  return request.get({
    url: '/sampleInfo/donePage',
    params: query
  })
}

/**
 * 获取填报数据
 * @param {*} query
 * @returns
 */
export const getSampleFillData = (query) => {
  return request.get({
    url: '/sampleInfo/getFillData',
    params: query
  })
}

export const updateSampleInfoDataFill = (data) => {
  return request.post({
    url: '/sampleInfo/dataFill',
    data
  })
}

/**
 * 获得指定流程实例
 * @param {*} query
 * @returns
 */
export const getTaskProcessInstance = (query) => {
  return request.get({
    url: '/biz/processInstance/get',
    params: query
  })
}
/**
 * 填报节点任务处理
 * @param {*} data
 * @returns
 */
export const fillProcessInstance = (data) => {
  return request.put({
    url: '/biz/processInstance/fill',
    data
  })
}

// =========== 下面是以前的

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

export const getProcessDefinition = (query) => {
  return request.get({
    url: 'bpm/process-definition/get',
    params: query
  })
}
