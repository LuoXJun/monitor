<template>
  <Dialog v-model="dialogVisible" width="650px" :title="dialogTitle">
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
      <el-form-item label="材料类型" prop="materialType">
        <el-tree-select
          :disabled="!!materialTypeId"
          ref="materialTreeRef"
          v-model="formData.materialType"
          :data="matertiralList"
          :default-expanded-keys="[0]"
          :props="defaultProps"
          check-strictly
          node-key="id"
          @change="handleMaterialTypeChange"
        />
      </el-form-item>
      <el-form-item label="检测指标" prop="examineName">
        <el-input v-model="formData.examineName" maxlength="180" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="台账指标" prop="ledgerType">
        <el-select v-model="formData.ledgerType" placeholder="请选择">
          <el-option
            v-for="ite in ledgerManageList"
            :key="ite.code"
            :label="ite.name"
            :value="ite.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="指标配置" prop="propertyList">
        <el-checkbox-group
          class="grid grid-cols-3 max-h-400px overflow-y-auto"
          v-model="formData.propertyList"
        >
          <el-checkbox
            v-for="item in settingList"
            :key="item.propertyKey"
            :value="item"
            :disabled="item.isMust === 1"
          >
            <div class="w-125px overflow-hidden text-ellipsis whitespace-nowrap">{{
              item.propertyName
            }}</div>
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="流程模型" prop="bpmModelId">
        <el-select v-model="formData.bpmModelId" placeholder="请选择" clearable class="!w-240px">
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
      <!-- <el-form-item label="版本号" prop="version">
        <el-input v-model="formData.version" placeholder="请输入" />
      </el-form-item> -->
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
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as RoleApi from '@/api/system/role'
import * as InspectionItemApi from '@/api/inspectionItem'
import { MyProcessViewer } from '@/components/bpmnProcessDesigner/package'
import * as ModelApi from '@/api/bpm/model'
import * as ledgerManage from '@/api/ledgerManage'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'

function flattenTreeDataWithRootName(data) {
  const result = []

  function traverse(node, rootName) {
    const currentRootName = node.parentId === 0 ? node.materialName : rootName

    const { children, ...rest } = node
    result.push({
      ...rest,
      rootMaterialName: currentRootName
    })

    if (children && children.length > 0) {
      children.forEach((child) => traverse(child, currentRootName))
    }
  }

  data?.forEach?.((item) => traverse(item, item.materialName))

  return result
}

defineOptions({ name: 'SystemRoleForm' })

const defaultProps = {
  children: 'children',
  label: 'materialName'
}

const materialTreeRef = ref() // 材料类型树Ref
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const matertiralList = ref([]) // 树形结构
const ledgerManageList = ref([]) // 流程模型列表
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const modelList = ref([]) // 流程模型列表
const materialName = ref('') // 材料类型名称
const commissionOrderFields = ref([]) // 材料类型名称
const prevSelectedPropertyKeys = ref([]) // 上一次选中的配置
const flattenMaterialTreeData = ref([]) // 展平后的材料树数据

