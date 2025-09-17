<template>
  <Dialog v-model="dialogVisible" width="800px" :title="dialogTitle" @close="handleClose">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="工程名称" prop="projectId">
        <el-tree-select
          v-model="formData.projectId"
          :data="projectList"
          :default-expanded-keys="[0]"
          :props="defaultProps2"
          check-strictly
          style="width: 100%"
          node-key="id"
        />
      </el-form-item>
      <el-form-item label="物探类型" prop="materialType">
        <el-tree-select
          v-model="formData.materialType"
          :data="matertiralList"
          :default-expanded-keys="[0]"
          :props="defaultProps"
          check-strictly
          node-key="id"
          clearable
          @change="handleMaterialTypeChange"
        />
      </el-form-item>
      <el-form-item label="物探指标" prop="examineProjectId">
        <el-select
          v-model="formData.examineProjectId"
          placeholder="请选择"
          clearable
          @change="handleExamineProjectChange"
        >
          <el-option
            v-for="dict in itemList"
            :key="dict.id"
            :label="dict.examineName"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="流程模型" prop="bpmModelId">
        <el-select
          v-model="formData.bpmModelId"
          placeholder="请选择"
          clearable
          class="!w-240px"
          @change="handleChangeBpmModel"
        >
          <el-option v-for="ite in modelList" :key="ite.id" :label="ite.name" :value="ite.id" />
        </el-select>
        <el-tooltip effect="dark" content="点击查看流程模型" placement="top">
          <Icon
            icon="ep:info-filled"
            class="moreInfoIcon"
            title="点击查看流程模型"
            @click="handleBpmnDetail(formData.bpmModelId)"
          />
        </el-tooltip>
      </el-form-item>

      <el-form-item label="下一节点处理人" prop="userId" v-if="showNext">
        <el-select
          v-model="formData.userId"
          placeholder="请选择"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="dict in userList"
            :key="dict.id"
            :label="dict.nickname"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="upload-wrap" prop="attachment" label="附件">
        <!-- @remove="handleRemove" -->
        <UploadFileChunk
          class="min-w-80px"
          v-model="formData.attachment"
          :accept="['*']"
          :limit="100"
          :limitFileSize="false"
          @before-upload="handleBeforeUpload"
          @success="handleUploadSuccess"
          @error="handleUploadError"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading || submitBtnLoading" type="primary" @click="submitForm"
        >确 定</el-button
      >
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
  <!-- 弹窗：流程模型图的预览 -->
  <Dialog title="流程图" v-model="bpmnDetailVisible" width="800">
    <MyProcessViewer
      class="customPv"
      key="designer"
      v-model="bpmnXML"
      :value="bpmnXML"
      v-bind="bpmnControlForm"
      :prefix="bpmnControlForm.prefix"
    />
  </Dialog>
</template>
<script setup lang="ts">
import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/UploadModal.vue'
import { MyProcessViewer } from '@/components/bpmnProcessDesigner/package'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { useUserStore } from '@/store/modules/user'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import * as RoleApi from '@/api/system/role'
import * as InspectionItemApi from '@/api/inspectionItem'
import * as ModelApi from '@/api/bpm/model'
import * as ItemApi from '@/api/itemManage'
import * as TaskApi from '@/api/task'
import * as SampleApi from '@/api/sample'
const userList = ref([])

defineOptions({ name: 'SystemRoleForm' })

const userStore = useUserStore()

const defaultProps = {
  children: 'children',
  label: 'materialName'
}

const defaultProps2 = {
  children: 'children',
  label: 'projectName'
}

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const matertiralList = ref([]) // 树形结构
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const submitBtnLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const modelList = ref<any[]>([]) // 流程模型列表
const projectList = ref([])
const itemList = ref([])

const formData = ref({
  projectId: '',
  materialType: '',
  examineProjectId: '',
  bpmModelId: '',
  attachment: '',
  userId: ''
})
const formRules = reactive({
  projectId: [{ required: true, message: '工程名称不能为空', trigger: 'change' }],
  materialType: [{ required: true, message: '物探类型不能为空', trigger: 'change' }],
  examineProjectId: [{ required: true, message: '物探指标不能为空', trigger: 'change' }],
  bpmModelId: [{ required: true, message: '流程模型不能为空', trigger: 'change' }],
  attachment: [{ required: true, message: '附件不能为空', trigger: 'change' }],
  userId: [{ required: true, message: '下一节点处理人不能为空', trigger: 'change' }]
})

const formRef = ref() // 表单 Ref

