import request from '@/config/axios'

// 上传文件
export const convertExcel2Pdf = (data) => {
  return request.uploadAndDownload({ url: '/pdf/convert', data })
}
