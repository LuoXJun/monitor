import axios from 'axios'

const getTxt = (url: string, fileName: string) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        responseType: 'blob'
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: 'text/plain;charset=utf-8' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        resolve('success')
      })
      .catch((error) => {
        reject(error)
      })
  })
}

const download0 = (data: Blob, fileName: string, mineType: string) => {
  // 创建 blob
  const blob = new Blob([data], { type: mineType })
  // 创建 href 超链接，点击进行下载
  window.URL = window.URL || window.webkitURL
  const href = URL.createObjectURL(blob)
  console.log(href)
  const downA = document.createElement('a')
  downA.href = href
  downA.download = fileName
  downA.click()
  // 销毁超连接
  window.URL.revokeObjectURL(href)
}

const download = {
  // 下载 Excel 方法
  excel: (data: Blob, fileName: string) => {
    download0(data, fileName, 'application/vnd.ms-excel')
  },
  // 下载 Word 方法
  word: (data: Blob, fileName: string) => {
    download0(data, fileName, 'application/msword')
  },
  // 下载 Zip 方法
  zip: (data: Blob, fileName: string) => {
    download0(data, fileName, 'application/zip')
  },
  // 下载 Html 方法
  html: (data: Blob, fileName: string) => {
    download0(data, fileName, 'text/html')
  },
  // 下载 Markdown 方法
  markdown: (data: Blob, fileName: string) => {
    download0(data, fileName, 'text/markdown')
  },
  txt: (url: string, fileName: string) => {
    getTxt(url, fileName)
  },
  pdf: (data: Blob, fileName: string) => {
    download0(data, fileName, 'application/pdf')
  },
  // application/json;charset=UTF-8

  // 下载图片（允许跨域）
  image: ({
    url,
    fileName,
    canvasWidth,
    canvasHeight,
    drawWithImageSize = true
  }: {
    url: string
    fileName: string
    canvasWidth?: number
    canvasHeight?: number
    drawWithImageSize?: boolean
  }) => {
    const image = new Image()
    // 添加跨域支持
    image.crossOrigin = 'anonymous'
    image.src = url
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth || image.width
      canvas.height = canvasHeight || image.height
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
      if (drawWithImageSize) {
        ctx.drawImage(image, 0, 0, image.width, image.height)
      } else {
        ctx.drawImage(image, 0, 0)
      }
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
    }
    // 添加错误处理
    image.onerror = () => {
      // 如果跨域加载失败，直接使用原始URL下载
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.target = '_blank'
      a.click()
    }
  }
}

export default download
