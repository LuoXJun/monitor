<template>
  <Dialog
    v-model="dialogVisible"
    :resetFullScreenOnClose="true"
    :title="dialogTitle"
    :width="fileUrl.includes('pdf') ? '80vw' : '55vw'"
    @toggle-full="handleToggleFull"
    @update:is-fullscreen="handleToggleFull"
  >
    <div>
      <vue-office-excel
        v-if="fileUrl.includes('xlsx')"
        :src="fileUrl"
        :style="isFullDialog ? FULL_HEIGHT : DEFAULT_STYLE"
      />
      <vue-office-docx
        v-else-if="fileUrl.includes('docx')"
        :src="fileUrl"
        :style="isFullDialog ? FULL_HEIGHT : DEFAULT_STYLE"
      />
      <vue-office-pdf
        v-else-if="fileUrl.includes('pdf')"
        :src="fileUrl"
        :style="isFullDialog ? FULL_HEIGHT : DEFAULT_STYLE"
      />
      <div
        class="img-wrap"
        :style="isFullDialog ? FULL_HEIGHT : { ...DEFAULT_STYLE, overflowY: 'auto' }"
        v-else-if="
          fileUrl.includes('jpg') ||
          fileUrl.includes('png') ||
          fileUrl.includes('jpeg') ||
          fileUrl.includes('gif')
        "
      >
        <img :src="fileUrl" style="width: 100%; height: auto" />
      </div>
      <div class="text-center" v-else>该文件格式不支持预览!</div>
    </div>
  </Dialog>
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

import VueOfficeExcel from '@vue-office/excel'
//引入相关样式
import '@vue-office/excel/lib/index.css'
import VueOfficeDocx from '@vue-office/docx'
//引入相关样式
import '@vue-office/docx/lib/index.css'
import VueOfficePdf from '@vue-office/pdf'

const DEFAULT_STYLE = {
  height: '80vh'
}

const FULL_HEIGHT = {
  height: 'calc(100vh - 32px - 24px - 30px)'
}

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const fileUrl = ref('')
const dialogVisible = ref(false) // 弹窗的是否展示

const dialogTitle = ref('文件预览')
const formRef = ref() // 表单 Ref
const isFullDialog = ref(false)

/** 打开弹窗 */
const open = async (link) => {
  console.log(link)

  fileUrl.value = link
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const handleToggleFull = async (isFull) => {
  isFullDialog.value = isFull
  console.log('🚀 ~ handleToggleFull ~ isFull:', isFull)
  await nextTick()

  const myEvent = new Event('resize')

  window.dispatchEvent(myEvent)
}
</script>
<style lang="scss" scoped>
.img-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.text-center {
  padding: 30px 0;
  font-size: 18px;
  text-align: center;
}
</style>
