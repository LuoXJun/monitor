<script setup lang="ts">
import axios from 'axios'
import pLimit from 'p-limit'
import * as FileApi from '@/api/infra/file'
import { useLuckySheetTool } from '@/components/luckysheet/hook/useLuckySheetTool.js'
import { CHUNK_SIZE } from './constants'
// import createChunkFileAndMd5 from '../util/createChunkFileAndMd5'
import { convertFileSizeUnit } from './util/fileUtil'
import {
  checkFileByMd5,
  initMultPartFile,
  mergeFileByMd5,
  chunkDownloadFile,
  fetchFileList
} from './services/apis'
import { HttpCodeUploadEnum } from './services'
import type { UploadFileInfoType } from './services/apis/typing'
import cutFile from './core/cutFile'
import { MerkleTree } from './core/MerkleTree'
import { reactive, watch } from 'vue'
import type { UploadFile } from 'element-plus'
import { downloadByUrl } from '@/utils/filt'
import download from '@/utils/download'

const { exitLuckySheet } = useLuckySheetTool()

const message = useMessage() // 消息弹窗
const plimit = pLimit(3)

/** 分片上传时的 file 和上传地址 url */
type ChunkFileUrlType = {
  url: string
  file: Blob
}
/** 表格数据类型 */
type FileTableDataType = {
  uid: string
  name: string
  size: number
  unitSize: string
  md5: string
  md5Progress: number
  progress: number
  file: File
  chunkCount: number
  /** 当前文件分片集合 */
  chunkFileList: Blob[]
  /** 已上传的文件大小总和（计算进度条） */
  uploadedSize: number
  /** 计算MD5中（加载中） | 等待上传 | 上传中  | 上传成功 | 上传失败 */
  status: 'preparation' | 'preupload' | 'uploading' | 'success' | 'error'
  url: string
  fileInfo: object
}

//  文件上传过程中的多种状态
const tagMap = {
  preparation: { color: 'gold', text: 'MD5计算中' },
  preupload: { color: 'purple', text: '等待上传' },
  uploading: { color: 'blue', text: '上传中' },
  success: { color: 'green', text: '上传成功' },
  error: { color: 'error', text: '上传失败' }
}

const state = reactive<{ dataSource: FileTableDataType[] }>({
  dataSource: []
})

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  accept: {
    type: Array as PropType<string[]>,
    default: () => ['*']
  },
  // 添加最大文件数限制属性
  limit: {
    type: Number,
    default: Infinity
  },
  progressWidth: {
    type: [String, Number],
    default: 200
  },
  filenameWidth: {
    type: [String, Number],
    default: 350
  },
  showUploadLabel: {
    type: Boolean,
    default: false
  },
  wrapUseFlexRow: {
    type: Boolean,
    default: false
  },
  useFlexRow: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['success', 'update:modelValue', 'error', 'before-upload'])

// 添加对 props.modelValue 的监听处理
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) return
    // 处理单个文件的情况
    if (typeof newValue === 'string') {
      console.log('🚀 ~ newValue:', newValue)
      handleExistingFile(newValue)
      return
    }

    // 处理多个文件的情况
    if (Array.isArray(newValue)) {
      console.log('🚀 ~ newValue:', newValue)
      newValue.forEach((file: unknown) => {
        handleExistingFile(file)
      })
    }
  },
  { immediate: true, deep: true }
)

// 处理已存在文件的方法
const handleExistingFile = async (file) => {
  if (!file) {
    return
  }

  // 从 URL 中提取文件名
  const fileName = file?.originFileName || file?.name || file?.url?.split('/')?.pop?.()
  let fileIndex = state.dataSource.findIndex((item) => {
    const isNoUploadChunkFile = !item.md5 || !file?.md5

    if (isNoUploadChunkFile) {
      return item.url === file?.url
    } else {
      return item.md5 == file?.md5
    }
  })

  if (fileIndex >= 0) {
    state.dataSource[fileIndex].url = file?.url
    return
  }
  try {
    // 添加到 dataSource
    state.dataSource.push({
      uid: Date.now().toString(),
      name: fileName,
      size: file?.size || 0,
      unitSize: convertFileSizeUnit(file?.size || 0),
      md5: file?.md5,
      md5Progress: 0,
      progress: 100,
      file: new File([], fileName),
      chunkCount: 0,
      chunkFileList: [],
      uploadedSize: 0,
      status: 'success',
      url: file?.url, // 添加 url 属性用于下载
      fileInfo: file
    })
  } catch (error) {
    console.error('获取文件信息失败:', error)
  }
}

