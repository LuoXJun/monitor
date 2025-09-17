<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { CHUNK_SIZE } from './constants'
import { convertFileSizeUnit, downloadFileByBlob } from './util/fileUtil'
import { chunkDownloadFile, fetchFileList } from './services/apis'
import type { FilesType } from './services/apis/typing'
import { downloadByUrl } from '@/utils/filt'
import download from '@/utils/download'

type DownloadStatus = {
  progress?: number
  status?: 'downloading' | 'pause' | 'error'
}
type FileDataType = FilesType & DownloadStatus

// 添加 props 定义
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const state = reactive<{ dataSource: FileDataType[]; blobRef: Map<number, BlobPart[]> }>({
  dataSource: [],
  blobRef: new Map<number, BlobPart[]>()
})

// 监听 modelValue 的变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue.length > 0) {
      state.dataSource = newValue.map((item) => {
        item.name = item.name || item.originFileName
        return item
      })
    }
  }
)

// onMounted(async () => {
//   console.log('onMounted---', props.modelValue)
//   const data = await fetchFileList()
//   data.length > 0 && (state.dataSource = data)
// })

// 普通下载方法
const downloadFile = function (file) {
  const fileName = file.originFileName || file.name
  const lastDotIndex = fileName.lastIndexOf('.')
  const fileExtension =
    lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : ''
    if(fileExtension == 'txt'){
      download.txt(file.url, fileName)
    } else{
      downloadByUrl({
        url: file.url,
        target: '_blank',
        fileName: fileName
      })
    }
}

// 分片下载文件
// const downloadFile = async (record: FileDataType) => {
//   const index = state.dataSource.findIndex((item) => item.id === record.id)
//   state.dataSource[index].status = 'downloading'

//   const totalChunks = Math.ceil(record.size / CHUNK_SIZE) // 请求次数，可自定义调整分片大小，这里默认了上传分片大小
//   // 如果是暂停，根据已下载的，找到断点，偏移长度进行下载
//   const offset = state.blobRef.get(record.id)?.length || 0

//   for (let i = offset + 1; i <= totalChunks; i++) {
//     // 暂停/错误 终止后续请求
//     if (state.dataSource[index].status !== 'downloading') return

//     const start = CHUNK_SIZE * (i - 1)
//     let end = CHUNK_SIZE * i - 1
//     if (end > record.size) end = record.size // 虽然超出不会影响内容读取，但是会影响进度条的展示

//     try {
//       const res = await chunkDownloadFile(record.id, `bytes=${start}-${end}`)
//       const currentDataBlob = state.blobRef.get(record.id) || []
//       // 记录当前数据的分片 blob
//       state.blobRef.set(record.id, [...currentDataBlob, res as unknown as BlobPart])
//       state.dataSource[index].progress = Math.floor((end / record.size) * 100)
//     } catch (error) {
//       state.dataSource[index].status = 'error'
//       return
//     }
//   }

//   state.dataSource[index].status = undefined // 重置状态
//   state.dataSource[index].progress = undefined // 重置进度条
//   const blob = new Blob(state.blobRef.get(record.id))
//   downloadFileByBlob(blob, record.originFileName)
// }

// 暂停下载
const puaseDownload = (record: FileDataType) => {
  record.status = 'pause'
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center " v-for="(item, index) in state.dataSource" :key="index">
      <span class="file-name">{{ item.name }}</span>
      <div class="ml-10px cursor-pointer">
        <div @click="downloadFile(item)" style="color: rgb(74 163 255 / 100%)">下载 </div>
      </div>
      <!-- <div class="ml-10px">
        <el-button link type="danger" v-if="!disabled" @click="handleRemove(row.file)">
          删除</el-button
        >
      </div> -->
    </div>
  </div>
  <!-- <el-table :data="state.dataSource">
    <el-table-column prop="id" label="主键id"  />
    <el-table-column prop="name" label="原文件名" show-overflow-tooltip /> -->
  <!-- <el-table-column prop="object" label="object" show-overflow-tooltip /> -->
  <!-- <el-table-column label="文件大小" >
      <template #default="{ row }">{{ convertFileSizeUnit(row.size) }}</template>
    </el-table-column> -->
  <!-- <el-table-column label="下载进度">
      <template #default="{ row }">
        <el-progress v-if="row.progress" :percentage="row.progress" />
      </template>
    </el-table-column> -->
  <!-- <el-table-column label="操作" >
      <template #default="{ row }">
        <template v-if="row.status === undefined || row.status === 'error'">
          <el-button type="primary" size="small" @click="downloadFile(row)">
            下载
          </el-button>
        </template>
        <template v-else>
          <el-button
            v-if="row.status === 'downloading'"
            type="primary"
            size="small"
            @click="puaseDownload(row)"
          >
            暂停下载
          </el-button>
          <el-button v-else size="small" type="primary" @click="downloadFile(row)">
            继续下载
          </el-button>
        </template>
      </template>
    </el-table-column>
  </el-table> -->
</template>

<style scoped></style>
