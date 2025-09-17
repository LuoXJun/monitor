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
    
      <el-form-item label="工程名称" prop="projectId" v-if="formType === 'initiate'">
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
          :disabled="!!materialTypeId"
          v-model="formData.materialType"
          :data="matertiralList"
          :default-expanded-keys="[0]"
          :props="defaultProps"
          check-strictly
          node-key="id"
        />
      </el-form-item>
      <el-form-item label="物探指标" prop="examineName">
        <el-input v-model="formData.examineName" maxlength="180" placeholder="请输入" />
      </el-form-item>
      <!-- <el-form-item label="物探指标" prop="measure">
        <el-input v-model="formData.measure" placeholder="请输入" />
      </el-form-item> -->
      <el-form-item label="流程模型" prop="bpmModelId">
        <el-select v-model="formData.bpmModelId" placeholder="请选择" @change="handleChangeBpmModel" clearable class="!w-240px">
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
      <!-- <el-form-item class="upload-wrap" prop="attachment" label="附件"> -->
      <!-- v-model="attachment" -->
      <!-- @success="handleUploadSuccess"
        @remove="handleRemove" -->
      <!-- <UploadFile
          class="min-w-80px"
          v-model="formData.attachment"
          :file-type="['*']"
          :limit="10"
          :file-size="30"
        /> -->
      <!-- </el-form-item> -->
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
<script setup>
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
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const modelList = ref([]) // 流程模型列表
const projectList = ref([])

const materialTypeId = ref('')
const formData = ref({
  id: undefined,
  projectId: undefined,
  examineProjectId: undefined,
  materialType: '',
  examineName: '',
  measure: '',
  attachment: ''
})
const formRules = reactive({
  projectId: [{ required: true, message: '工程名称不能为空', trigger: 'blur' }],
  materialType: [{ required: true, message: '物探类型不能为空', trigger: 'blur' }],
  examineName: [{ required: true, message: '物探指标不能为空', trigger: 'change' }]
  // measure: [{ required: true, message: '物探指标不能为空', trigger: 'change' }],
  //attachment: [{ required: true, message: '附件不能为空', trigger: 'change' }]
  // version: [{ required: true, message: '版本号不能为空', trigger: 'blur' }]
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
  console.log(resData)
  matertiralList.value = resData
}

/** 打开弹窗 */
const open = async (type, id, materialType) => {
  console.log(id)

  getModelList()
  dialogVisible.value = true
  getTree()

  if (type === 'initiate') {
    dialogTitle.value = '任务发起'
    formData.value.examineProjectId = id
    getProjectTree()
  } else {
    dialogTitle.value = t('action.' + type)
  }

  formType.value = type
  // getProjectTree()

  resetForm()
  formData.value.materialType = materialType
  materialTypeId.value = materialType

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await InspectionItemApi.getExamineProjectDetail(id)
    } finally {
      formLoading.value = false
    }
  }
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
    const data = []
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

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    materialType: '',
    examineName: ''
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
      await InspectionItemApi.createExamineProject({ ...formData.value, businessType: 2 })
      message.success(t('common.createSuccess'))
    } else if (formType.value === 'initiate') {
      const { id, measure, projectId, bpmModelId, attachment } = formData.value ?? {}
      const payload = {
        projectId,
        businessKey: id,
        examineProjectId: id,
        bpmModelId,
        measure,
        attachment: JSON.stringify(attachment),
        examiner: userStore.user?.id
      }
      console.log('payload', payload)
      await TaskApi.createTask(payload)
      // message.success(t('common.updateSuccess'))
      message.success('任务发起成功')
    } else {
      await InspectionItemApi.updateExamineProject(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
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
    modelList.value.map(async (item) => {
      if (item.id === id) {
        const res = await TaskApi.getProcessDefinition({ id: item.processDefinitionId })
        // 处理 res 的逻辑
        console.log(res)
      }
    })
  )
}
</script>