// 选择文件并计算 md5
const handleChange = async (uploadFile: UploadFile) => {
  exitLuckySheet()
  emit('before-upload', uploadFile)
  // 添加文件数量检查
  if (state.dataSource.length >= props.limit) {
    message.error(`最多只能上传${props.limit}个文件!`)
    return
  }

  const file = uploadFile.raw
  if (!file) return

  if (!props.accept.includes('*')) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (
      !fileExtension ||
      !props.accept.some(
        (type) =>
          (type.includes('/') && type.split('/')[0] === file.type.split('/')[0]) ||
          type.replace(/^\./, '').toLowerCase() === fileExtension
      )
    ) {
      message.error('不支持的文件类型!')
      return
    }
  }

  // 添加文件名长度验证
  if (file.name.length > 100) {
    message.error('文件名称长度不能超过100个字符!')
    return
  }
  const chunkCount = Math.ceil((file.size ?? 0) / CHUNK_SIZE)
  // 展示给 table的数据，部分参数用于初始化
  const dataItem: FileTableDataType = {
    uid: uploadFile.uid,
    name: file.name,
    size: file.size ?? 0,
    unitSize: convertFileSizeUnit(file.size),
    md5: '',
    md5Progress: 0,
    progress: 0,
    chunkCount,
    file: file,
    status: 'preparation',
    chunkFileList: [],
    uploadedSize: 0,
    url: ''
  }
  state.dataSource.push(dataItem)
  const i = state.dataSource.findIndex((item) => item.uid == dataItem.uid)

  // 采用多线程计算和默克尔树计算树根
  const chunks = await cutFile(file)

  const merkleTree = new MerkleTree(chunks.map((chunk) => chunk.hash))
  const md5 = merkleTree.getRootHash()
  const chunkFileList = chunks.map((chunk) => chunk.blob)

  // 更新数据和状态
  state.dataSource[i] = {
    ...state.dataSource[i],
    md5,
    chunkFileList,
    status: 'preupload'
  }

  onUpload()
}

// 查询文件状态并上传
const onUpload = async () => {
  for (let i = 0; i < state.dataSource.length; i++) {
    // md5 未计算完成和正在上传的跳过（重复点击的情况）
    if (!state.dataSource[i].md5 || state.dataSource[i].status == 'uploading') continue
    await uploadFile(i, state.dataSource[i])
  }
  let fileList = state.dataSource.map((item) => item.fileInfo)
  emit('update:modelValue', fileList)
  emit('success', fileList, state.dataSource)
}

/**
 * 上传处理方法
 * @param index 如果直接修改 item，在上传过程中，item一直在被更改，而循环传入的 item 却一直是初始值，因此需要 index 确定当前 item 的最新值
 * @param item
 */
const uploadFile = async (index: number, item: FileTableDataType) => {
  const response = await checkFileByMd5(item.md5)
  state.dataSource[index].status = 'uploading'
  // if (code === HttpCodeUploadEnum.SUCCESS) {
  if (response.url) {
    //  上传成功
    state.dataSource[index].progress = 100
    state.dataSource[index].status = 'success'
    response.originFileName = item.name
    state.dataSource[index].fileInfo = response
    // emit('update:modelValue', Array.isArray(response) ? [...response] : [response])
    // emit('success', response)
    return
  } else if (response?.code === HttpCodeUploadEnum.FAIL) {
    //  上传失败
    state.dataSource[index].status = 'error'
    return
  } /*  else if (code === HttpCodeUploadEnum.UPLOADING) {
        // 上传中，返回已上传的文件数据和分片列表
      } else {
        // 未上传
      } */

  // 返回需要上传分片和对应地址
  const needUploadFile = await initSliceFile(item, response.data)
  const totalSize = needUploadFile.reduce((pre, cur) => pre + cur.file.size, 0)
  // plimit 并发上传
  const uploadLimit = needUploadFile.map((n) =>
    plimit(() => uploadChunkUrl(n, index, totalSize, item.file.type))
  )
  const results = await Promise.allSettled(uploadLimit)
  const errResults = results.filter((r) => r.status === 'rejected')

  if (errResults.length > 0) {
    console.warn(item.name + ' 上传失败的分片-----', errResults)
    state.dataSource[index].status = 'error'
    return
  }

  try {
    const response = await mergeFileByMd5(item.md5)
    if (response.url) {
      state.dataSource[index].status = 'success'
      state.dataSource[index].progress = 100
      state.dataSource[index].fileInfo = response
      // // 更新 v-model 值
      // emit('update:modelValue', Array.isArray(response) ? [...response] : [response])
      // // 触发成功事件
      // emit('success', response)
    }
  } catch (error) {
    state.dataSource[index].status = 'error'
  }
}

