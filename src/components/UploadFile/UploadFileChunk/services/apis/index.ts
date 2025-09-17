import request from '@/config/axios'
import type { FilesType, UploadFileInfoType, UploadUrls } from './typing'

/**
 * 根据 md5 检查文件是否上传，若上传一半，则返回已上传的文件序号 listParts
 * @param md5
 * @returns
 */
export const checkFileByMd5 = (md5: string) => {
  return request.get({
    url: `/files/multipart/check/${md5}`,
  })
}

/**
 * 根据文件信息初始化分片上传地址
 * @param data
 * @returns
 */
export const initMultPartFile = (data: UploadFileInfoType) => {
  return request.post({
    url: '/files/multipart/init',
    data
  })
}

/**
 * 合并文件
 * @param md5
 * @returns
 */
export const mergeFileByMd5 = (md5: string) => {
  return request.post({
    url: `/files/multipart/merge/${md5}`,
  })
}

/**
 * 分片下载
 * @param filename
 * @param bytes
 * @returns
 */
export const chunkDownloadFile = (id: number, bytes: string) => {
  return request.get({
    url: `/files/download/${id}`,
    // {
    //   responseType: 'blob',
    //   headers: {
    //     Range: bytes
    //   }
    // }
  })
}

/**
 * 获取数据库文件列表
 */
export const fetchFileList = () => {
  return request.get({
    url: '/files/list',
  })
}
