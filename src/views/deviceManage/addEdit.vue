<template>
  <Dialog v-model="dialogVisible" width="900px" :title="dialogTitle">
    <template #title>
      <div class="dialog-header">
        <span><img v-if="dialogTitle === '新增'" src="@/assets/imgs/myUpdate/path2svg.svg"/>
              <img v-else-if="dialogTitle === '编辑'" src="@/assets/imgs/myUpdate/editPath.svg"/>
               <img v-else src="@/assets/imgs/myUpdate/detailPath.svg"/>
          {{dialogTitle}}</span>
      </div>
    </template>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="设备种类" prop="equipmentType">
        <el-select v-model="formData.equipmentType" placeholder="请选择" clearable>
          <el-option
            v-for="dict in useDevice.deviceTypeList"
            :key="dict.id"
            :label="dict.categoryName"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设备名称" prop="equipmentName">
        <el-input
          :disabled="formType === 'verification'"
          v-model="formData.equipmentName"
          placeholder="请输入"
          maxlength="180"
        />
      </el-form-item>
      <el-form-item label="设备型号" prop="equipmentCode">
        <el-input
          :disabled="formType === 'verification'"
          v-model="formData.equipmentCode"
          placeholder="请输入"
          maxlength="40"
        />
      </el-form-item>
      <el-form-item label="上次检定时间" prop="lastCheckTime">
        <el-date-picker
          :disabled="formType === 'verification'"
          v-model="formData.lastCheckTime"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="请选择"
          class="!w-1/1"
        />
      </el-form-item>
      <el-form-item label="检定周期" prop="cycleNum">
        <!-- <el-input
          type="number"
          :min="1"
          v-model="formData.cycleNum"
          placeholder="请输入"
          style="width: 38%; margin-right: 10px"
        /> -->
        <el-input-number
          v-model="formData.cycleNum"
          :min="1"
          :max="99"
          @keydown="channelInputLimit"
          placeholder="请输入"
          style="width: 38%; margin-right: 10px"
        />
        <el-select v-model="formData.cycleType" style="width: 60%" placeholder="请选择" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.INSPECTION_CYCLE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="下次检定时间" prop="nextCheckTime">
        <el-date-picker
          v-model="formData.nextCheckTime"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="请选择"
          class="!w-1/1"
        />
      </el-form-item>
      <el-form-item label="检定记录" prop="attachment1">
        <UploadFileChunk
          class="min-w-80px"
          v-model="formData.attachment1"
          :accept="['doc', 'xls', 'ppt', 'txt', 'pdf', 'jpeg', 'png']"
          :limit="5"
          @success="handleUploadSuccess"
          @remove="handleRemove"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" color="#3F6297" @click="submitForm">
            <Icon icon="ep:document-add" class="mr-1"/>
            保 存</el-button>
          <el-button @click="dialogVisible = false">
             <Icon icon="ep:close" class="mr-1"/>
            取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup>
