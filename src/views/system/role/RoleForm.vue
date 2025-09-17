<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="角色所属中心" prop="businessType">
        <el-select v-model="formData.businessType" clearable placeholder="请选择角色所属中心">
          <el-option
            v-for="dict in businessTypeList"
            :key="dict.key"
            :label="dict.name"
            :value="dict.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formData.name" maxlength="40" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色标识" prop="code">
        <el-input v-model="formData.code" maxlength="40" placeholder="请输入角色标识" />
      </el-form-item>
      <el-form-item label="显示顺序" prop="sort">
        <el-input v-model="formData.sort" maxlength="99" placeholder="请输入显示顺序" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" clearable placeholder="请选择状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" maxlength="500" placeholder="请输备注" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as RoleApi from '@/api/system/role'

const businessTypeList = [
  {
    key: 'all',
    name: '全部'
  },
  {
    key: 'flw_jc_',
    name: '试验检测中心'
  },
  {
    key: 'flw_wt_',
    name: '物探中心'
  },
  {
    key: 'flw_cl_',
    name: '测量中心'
  }
]

const transFrontValToDbValue = (value) => {
  return value === 'all' ? null : value
}

const transDbValueToFrontVal = (value) => {
  return value === null ? 'all' : value
}

defineOptions({ name: 'SystemRoleForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  businessType: undefined,
  name: '',
  code: '',
  sort: undefined,
  status: CommonStatusEnum.ENABLE,
  remark: ''
})
const formRules = reactive({
  businessType: [{ required: true, message: '角色所属中心不能为空', trigger: 'change' }],
  name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '角色标识不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '显示顺序不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  remark: [{ required: false, message: '备注不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await RoleApi.getRole(id)
      formData.value = { ...data }
      formData.value.businessType = transDbValueToFrontVal(formData.value.businessType)
    } finally {
      formLoading.value = false
    }
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    businessType: undefined,
    name: '',
    code: '',
    sort: undefined,
    status: CommonStatusEnum.ENABLE,
    remark: ''
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
    const data = formData.value as unknown as RoleApi.RoleVO
    data.businessType = transFrontValToDbValue(formData.value.businessType)
    if (formType.value === 'create') {
      await RoleApi.createRole(data)
      message.success(t('common.createSuccess'))
    } else {
      await RoleApi.updateRole(data)
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