// 初始化分片操作并将分片文件和其上传地址一一对应
const initSliceFile = async (item: FileTableDataType, initData: UploadFileInfoType) => {
  //  只有上传中的分片文件才会有 initData 数据，用 {} 做兜底
  const { uploadId, listParts } = initData || {}

  // 初始化分片参数
  const param: UploadFileInfoType = {
    uploadId,
    originFileName: item.name,
    size: item.size,
    chunkSize: CHUNK_SIZE,
    chunkCount: item.chunkCount,
    md5: item.md5,
    contentType: item.file.type
  }

  const needUploadFile: ChunkFileUrlType[] = []

  const data = await initMultPartFile(param)
  // debugger
  // if (code !== 0) return []

  // 存放需要去上传的文件数据
  if ((listParts || []).length == 0) {
    // 若全都没有上传，一一对应，其中 urls 是所有分片上传的 url 集合
    item.chunkFileList.forEach((item, index) => {
      needUploadFile.push({ url: data.urls[index], file: item })
    })
    return needUploadFile
  }

  // 存在上传的，对比 minio 已上传的 listParts（序号），将已上传的过滤掉，只上传未上传的文件
  item.chunkFileList.forEach((item, index) => {
    // listParts 索引是从 1 开始的
    const i = (listParts || []).findIndex((v) => index + 1 == v)
    if (i === -1) {
      needUploadFile.push({ url: data.urls[index], file: item })
    }
  })
  return needUploadFile
}

// 根据分片上传地址将分片直传至 minio
const uploadChunkUrl = (
  chunkItem: ChunkFileUrlType,
  i: number,
  totalSize: number,
  type: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    axios
      .put(chunkItem.url, chunkItem.file, {
        headers: { 'Content-Type': type || 'application/octet-stream' }
      })
      .then((res) => {
        if (res.status !== 200) {
          reject(chunkItem)
        } else {
          // 已上传的文件大小更新，上传进度更新
          const newUploaedSize = state.dataSource[i].uploadedSize + chunkItem.file.size
          state.dataSource[i] = {
            ...state.dataSource[i],
            uploadedSize: newUploaedSize,
            progress: Math.floor((newUploaedSize / totalSize) * 100)
          }
          resolve()
        }
      })
      .catch((err) => {
        console.error(err)
        reject(chunkItem)
      })
  })
}

// 添加新的辅助方法
const getTagType = (status: string) => {
  const typeMap = {
    preparation: 'warning',
    preupload: 'info',
    uploading: 'primary',
    success: 'success',
    error: 'danger'
  }
  return typeMap[status]
}

const getProgressStatus = (status: string) => {
  if (status === 'success') return 'success'
  if (status === 'error') return 'exception'
  return ''
}

// 添加删除文件方法
const handleDelete = (item: FileTableDataType) => {
  console.log('🚀 ~ handleDelete ~ item:', item)
  // 从数据源中删除该文件
  const index = state.dataSource.findIndex(
    (file) => file.fileInfo.uploadId === item.fileInfo.uploadId
  )
  if (index > -1) {
    state.dataSource.splice(index, 1)
  }

  // 更新v-model值
  const fileList = state.dataSource.map((item) => item.fileInfo)
  console.log('🚀 ~ handleDelete ~ state.dataSource:', state.dataSource)
  emit('update:modelValue', fileList)
  // emit('success', fileList)
}

