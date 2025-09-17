<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-form-item label="任务类型" prop="siloId">
        <el-select v-model="formData.siloStatus" placeholder="请选择" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="工程名称" prop="siloName">
        <el-select v-model="formData.siloName" placeholder="请选择" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="材料类型" prop="siloLocation">
        <el-select v-model="formData.siloLocation" placeholder="请选择" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="检验项" prop="siloLocation">
        <el-select v-model="formData.siloLocation" placeholder="请选择" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="样品编号" prop="siloLocation">
        <el-select v-model="formData.siloLocation" placeholder="请选择" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="样品名称" prop="name">
        <el-input :disabled="true" v-model="formData.name" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="试验人" prop="siloLocation">
        <el-select v-model="formData.siloLocation" placeholder="请选择" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

// import * as MaterialApi from '@/api/material'
import * as PostApi from '@/api/system/post'
defineOptions({ name: 'SystemRoleForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  siloStatus: '',
  sampleNumber: '',
  siloName: '',
  siloId: '',
  siloReserves: '',
  name: '',
  siloReservesUplimit: '',
  siloReservesDownlimit: '',
  filePath: ''
})
const formRules = reactive({
  siloId: [{ required: true, message: '委托单位不能为空', trigger: 'change' }],
  siloStatus: [{ required: true, message: '委托不能为空', trigger: 'change' }],
  siloName: [{ required: true, message: '受检单位不能为空', trigger: 'change' }],
  name: [{ required: true, message: '工程名称不能为空', trigger: 'change' }],
  siloReserves: [{ required: true, message: '样品名称不能为空', trigger: 'blur' }],
  sampleNumber: [{ required: true, message: '样品编号不能为空', trigger: 'blur' }],
  siloReservesUplimit: [{ required: true, message: '材料种类不能为空', trigger: 'change' }],
  siloReservesDownlimit: [{ required: true, message: '送检人不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type, id) => {
  resetForm()
  dialogVisible.value = true
  if (type === 'initiate') {
    dialogTitle.value = '发起'
  } else {
    dialogTitle.value = t('action.' + type)
  }

  formType.value = type

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await PostApi.getPost(id)
    } finally {
      formLoading.value = false
    }
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    siloName: '',
    siloId: '',
    siloReserves: '',
    siloLocation: '',
    siloReservesUplimit: '',
    siloReservesDownlimit: ''
  }
  formRef.value?.resetFields()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await MaterialApi.createMaterial(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await MaterialApi.updateMaterial(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
