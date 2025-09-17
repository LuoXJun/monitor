<template>
  <Dialog v-model="dialogVisible" title="提交" width="500">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-form-item label="设备名称" prop="equipmentId">
        <el-select
          v-model="formData.equipmentId"
          clearable
          style="width: 100%"
          @change="handelDeviceChange"
        >
          <el-option
            v-for="item in deviceList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备编号" prop="equipmentId">
        <el-input v-model="currentDeviceCode" disabled />
      </el-form-item>
      <el-form-item
        v-for="(item, index) in _approvalTask"
        :label="`${index + 1}级审批人`"
        :prop="item.approvalUser"
        :key="item.approvalUser"
      >
        <el-select v-model="formData[item.approvalUser]" filterable clearable style="width: 100%">
          <el-option
            v-for="opt in userOptions"
            :key="opt.id"
            :label="opt.nickname"
            :value="opt.id"
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
<script name="SubmitFillDataDialogForm" setup>
import { onMounted } from 'vue'
import * as SampleTaskApi from '@/api/task'
import * as DeviceApi from '@/api/device'
import * as UserApi from '@/api/system/user'

const message = useMessage() // 消息弹窗

const props = defineProps({
  approvalInfo: {
    type: Object,
    default() {
      return {
        approvalTask: [],
        approvalUser: {}
      }
    }
  },
  equipmentId: {
    type: Number || undefined,
    default() {
      return undefined
    }
  }
})

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const formData = ref({
  equipmentId: ''
})
const formRules = ref({})
const formRef = ref() // 表单 Ref
const _approvalTask = ref([])
const deviceList = ref([])
const currentDeviceCode = ref('')
const userOptions = ref([])

watch(
  () => props.approvalInfo,
  (value) => {
    if (!value.approvalTask?.length) {
      return
    }

    const { approvalTask = [], approvalUser = {} } = value ?? {}

    _approvalTask.value = [...approvalTask]

    approvalTask.forEach((item, index) => {
      formData.value[item.approvalUser] = ''
      formRules.value[item.approvalUser] = [
        { required: true, message: `${index + 1}级审批人不能为空`, trigger: 'change' }
      ]
    })

    for (const key in approvalUser) {
      formData.value[key] = Number(approvalUser[key])
    }
  },
  { deep: true }
)

watch(
  () => props.equipmentId,
  (value) => {
    if (value) {
      formData.value.equipmentId = value
      return
    }
  }
)

/** 打开弹窗 */
const open = async (params) => {
  if (userOptions.value.length) {
    // resetForm()
    dialogVisible.value = true
    return
  }

  await fetchUserList()
  // resetForm()
  dialogVisible.value = true
}

const close = () => {
  dialogVisible.value = false
  formLoading.value = false
}

defineExpose({ open, close }) // 提供 openModal 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['submit']) // 定义 submit 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) {
    return
  }

  const valid = await formRef.value.validate()

  if (!valid) {
    return
  }

  formLoading.value = true

  const approvalUser = { ...formData.value }
  delete approvalUser.equipmentId
  const newData = { equipmentId: formData.value.equipmentId, approvalUser }

  emit('submit', newData)
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    // TODO: 这里需要写遍历逻辑，但是现在这个交互，可以不用重置表单，减轻用户操作
  }
  formRef.value?.resetFields()
}

const handelDeviceChange = (val) => {
  const device = deviceList.value.find((item) => item.value === val)
  currentDeviceCode.value = device?.equipmentCode ?? ''
}

const fetchUserList = async () => {
  userOptions.value = await UserApi.getSimpleUserList()
}

const fetchDeviceList = async () => {
  const data = await DeviceApi.getDeviceInfoPage({ pageNo: 1, pageSize: 100 })
  deviceList.value = data?.list?.map?.((ite) => ({
    name: ite.equipmentName,
    value: ite.id,
    equipmentCode: ite.equipmentCode
  }))
}

onMounted(() => {
  fetchUserList()
  fetchDeviceList()
})
</script>