/** 流程图的详情按钮操作 */
const bpmnDetailVisible = ref(false)
const bpmnXML = ref(null)
const bpmnControlForm = ref({
  prefix: 'flowable'
})

const getTree = async () => {
  const resData = await InspectionItemApi.getMaterialTree({ businessType: 2 })
  matertiralList.value = resData
}
const getUserList = async () => {
  const res = await SampleApi.getUserListNoPage()
  userList.value = res
}
/** 打开弹窗 */
const open = async (type) => {
  dialogTitle.value = '任务发起'
  dialogVisible.value = true
  showNext.value = false
  getTree()
  getModelList()
  getProjectTree()
  fetchItemList()
  resetForm()
  getUserList()
}

const fetchItemList = async (data) => {
  const res = await InspectionItemApi.getExamineProjectWtList({
    materialType: formData.value?.materialType
  })
  itemList.value = res
}

const getProjectTree = async () => {
  const data = await ItemApi.getItemList()
  projectList.value = data
}

/** 查询流程模型列表 */
const getModelList = async () => {
  try {
    const { list } = await ModelApi.getModelPage({
      pageNo: 1,
      pageSize: 100,
      bizTagList: [DEPARTMENT_BUSINESS_MAP.wt.key],
      publishStatus: 1
    })

    const data: any[] = []
    list.forEach((ite) => {
      if (ite.processDefinition?.version) {
        data.push({
          id: ite.id,
          processDefinitionId: ite.processDefinition.id,
          name: ite.name,
          key: ite.key
        })
      }
    })

    modelList.value = data
  } finally {
    //
  }
}

const handleMaterialTypeChange = (val) => {
  formData.value.examineProjectId = ''
  fetchItemList()
}

const handleExamineProjectChange = (val) => {
  const hitProject = itemList.value?.find((ite) => ite.id === val)

  if (hitProject) {
    formData.value.bpmModelId = hitProject.bpmModelId
  }
  handleChangeBpmModel(formData.value.bpmModelId)
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    projectId: '',
    examineProjectId: '',
    materialType: '',
    bpmModelId: '',
    attachment: '',
    userId: ''
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
    const { examineProjectId, projectId, bpmModelId, attachment, userId } = formData.value ?? {}
    const payload = {
      projectId,
      businessKey: examineProjectId,
      examineProjectId,
      bpmModelId,
      attachment: JSON.stringify(attachment),
      examiner: userStore.user?.id,
      variables: {
        [uploadKey]: [userId]
      }
    }

    await TaskApi.createTask(payload)

    message.success('任务发起成功')
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const handleBeforeUpload = () => {
  submitBtnLoading.value = true
}

const handleUploadSuccess = (fileInfo) => {
  // formLoading.value = false
  console.log('上传成功:', fileInfo)

  const hasUploadingFiles = (fileInfo ?? [])?.filter((file) => !file || !file.url)

  if (!hasUploadingFiles.length) {
    submitBtnLoading.value = false
  }

  // 手动触发表单验证
  formRef.value?.validateField('attachment')
}
const handleUploadError = () => {
  submitBtnLoading.value = false
}

const handleBpmnDetail = async (id) => {
  if (!id) {
    return message.warning('请先选择流程模型')
  }

  const data = await ModelApi.getModel(id)
  bpmnXML.value = data.bpmnXml || ''
  bpmnDetailVisible.value = true
}

const handleChangeBpmModel = async (id) => {
  console.log('handleChangeBpmModel', id)
  await Promise.all(
    modelList.value.map(async (ite) => {
      if (ite.id === id) {
        const res = await TaskApi.getProcessDefinition({ id: ite.processDefinitionId })
        // 处理 res 的逻辑
        checkMine(res, ite.key)
      }
    })
  )
}
let uploadKey = undefined
const showNext = ref(false)
// 初始提交下一节点处理人
const checkMine = function (res, key) {
  if (!res.nodeUserSelectTasks) {
    console.error('nodeUserSelectTasks is undefined')
    return
  }

  const firstTask = res.nodeUserSelectTasks.find((item) => item.id !== key)
  if (!firstTask) {
    console.error('No task found with id different from', key)
    return
  }

  uploadKey = firstTask.id
  if (firstTask.isSelectUser) {
    showNext.value = true
  } else {
    showNext.value = false
  }
}

const handleClose = () => {
  formLoading.value = false
  submitBtnLoading.value = false
}
</script>
<style lang="scss" scoped>
.moreInfoIcon {
  position: absolute;
  left: 245px;
  cursor: pointer;
}
</style>