const materialTypeId = ref('')
const formData = ref({
  id: undefined,
  materialType: '',
  examineName: '',
  propertyList: []
})
const formRules = reactive({
  materialType: [{ required: true, message: '材料不能类型为空', trigger: 'blur' }],
  examineName: [{ required: true, message: '检测指标不能为空', trigger: 'change' }],
  version: [{ required: true, message: '版本号不能为空', trigger: 'blur' }],
  propertyList: [{ required: true, type: 'array', message: '指标配置不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
/** 流程图的详情按钮操作 */
const bpmnDetailVisible = ref(false)
const bpmnXML = ref(null)
const bpmnControlForm = ref({
  prefix: 'flowable'
})

const settingList = ref([])

const getTree = async () => {
  const resData = await InspectionItemApi.getMaterialTree({ businessType: 1 })
  matertiralList.value = resData
  flattenMaterialTreeData.value = flattenTreeDataWithRootName(resData)
}

/** 打开弹窗 */
const open = async (type, id, materialType) => {
  resetForm()
  await getPropertyList()
  getModelList()
  getLedgerManageList()
  dialogVisible.value = true
  await getTree()
  dialogTitle.value = t('action.' + type)
  formType.value = type

  formData.value.materialType = materialType
  materialTypeId.value = materialType

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await InspectionItemApi.getExamineProjectDetail(id)
      // 确保propertyList存在
      if (!formData.value.propertyList) {
        formData.value.propertyList = []
      }
      // 合并必选项和已选项
      const mandatoryItems = settingList.value.filter((item) => item.isMust === 1)
      const existingItems = formData.value.propertyList.map((item) => {
        return settingList.value.find((setting) => setting.propertyKey === item.propertyKey) || item
      })
      formData.value.propertyList = [
        ...existingItems,
        ...mandatoryItems.filter(
          (item) => !existingItems.some((existing) => existing.propertyKey === item.propertyKey)
        )
      ]
    } finally {
      formLoading.value = false
    }
  }

  setTypePropertyList(materialType)
}

/** 查询流程模型列表 */
const getModelList = async () => {
  try {
    const { list } = await ModelApi.getModelPage({
      pageNo: 1,
      pageSize: 100,
      bizTagList: [DEPARTMENT_BUSINESS_MAP.jc.key],
      publishStatus: 1
    })

    const data = []

    list.forEach((ite) => {
      if (ite.processDefinition?.version) {
        data.push(ite)
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
    examineName: '',
    propertyList: []
  }

  materialName.value = ''
  commissionOrderFields.value = []
  prevSelectedPropertyKeys.value = []
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
      await InspectionItemApi.createExamineProject({ ...formData.value, businessType: 1 })
      message.success(t('common.createSuccess'))
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

const setTypePropertyList = async (id) => {
  const findNode = flattenMaterialTreeData.value.find((item) => item.id === id)
  const { rootMaterialName } = findNode ?? {}

  if (materialName.value !== rootMaterialName) {
    const dicts = await getStrDictOptions(rootMaterialName)

    materialName.value = rootMaterialName
    commissionOrderFields.value = dicts.map((dict) => dict.value)
    const _prevSelectedPropertyKeys = []

    formData.value.propertyList = formData.value.propertyList.filter(
      (item) => !prevSelectedPropertyKeys.value.find((key) => key === item.propertyKey)
    )

    settingList.value.map((item) => {
      if (item.isMust !== 1 && commissionOrderFields.value.includes(item.propertyKey)) {
        formData.value.propertyList.push(item)
        _prevSelectedPropertyKeys.push(item.propertyKey)
      }
    })

    prevSelectedPropertyKeys.value = _prevSelectedPropertyKeys
  }
}

const handleMaterialTypeChange = async (id) => {
  if (!id) {
    return
  }

  let nodeData = materialTreeRef.value.getNode(id)
  const step = nodeData.level - 1

  for (let i = 0; i < step; i++) {
    if (!nodeData.parent) {
      break
    }

    nodeData = nodeData.parent
  }

  const _materialName = nodeData.data?.materialName

  if (materialName.value !== _materialName) {
    const dicts = await getStrDictOptions(_materialName)

    materialName.value = _materialName
    commissionOrderFields.value = dicts.map((dict) => dict.value)
    const _prevSelectedPropertyKeys = []

    formData.value.propertyList = formData.value.propertyList.filter(
      (item) => !prevSelectedPropertyKeys.value.find((key) => key === item.propertyKey)
    )

    settingList.value.map((item) => {
      if (item.isMust !== 1 && commissionOrderFields.value.includes(item.propertyKey)) {
        formData.value.propertyList.push(item)
        _prevSelectedPropertyKeys.push(item.propertyKey)
      }
    })

    prevSelectedPropertyKeys.value = _prevSelectedPropertyKeys
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

// 获取属性配置字段列表
const getPropertyList = async () => {
  settingList.value = await InspectionItemApi.getPropertyList()
  // Auto-select items where isMust = 1
  const mandatoryItems = settingList.value.filter((item) => item.isMust === 1)
  formData.value.propertyList = [...formData.value.propertyList, ...mandatoryItems]
  console.log(
    '🚀 ~ getPropertyList ~ formData.value.propertyList:',
    formData.value,
    settingList.value
  )
}

/** 查询台账指标列表 */
const getLedgerManageList = async () => {
  try {
    const data= await ledgerManage.getLedgerInfoType({
      // pageNo: 1,
      // pageSize: 100,
      // bizTagList: [DEPARTMENT_BUSINESS_MAP.jc.key],
      // publishStatus: 1
    })
    ledgerManageList.value = data
  } finally {
    //
  }
}
</script>
<style lang="scss" scoped>
.moreInfoIcon {
  position: absolute;
  left: 245px;
  cursor: pointer;
}



</style>
