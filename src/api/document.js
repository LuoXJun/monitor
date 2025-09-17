
import request from '@/config/axios'

//获取设备信息
export const getProjectFilePage = (query) => {
  return request.get({
    url: '/projectFile/page',
    params: query
  })
}

//新增设备信息
export const createProjectFile = (data) => {
  return request.post({
    url: '/projectFile/create',
    data
  })
}
// 编辑设备信息
export const updateProjectFile = (data) => {
  return request.put({
    url: '/projectFile/update',
    data
  })
}

//删除设备种类
export const deleteProjectFile = (id) => {
  return request.delete({
     url: '/projectFile/delete?id=' + id
     })
}

// 获取设备种类详情
export const getProjectFileDetail = (id) => {
  return request.get({
     url: '/projectFile/get?id=' + id
     })
}