import request from '@/config/axios'

export interface FilePageReqVO extends PageParam {
  path?: string
  type?: string
  createTime?: Date[]
}

// 文件预签名地址 Response VO
export interface FilePresignedUrlRespVO {
  // 文件配置编号
  configId: number
  // 文件上传 URL
  uploadUrl: string
  // 文件 URL
  url: string
}

// 查询文件列表
export const getFilePage = (params: FilePageReqVO) => {
  return request.get({ url: '/infra/file/page', params })
}

// 删除文件
export const deleteFile = (id: number) => {
  return request.delete({ url: '/infra/file/delete?id=' + id })
}

// 获取文件预签名地址
export const getFilePresignedUrl = (path: string) => {
  return request.get<FilePresignedUrlRespVO>({
    url: '/infra/file/presigned-url',
    params: { path }
  })
}

// 创建文件
export const createFile = (data: any) => {
  return request.post({ url: '/infra/file/create', data })
}

// 上传文件
export const updateFile = (data: any) => {
  return request.upload({ url: '/infra/file/uploadFile', data })
}

// 检查文件是否存在
export const checkFileExists = (md5: any) => {
  return request.get({
    url: `/files/multipart/check/${md5}`,
  })
}

// 初始化文件分片地址及相关数据
export const initFileUpload = (fileData: Object) => {
  return request.post({
    url: '/files/multipart/init',
    data: fileData
  })
}

// 文件合并
export const mergeFiles = (md5: any) => {
  return request.post({
    url: `/files/multipart/merge/${md5}`,
  })
}

// 分片下载文件
export const downloadFileChunk = (fileId) => {
  return request.get({
    url: `/files/download/${fileId}`,
  })
}

// 获取文件列表
export const getFileList = () => {
  return request.get({
    url: '/files/list',
  })
}