import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/UploadModal.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as RoleApi from '@/api/system/role'
import { useDeviceStore } from '@/store/modules/device'
import * as DeviceApi from '@/api/device.js'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'SystemRoleForm' })
const { t } = useI18n() // 国际化
const useDevice = useDeviceStore()
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const fileList = ref([])
const formData = ref({
  id: undefined,
  equipmentName: '',
  equipmentCode: '',
  cycleNum: 1,
  cycleType: '',
  attachment1: '',
  attachment: '',
  equipmentType: '',
  lastCheckTime: '',
  nextCheckTime: '',
  equipmentId: undefined
})
const formRules = reactive({
  equipmentName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
  equipmentCode: [{ required: true, message: '设备型号不能为空', trigger: 'change' }],
  cycleNum: [{ required: true, message: '检定周期不能为空', trigger: 'change' }],
  lastCheckTime: [{ required: true, message: '上次检定不能为空', trigger: 'change' }],
  nextCheckTime: [{ required: true, message: '下次检定不能为空', trigger: 'change' }],
  equipmentType: [{ required: true, message: '设备种类不能为空', trigger: 'change' }],
  attachment1: [{ required: true, message: '检定记录不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type, code, id) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  console.log(code)

  resetForm()
  formData.value.equipmentType = code
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await DeviceApi.getDeviceinfoDetail(id)
      formData.value.attachment1 = JSON.parse(formData.value.attachment)
      if (type === 'verification') {
        formData.value.attachment = ''
        formData.value.cycleNum = 1
        formData.value.nextCheckTime = ''
        formData.value.cycleType = ''
        formData.value.attachment1 = ''
      }
    } finally {
      formLoading.value = false
    }
  }
}

const handleUploadSuccess = async (data) => {
  // formData.value.attachment1 = fileList.value
  // 校验表单
  // if (!formRef) return
  // const valid = await formRef.value.validate()
  console.log('file data:', data)
}

const handleRemove = (index) => {
  // fileList.value.splice(index, 1)
}

/** 重置表单 */
const resetForm = () => {
  // fileList.value = []
  formData.value = {
    id: undefined,
    equipmentName: '',
    equipmentCode: '',
    cycleNum: 1,
    cycleType: '',
    attachment: '',
    attachment1: '',
    equipmentType: '',
    lastCheckTime: '',
    nextCheckTime: ''
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
  formData.value.attachment = JSON.stringify(formData.value.attachment1)
  formData.value.attachment1 = undefined
  try {
    if (formType.value === 'create') {
      await DeviceApi.createDeviceInfo(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      if (formType.value === 'verification') {
        let obj = {}
        obj.equipmentId = formData.value.id
        obj.attachment = formData.value.attachment
        obj.cycleNum = +formData.value.cycleNum
        obj.nextCheckTime = formData.value.nextCheckTime
        obj.cycleType = formData.value.cycleType

        await DeviceApi.createVerification(obj)
        message.success('检定成功')
      } else {
        await DeviceApi.updateDeviceInfo(formData.value)
        message.success(t('common.updateSuccess'))
      }
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 自动计算下一次检定时间 */
const calculateNextCheckTime = (cycleType, cycleNum, lastCheckTime) => {
  const lastDate = new Date(lastCheckTime)
  let addedTime
  const dictOptions = getIntDictOptions(DICT_TYPE.INSPECTION_CYCLE)
  if (dictOptions.length !== 3) return lastCheckTime

  switch (cycleType) {
    case dictOptions[0].value: // 周
      addedTime = cycleNum * 7 * 24 * 60 * 60 * 1000 // 周转换为毫秒
      break
    case dictOptions[1].value: // 月
      addedTime = cycleNum * 30 * 24 * 60 * 60 * 1000 // 月转换为毫秒（近似）
      break
    case dictOptions[2].value: // 年
      addedTime = cycleNum * 365 * 24 * 60 * 60 * 1000 // 年转换为毫秒
      break
    default:
      return lastCheckTime
  }

  const nextCheckDate = new Date(lastDate.getTime() + addedTime)
  return nextCheckDate.toISOString().split('T')[0] // 格式化为 YYYY-MM-DD
}
const channelInputLimit = (e) => {
  const key = e.key
  const notAllowList = ['e', '+', '-', '.']
  if (notAllowList.includes(key)) {
    e.returnValue = false
    return false
  }
  return true
}

/** 当上次检定时间、检定周期单位、检定周期数发生变化时，计算下一次检定时间 */
watch(
  () => [formData.value.cycleType, formData.value.cycleNum, formData.value.lastCheckTime],
  ([newCycleType, newCycleNum, newLastCheckTime]) => {
    if (newCycleType && newCycleNum && newLastCheckTime) {
      const isVerification = formType.value === 'verification'
      const _newLastCheckTime = isVerification
        ? formatDate(new Date(), 'YYYY-MM-DD')
        : newLastCheckTime

      formData.value.nextCheckTime = calculateNextCheckTime(
        newCycleType,
        parseInt(newCycleNum),
        _newLastCheckTime
      )
    }
  },
  { immediate: true }
)
</script>