// 添加文件下载方法
const handleDownload = async (file) => {
  const fileName = file.originFileName || file.name
  const lastDotIndex = fileName.lastIndexOf('.')
  const fileExtension =
    lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : ''
  if (fileExtension == 'txt') {
    download.txt(file.url, fileName)
  } else {
    downloadByUrl({
      url: file.url,
      target: '_blank',
      fileName: fileName
    })
  }
}
</script>

<template>
  <div :class="[wrapUseFlexRow ? 'wrap-flex-row' : '', 'flex flex-col']">
    <div v-if="showUploadLabel && !disabled" class="upload-label">上传附件</div>
    <div>
      <div :class="[useFlexRow ? 'upload-flex-row' : '', 'flex justify-between items-center']">
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleChange"
          :accept="
            accept
              .map((type) =>
                type === '*'
                  ? '*'
                  : type.includes('/')
                    ? type
                    : type.startsWith('.')
                      ? type
                      : `.${type}`
              )
              .join(',')
          "
        >
          <el-button v-if="!disabled" :disabled="disabled">
            <Icon icon="ep:upload" class="mr-1" />
            上传文件
          </el-button>

          <!-- <div v-else>
          <div style="font-size: 16px; font-weight: 600">附件信息：</div>
        </div> -->
          <template v-if="!disabled" #tip>
            <!-- <div style="font-size: 12px">
          大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
        </div> -->
            <!-- <div style="font-size: 12px">
          格式为 <b style="color: #f56c6c">*</b> 的文件
        </div> -->
            <div class="text-12px upload-tip" style="color: #ccc;margin-top: 5px;">
              格式为
              <span style="color: #ccc">
                {{ accept.map((type) => (type === '*' ? '所有文件' : type)).join('/') }}
              </span>
            </div>
          </template>
        </el-upload>

        <!-- <el-button 
      type="primary" 
      class="ml-5" 
      @click="onUpload"
      :disabled="disabled"
    >
      上传文件
    </el-button> -->
      </div>
      <div class="file-list">
        <div v-for="item in state.dataSource" :key="item.uid" class="file-item">
          <div class="flex items-center">
            <!-- <div class="w-full"> -->
            <div
              class="overflow-hidden whitespace-nowrap text-ellipsis mb-2"
              :style="{ width: `${props.filenameWidth}px` }"
            >
              {{ item.name }}
            </div>
            <!-- <div class="flex gap-4 text-sm mb-2">
              <div>
                大小: <span class="text-blue-500">{{ item.unitSize }}</span>
              </div>
              <div>
                md5:
                <span class="text-red-500">
                  <template v-if="item.md5Progress">
                    {{ `${item.md5Progress}%` }}
                  </template>
                  <template v-else>{{ item.md5 }}</template>
                </span>
              </div>
            </div> -->
            <div class="ml-10px" :style="{ width: `${props.progressWidth}px !important` }">
              <el-progress
                class="upload-progress"
                :percentage="item.progress"
                :status="getProgressStatus(item.status)"
              />
            </div>
            <span class="text-red-500">
              <template v-if="item.md5Progress">
                {{ `${item.md5Progress}%` }}
              </template>
            </span>
            <!-- </div> -->
            <div class="flex">
              <!-- <el-tag :type="getTagType(item.status)">
              {{ tagMap[item.status].text }}
            </el-tag> -->
              <el-button
                v-if="item.status === 'success'"
                type="primary"
                size="small"
                link
                @click="handleDownload(item)"
              >
                下载
              </el-button>
              <el-button
                :disabled="disabled"
                v-if="item.status === 'success' && !disabled"
                type="danger"
                size="small"
                link
                @click="handleDelete(item)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 添加文件项的样式 */
.file-item {
  width: 100%;
  padding: 0 10px;

  /* border-bottom: 1px solid #ebeef5; */

  /* background-color: #fafafa; */

  /* border-radius: 4px; */
}

.file-item:last-child {
  border-bottom: none;
}

.file-list {
  display: flex;
  flex-direction: column;
}

:deep(.upload-progress) {
  .el-progress__text {
    min-width: 20px !important;
  }
}

.wrap-flex-row {
  flex-direction: row !important;
}

.upload-label {
  display: flex;
  align-items: center;
  height: 32px;
  margin-right: 12px;
}

.upload-flex-row {
  > div {
    display: flex;
    align-items: center;
  }

  .upload-tip {
    margin-left: 12px;
  }
}
</style>
