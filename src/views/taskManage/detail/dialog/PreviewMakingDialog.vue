<template>
  <el-dialog v-model="dialogVisible" title="" :width="450" :show-close="false">
    <template #header><div></div></template>
    <div class="loading-content">
      <!-- <div>
        <Icon icon="ep:loading" class="is-loading" :size="60" />
      </div> -->
      <div class="tip">正在生成预览</div>
    </div>
  </el-dialog>
  <!-- <Dialog v-model="dialogVisible" title="" :width="450" :show-close="false">
    <template #header><div></div></template>
    <div class="loading-content">正在生成预览</div>
  </Dialog> -->
</template>
<script setup>
defineOptions({ name: 'PreviewMakingDialog' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
}

/** 打开弹窗 */
const close = async () => {
  dialogVisible.value = false
}

defineExpose({ open, close }) // 提供 open 方法，用于打开弹窗
</script>
<style lang="scss" scoped>
.loading-content {
  display: flex;
  flex-direction: column;
  height: 120px;
  justify-content: center;
  align-items: center;

  .tip {
    font-size: 22px;
  }
}
</style>
