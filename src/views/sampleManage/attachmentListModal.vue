<template>
  <el-dialog v-model="visible" title="附件列表" width="500px">
    <div class="attachment-list min-h-200px max-h-600px overflow-auto">
      <template v-if="attachmentList.length">
        <div v-for="(item, index) in attachmentList" :key="index" class="py-8px px-20px flex">
          <div class="mr-10px w-400px">
            {{ item.name || item.originFileName }}
          </div>
          <el-button link type="primary" @click="handleDownload(item)"> 下载 </el-button>
        </div>
      </template>
      <el-empty v-else description="暂无附件" />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import download from '@/utils/download'
import { downloadByUrl } from '@/utils/filt'

const visible = ref(false)
const attachmentList = ref([])

const handleDownload = function (file) {
  const fileName = (file.name || file.originFileName) ?? ''
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

const open = (attachment) => {
  try {
    attachmentList.value = JSON.parse(attachment) || []
    visible.value = true
  } catch (error) {
    message.error('附件数据格式错误')
  }
}

defineExpose({
  open
})
</script>
