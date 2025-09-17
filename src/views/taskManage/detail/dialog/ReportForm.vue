<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" :width="1200" class="report-custom-dialog">
    <div class="content">
      <div class="left">
        <object class="pdf-wrap" type="application/pdf" :data="pdfUrl"></object>
      </div>
      <!-- <div class="right">右边</div> -->
    </div>
    <!-- <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template> -->
  </Dialog>
</template>
<script setup>
import { PRINT_LAYOUT_MAP, PRINT_OPTIONS } from '@/components/luckysheet/constants/print'

defineOptions({ name: 'ReportForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('打印设置') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const pdfUrl = ref()

const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (_pdfUrl) => {
  // resetForm()
  pdfUrl.value = _pdfUrl
  dialogVisible.value = true
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    layout: PRINT_LAYOUT_MAP.portrait.key
  }

  formRef.value?.resetFields()
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['submit']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return

  const valid = await formRef.value.validate()

  if (!valid) return

  // 提交请求
  formLoading.value = true

  try {
    // TODO: ????
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('submit', formData.value)
  } finally {
    formLoading.value = false
  }
}
</script>
<style lang="scss" scoped>
.report-custom-dialog {
  // height: 80vh !important;
}

.content {
  display: flex;
  height: calc(100vh - 32px - 24px - 30px) !important;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .left {
    flex: 1;
    // width: 70%;
    height: 100%;
    // background-color: red;

    .pdf-wrap {
      width: 100%;
      height: 100%;
    }
  }

  .right {
    // flex: 1;
    width: 30%;
    height: 100%;
    // background-color: blue;
  }
}

.printForm {
  width: 300px;
  margin: 0 auto;
}
</style>
