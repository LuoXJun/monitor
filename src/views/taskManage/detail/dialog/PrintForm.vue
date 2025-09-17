<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" :width="450">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      class="printForm"
    >
      <el-form-item label="打印范围" prop="range">
        <el-radio-group v-model="formData.range">
          <el-radio v-for="item in PRINT_RANGE_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="打印方向" prop="layout" v-if="false">
        <el-select v-model="formData.layout" placeholder="请选择打印方向">
          <el-option
            v-for="item in PRINT_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup>
import {
  PRINT_LAYOUT_MAP,
  PRINT_OPTIONS,
  PRINT_RANGE_MAP,
  PRINT_RANGE_OPTIONS
} from '@/components/luckysheet/constants/print'

defineOptions({ name: 'PrintForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('打印设置') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  layout: PRINT_LAYOUT_MAP.landscape.key,
  range: PRINT_RANGE_MAP.current.key
})
const formRules = reactive({
  layout: [{ required: true, message: '打印方向不能为空', trigger: 'change' }],
  range: [{ required: true, message: '打印范围不能为空', trigger: 'change' }]
})

const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async () => {
  resetForm()
  dialogVisible.value = true
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    layout: PRINT_LAYOUT_MAP.landscape.key,
    range: PRINT_RANGE_MAP.current.key
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

  if (formData.value.range === PRINT_RANGE_MAP.all.key) {
    // togglePreviewMaking()
  }

  try {
    // dialogVisible.value = false

    // 发送操作成功的事件
    emit('submit', formData.value)
  } finally {
    formLoading.value = false
  }
}
</script>
<style lang="scss" scoped>
.printForm {
  width: 300px;
  margin: 0 auto;
}
</style>
