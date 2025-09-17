<template>
  <Dialog v-model="dialogVisible" :width="dialogWidth" :title="dialogTitle" @close="handleClose">
     <template #title>
      <div class="dialog-header">
        <span><img v-if="dialogTitle === '新增'" src="@/assets/imgs/myUpdate/path2svg.svg"/>
              <img v-else-if="dialogTitle === '编辑' || dialogTitle === '编辑新增'" src="@/assets/imgs/myUpdate/editPath.svg"/>
               <img v-else src="@/assets/imgs/myUpdate/detailPath.svg"/>
          {{dialogTitle}}</span>
      </div>
    </template>
    <div class="h-80vh overflow-y-auto">
      <div ref="formContainer" :class="formData.propertyList?.length > 0 ? 'w-60%' : 'w-100%'">
        <el-form
          ref="formRef"
          v-loading="formLoading"
          :model="formData"
          :style="{ paddingRight: '25px' }"
        >
          <el-row
            v-for="item in formData?.dynamicData"
            type="flex"
            justify="space-between"
            :key="item.key"
            :span="24"
          >
            <el-col :span="24">
              <div class="edit-title">
                {{ editTitle(item.tableName) }}
                
              </div></el-col
            >
            <el-collapse v-model="activeNames" @change="handleChange">
              <el-collapse-item name="1">
                <template #title="{ isActive }">
                  <div :class="['title-wrapper', { 'is-active': isActive }]"> 自填 </div>
                </template>
                <el-row type="flex" :span="24" justify="space-between">
                  <el-col v-for="(ite, index) in dataHeaderself" :key="index" :span="11">
                    <el-form-item
                      :label="ite.value.name"
                      :rules="
                        ite.value.enableNull == 0
                          ? {
                              required: true,
                              message: ite.value.name + '不能为空',
                              trigger: ['blur', 'change']
                            }
                          : { required: false }
                      "
                      :prop="'dynamicData[' + ite.sourceIndex + '].data[' + ite.value.code + ']'"
                    >
                      <el-select
                        v-model="item.data[ite.value.code]"
                        v-if="ite.value.name == '检测仪器和设备'"
                        placeholder="请选择"
                        :filter-method="filterinstrumentsAndEquipment"
                        multiple
                        clearable
                        filterable
                      >
                        <el-option
                          v-for="dict in instrumentsAndEquipment"
                          :key="dict.value"
                          :label="dict.label"
                          :value="dict.value"
                        />
                      </el-select>
                      <el-input
                        v-else-if="item.data && ite.value.dataType === 'VARCHAR'"
                        v-model="item.data[ite.value.code]"
                        placeholder="请输入"
                        maxlength="40"
                      />
                      <el-date-picker
                        v-else-if="item.data && ite.value.dataType === 'DATE'"
                        v-model="item.data[ite.value.code]"
                        type="date"
                        placeholder="请选择"
                        format="YYYY.MM.DD"
                        value-format="YYYY.MM.DD"
                        class="!w-100%"
                        maxlength="40"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>
              <el-collapse-item name="3">
                <template #title="{ isActive }">
                  <div class="dflex jcsb w100 alignic">
                    <span :class="['title-wrapper', { 'is-active': isActive }]">设备</span>
                    <el-button
                      type="primary"
                      class="mright15"
                      color="rgba(45, 77, 126, 1)"
                      size="small"
                      @click.stop="getDeviceData"
                      >获取设备数据</el-button
                    >
                  </div>
                </template>
                <el-row type="flex" :span="24" justify="space-between">
                  <el-col v-for="(ite, index) in dataHeaderdevice" :key="index" :span="11">
                    <el-form-item
                      :label="ite.value.name"
                      :rules="
                        ite.value.enableNull == 0
                          ? {
                              required: true,
                              message: ite.value.name + '不能为空',
                              trigger: ['blur', 'change']
                            }
                          : { required: false }
                      "
                      :prop="'dynamicData[' + ite.sourceIndex + '].data[' + ite.value.code + ']'"
                    >
                      <el-select
                        v-model="item.data[ite.value.code]"
                        v-if="ite.value.name == '检测仪器和设备'"
                        placeholder="请选择"
                        :filter-method="filterinstrumentsAndEquipment"
                        multiple
                        clearable
                        filterable
                      >
                        <el-option
                          v-for="dict in instrumentsAndEquipment"
                          :key="dict.value"
                          :label="dict.label"
                          :value="dict.value"
                        />
                      </el-select>
                      <el-input
                        v-else-if="item.data && ite.value.dataType === 'VARCHAR'"
                        v-model="item.data[ite.value.code]"
                        placeholder="请输入"
                        maxlength="40"
                      />
                      <el-date-picker
                        v-else-if="item.data && ite.value.dataType === 'DATE'"
                        v-model="item.data[ite.value.code]"
                        type="date"
                        placeholder="请选择"
                        format="YYYY.MM.DD"
                        value-format="YYYY.MM.DD"
                        class="!w-100%"
                        maxlength="40"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>
              <el-collapse-item name="2">
                <template #title="{ isActive }">
                  <div class="dflex jcsb w100 alignic">
                    <span :class="['title-wrapper', { 'is-active': isActive }]">计算</span>
                    <el-button
                      type="primary"
                      class="mright15"
                      color="rgba(45, 77, 126, 1)"
                      size="small"
                      @click.stop="calAndSave()"
                      >保存计算</el-button
                    >
                  </div>
                </template>
                <el-row type="flex" :span="24" justify="space-between">
                  <el-col v-for="(ite, index) in dataHeadercount" :key="index" :span="11">
                    <el-form-item
                      :label="ite.value.name"
                      :rules="
                        ite.value.enableNull == 0
                          ? {
                              required: true,
                              message: ite.value.name + '不能为空',
                              trigger: ['blur', 'change']
                            }
                          : { required: false }
                      "
                      :prop="'dynamicData[' + ite.sourceIndex + '].data[' + ite.value.code + ']'"
                    >
                      <el-select
                        v-model="item.data[ite.value.code]"
                        v-if="ite.value.name == '检测仪器和设备'"
                        placeholder="请选择"
                        :filter-method="filterinstrumentsAndEquipment"
                        multiple
                        clearable
                        filterable
                      >
                        <el-option
                          v-for="dict in instrumentsAndEquipment"
                          :key="dict.value"
                          :label="dict.label"
                          :value="dict.value"
                        />
                      </el-select>
                      <el-input
                        v-else-if="item.data && ite.value.dataType === 'VARCHAR'"
                        v-model="item.data[ite.value.code]"
                        placeholder="请输入"
                        maxlength="40"
                      />
                      <el-date-picker
                        v-else-if="item.data && ite.value.dataType === 'DATE'"
                        v-model="item.data[ite.value.code]"
                        type="date"
                        placeholder="请选择"
                        format="YYYY.MM.DD"
                        value-format="YYYY.MM.DD"
                        class="!w-100%"
                        maxlength="40"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>
            </el-collapse>
            <!-- <div>
              <el-col v-for="(ite, index) in dataHeader" :key="index" :span="11">
                <el-form-item
                  :label="ite.value.name"
                  :rules="
                    ite.value.enableNull == 0
                      ? {
                          required: true,
                          message: ite.value.name + '不能为空',
                          trigger: ['blur', 'change']
                        }
                      : { required: false }
                  "
                  :prop="'dynamicData[' + ite.sourceIndex + '].data[' + ite.value.code + ']'"
                >
                  <el-select
                    v-model="item.data[ite.value.code]"
                    v-if="ite.value.name == '检测仪器和设备'"
                    placeholder="请选择"
                    :filter-method="filterinstrumentsAndEquipment"
                    multiple
                    clearable
                    filterable
                  >
                    <el-option
                      v-for="dict in instrumentsAndEquipment"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                  </el-select>
                  <el-input
                    v-else-if="item.data && ite.value.dataType === 'VARCHAR'"
                    v-model="item.data[ite.value.code]"
                    placeholder="请输入"
                    maxlength="40"
                  />
                  <el-date-picker
                    v-else-if="item.data && ite.value.dataType === 'DATE'"
                    v-model="item.data[ite.value.code]"
                    type="date"
                    placeholder="请选择"
                    format="YYYY.MM.DD"
                    value-format="YYYY.MM.DD"
                    class="!w-100%"
                    maxlength="40"
                  />
                </el-form-item>
              </el-col>
            </div> -->
          </el-row>
        </el-form>
      </div>
    </div>
    <template #footer>
      <el-button :disabled="formLoading || submitBtnLoading" color="#3F6297" @click="submitForm">
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
import { is, isNil, isEmpty, either } from 'ramda'
import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/UploadModal.vue'
import { nextTick, ref, computed } from 'vue'
import { MyProcessViewer } from '@/components/bpmnProcessDesigner/package'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import * as ledgerManage from '@/api/ledgerManage'
import * as SampleApi from '@/api/sample'
import * as ItemApi from '@/api/itemManage'
import * as ModelApi from '@/api/bpm/model'
import * as TaskApi from '@/api/task'
import * as SqlApi from '@/api/sql'
import dayjs from 'dayjs'

import * as InspectionItemApi from '@/api/inspectionItem'
import rules from '@/components/bpmnProcessDesigner/src/modules/rules'

const ORDER_FORM_KEY_MAP = {
  factoryNumber: {
    key: 'factoryNumber',
    name: '出厂编号'
  },
  examineContext: {
    key: 'examineContext',
    name: '检测内容'
  },
  designParam: {
    key: 'designParam',
    name: '设计参数'
  },
  examineDeptId: {
    key: 'examineDeptId',
    name: "'检测单位id"
  }
}

const isNilOrEmpty = either(isNil, isEmpty)

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

// 添加试验标准选项
const examineBasisOptions = ref([])
const judgeStandardOptions = ref([])
const instrumentsAndEquipment = ref([])
const sampleStatusOptions = ref([])
const handleResultOptions = ref([])
const reportSendTypeOptions = ref([])

const taskTypeList = ref([
  {
    name: '委托',
    value: '1'
  },
  {
    name: '自检',
    value: '2'
  }
])

const materialList = ref([])
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；
// 2）提交的按钮禁用
const submitBtnLoading = ref(false)
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const deptList = ref([])
const projectList = ref([])
const fileList = ref([])
const fileRef = ref(null)
const originalProperty = ref([])
const editTitleList = ref([])

const itemList = ref([])
const formData = reactive({
  sampleCode: '',
  sampleName: '',
  projectId: '', // 工程名称
  examineProjectId: undefined, // 检测指标
  examineContext: '', // 检测内容
  designParam: '', // 设计参数
  materialId: '', // 物料种类ID
  delegateUnitId: '', // 委托单位ID
  examineUnitId: '', // 受检单位ID
  inputDate: '', // 收样日期
  attachment1: '', // 附件
  attachment: '', // 附件
  taskType: '', // 检测类别
  sendExaminer: undefined, // 收样人
  examiner: undefined, // 检测人
  equipmentId: '', // 设备ID
  bpmModelId: undefined,
  propertyList: [],
  delegateNo: '', // 委托编号
  takeAddress: '', // 取样地点
  address: '', // 详细地址
  projectPartId: '', // 工程部位
  samplingQuantity: '', // 抽样数量
  sampleCategory: '', // 品种
  factory: '', // 厂家
  factoryNumber: '', // 出厂编号
  sampleStatus: [], // 样品状态
  modelNo: '', // 规格型号
  representQuantity: '', // 代表数量
  examineBasis: [], // 试验标准
  judgeStandard: [], // 评定标准
  receivePerson: '', // 抽检人
  receiveDate: '', // 收样日期
  handleResult: '', // 已检样品处理
  reportSendType: '', // 报告发送方式
  userId: '', // 下一节点处理人
  examineDeptId: '', // 检测单位Id
  examinerPhone: '', // 检测人电话
  witness: '', // 见证人
  delegateDate: '', // 委托日期
  dynamicData: [{}] // 动态数据
})
const mobile = ref('')

const defaultProps1 = {
  children: 'children',
  label: 'materialName'
}

const defaultProjectProps = {
  children: 'children',
  label: 'projectName',
  disabled: (data, node) => {
    const { children } = data
    const isNoChildren = !children || children.length === 0

    // console.log('🚀 ~ data:', data, node)
    return isNoChildren
  }
}
const defaultProps2 = {
  children: 'children',
  label: 'projectName'
}
const formRules = reactive({
  taskType: [{ required: true, message: '检测类别不能为空', trigger: 'change' }],
  mustFill: [{ required: true, message: '此项用于计算不能为空', trigger: 'change' }],
  sampleCode: [{ required: true, message: '样品编号不能为空', trigger: 'change' }],
  sampleName: [{ required: true, message: '样品名称不能为空', trigger: 'change' }],
  projectId: [{ required: true, message: '工程名称不能为空', trigger: 'change' }],
  materialId: [{ required: true, message: '材料类型不能为空', trigger: 'change' }],
  delegateUnitId: [{ required: true, message: '委托单位不能为空', trigger: 'change' }],
  delegateNo: [{ required: true, message: '委托编号不能为空', trigger: 'change' }],
  // address: [{ required: true, message: '详细地址不能为空', trigger: 'change' }],
  sendExaminer: [{ required: true, message: '送检人不能为空', trigger: 'change' }],
  examineProjectId: [{ required: true, message: '检测项目不能为空', trigger: 'change' }],
  examineContext: [{ required: true, message: '检测内容不能为空', trigger: 'change' }],
  designParam: [{ required: true, message: '设计参数不能为空', trigger: 'change' }],
  bpmModelId: [{ required: true, message: '流程模型不能为空', trigger: 'change' }],
  examiner: [{ required: true, message: '检测人不能为空', trigger: 'change' }],
  samplingQuantity: [{ required: true, message: '抽样数量不能为空', trigger: 'change' }],
  examineUnitId: [{ required: true, message: '受检单位不能为空', trigger: 'change' }],
  takeAddress: [{ required: true, message: '取样地点不能为空', trigger: 'change' }],
  projectPartId: [{ required: true, message: '工程部位不能为空', trigger: 'change' }],
  sampleCategory: [{ required: true, message: '品种不能为空', trigger: 'change' }],
  factory: [{ required: true, message: '厂家不能为空', trigger: 'change' }],
  // NOTE: 2025.4新增
  factoryNumber: [{ required: true, message: '出厂编号不能为空', trigger: 'change' }],
  modelNo: [{ required: true, message: '规格型号不能为空', trigger: 'change' }],
  representQuantity: [{ required: true, message: '代表数量不能为空', trigger: 'change' }],
  sampleStatus: [{ required: true, message: '样品状态不能为空', trigger: 'change' }],
  examineBasis: [{ required: true, message: '试验标准不能为空', trigger: 'change' }],
  judgeStandard: [{ required: true, message: '评定标准不能为空', trigger: 'change' }],
  handleResult: [{ required: true, message: '已检样品处理不能为空', trigger: 'change' }],
  // reportSendType: [{ required: true, message: '报告发送方式不能为空', trigger: 'change' }],
  receivePerson: [{ required: true, message: '抽检人不能为空', trigger: 'change' }],
  witness: [{ required: false, message: '见证人不能为空', trigger: 'change' }],
  receiveDate: [{ required: true, message: '收样日期不能为空', trigger: 'change' }],
  delegateDate: [{ required: true, message: '委托日期不能为空', trigger: 'change' }],
  userId: [{ required: true, message: '下一节点处理人不能为空', trigger: 'change' }],
  examineDeptId: [{ required: true, message: '检测单位不能为空', trigger: 'change' }],
  examinerPhone: [{ required: true, message: '检测人联系方式不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const materialTreeRef = ref() // 材料类型树Ref
const materialName = ref('') // 材料类型名称
const commissionOrderFields = ref([]) // 材料类型名称
const dataHeader = ref([]) //多出来的表头字段
const dataHeaderself = ref([]) //多出来的表头字段(自填)
const dataHeadercount = ref([]) //多出来的表头字段(计算)
const dataHeaderdevice = ref([]) //多出来的表头字段(设备)
const modelList = ref([])
const processInstanceid = ref('')
const businessKey = ref()
const activeNames = ref(['1'])
const dialogWidth = computed(() => {
  return formData.propertyList?.length > 0 ? '1400px' : '1000px'
})
const formContainer = ref(null)
const dynamicHeight = ref('500px')
const calculateHeight = async () => {
  await nextTick(() => {
    if (formContainer.value) {
      let height = formContainer.value.offsetHeight
      height >= 650 && (height = 650)
      dynamicHeight.value = `${height - 10}px` // 额外添加一些边距
      console.log('高度：', dynamicHeight.value, height)
    }
  })
}
// 在打开弹窗或属性列表变化时调用
watch(() => formData.propertyList, calculateHeight)

const getTree = async () => {
  const res = await DeptApi.getSimpleDeptList()
  deptList.value = []
  deptList.value.push(...handleTree(res))
}

//获取设备数据
const getDeviceData = async () => {
  const data = await ledgerManage.getextractQuipdata({
    sampleCode: formData.sampleCode,
    processInstanceId: formData.processInstanceId
  })
  console.log('设备数据', data.data)
  Object.keys(data.data).forEach((key) => {
    console.log('key', key)
    formData.dynamicData[0].data[key] = data.data[key]
  })
}

//计算保存
const calAndSave = async () => {
  if (!formRef.value) return
  try {
    const valid = await formRef.value.validate()
  } catch (err) {
    message.error('用于计算的属性未填写完整')
    return
  }

  //提交请求
  formLoading.value = true
  formData.processInstanceId = processInstanceid.value
  formData.dynamicData[0].data.business_key = businessKey.value
  formData.dynamicData[0].data.sheet_index = '123'
  if (formData.dynamicData[0].data.jcyqhsb) {
    formData.dynamicData[0].data.jcyqhsb = formData.dynamicData[0].data.jcyqhsb.join('、')
  }
  console.log('formData', formData.dynamicData[0].data,formData.dynamicData[0].data.jcyqhsb);
  
  const payloadData = { ...formData }
  try {
    await ledgerManage.getLedgerInfoUpdate(payloadData)
    await ledgerManage.getLedgerCalculation(formData.processInstanceId)
  } finally {
    formLoading.value = false
    const resData = await ledgerManage.getledgerInfoInfo(processInstanceid.value)
    // formData = resData
    if (resData.dynamicData[0].data.jcyqhsb) {
      resData.dynamicData[0].data.jcyqhsb = resData.dynamicData[0].data.jcyqhsb.split('、')
    } else {
      resData.dynamicData[0].data.jcyqhsb = []
    }
    Object.assign(formData, resData)
  }
}

async function handleChange(value) {
  console.log(value)
  // formData.value.bpmModelId = undefined
  // let nodeData = materialTreeRef.value.getNode(value)
  // const step = nodeData.level - 1

  // for (let i = 0; i < step; i++) {
  //   if (!nodeData.parent) {
  //     break
  //   }

  //   nodeData = nodeData.parent
  // }

  // const _materialName = nodeData.data?.materialName

  // if (materialName.value !== _materialName) {
  //   const dicts = await getStrDictOptions(_materialName)

  //   formData.value.factoryNumber = ''
  //   formData.value.examineContext = ''
  //   formData.value.designParam = ''
  //   materialName.value = _materialName
  //   commissionOrderFields.value = dicts.map((dict) => dict.value)
  //   // console.log('🚀 ~ dicts:', dicts, commissionOrderFields.value)
  // }

  // fetchItemList(value)
}

const editTitle = (title) => {
  console.log(
    '🚀 ~ title:',
    editTitleList.value.list,
    editTitleList.value.list.find((item) => item.tableName === title),
    title
  )

  const data = editTitleList.value.list.find((item) => item.tableName === title)
  return data.tableDesc
}

const filterMethod = async (query) => {
  examineBasisOptions.value = []

  if (query === '') {
    examineBasisOptions.value = await getStrDictOptions('standardNorms')
  } else {
    examineBasisOptions.value = examineBasisOptionsList.value.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    )
  }
}

const filterjudgeStandard = async (query) => {
  judgeStandardOptions.value = []
  if (query === '') {
    judgeStandardOptions.value = await getStrDictOptions('standardNorms')
  } else {
    judgeStandardOptions.value = examineBasisOptionsList.value.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    )
  }
}

const filterinstrumentsAndEquipment = async (query) => {
  instrumentsAndEquipment.value = []
  if (query === '') {
    instrumentsAndEquipment.value = await getStrDictOptions('device')
  } else {
    instrumentsAndEquipment.value = examineBasisOptionsList.value.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    )
  }
}

const recurBuildProjectTree = () => {}

const getProjectTree = async () => {
  const data = await ItemApi.getItemList({ projectType: 0 })
  console.log('🚀 ~ getProjectTree ~ data:', data)
  projectList.value = data.map((d) => {
    // d.disabled = true
    return d
  })
}

let materialId = null
// 改变材料种类
const fetchItemList = async (data) => {
  const res = await InspectionItemApi.getExamineProjectList({
    materialType: data,
    publishStatus: 1
  })
  itemList.value = res
  if (!materialId) {
    formData.examineProjectId = undefined
    formData.propertyList = []
  }
  materialId = null
  // handleProjectChange(res[0])
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
const handleChangeBpmModel = async (id) => {
  if (formType.value === 'initiate') {
    await Promise.all(
      modelList.value.map(async (ite) => {
        console.log('手动触发', (ite.id, id))
        if (ite.id === id) {
          const res = await TaskApi.getProcessDefinition({ id: ite.processDefinitionId })
          checkMine(res, ite.key)
        }
      })
    )
  }
}

let examineProjectId = ''
let uploadKey = undefined
const showNext = ref(false)
const examineBasisOptionsList = ref([])
// 初始提交下一节点处理人
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
    formData.value.userId = formData.value.examiner
    showNext.value = true
  } else {
    showNext.value = false
  }
}

// const handleUploadSuccess = (data) => {
//   fileList.value.push(data)
// }
const handleBeforeUpload = () => {
  submitBtnLoading.value = true
}

const handleUploadSuccess = (fileInfo) => {
  console.log('上传成功:', fileInfo, formData.value.attachment1)
  const hasUploadingFiles = (fileInfo ?? [])?.filter((file) => !file || !file.url)

  if (!hasUploadingFiles.length) {
    submitBtnLoading.value = false
  }

  // 手动触发表单验证
  // formRef.value?.validateField('attachment')
}
const handleUploadError = () => {
  submitBtnLoading.value = false
}

// const handleRemove = (index) => {
//   fileList.value.splice(index, 1)
// }
/** 打开弹窗 */

const buildMultiString2Arr = (obj, key) => {
  if (isNil(obj[key]) || isEmpty(obj[key])) {
    obj[key] = []
  } else if (is(String, obj[key]) && obj[key]) {
    obj[key] = obj[key].split('、')
  }
}

//过滤掉对象中值为sheet_index或者business_key的属性
function removeEmptyValues(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    console.log('key---value', key, value, key != 'sheet_index' && key != 'business_key')
    if (key != 'sheet_index' && key != 'business_key') {
      // 判断不为null/undefined/空字符串
      acc[key] = value
    }
    return acc
  }, {})
}

const open = async (type, id, examineProjectId, businesskey) => {
  editTitleList.value = await SqlApi.getDbPage({
    tableName: undefined,
    pageNo: 1,
    pageSize: 20
  })

  if (id) {
    processInstanceid.value = id
    businessKey.value = businesskey
  }
  if (type === 'editAndCreate') {
    dataHeader.value = await ledgerManage.getLedgerInfoHeader(examineProjectId)
    dataHeader.value = dataHeader.value.filter((item) => item.table != 'tz_basetable')
    const resData = await ledgerManage.getledgerInfoInfo(id)
    // formData = resData
    if (resData.dynamicData[0].data.jcyqhsb) {
      resData.dynamicData[0].data.jcyqhsb = resData.dynamicData[0].data.jcyqhsb.split('、')
    } else {
      resData.dynamicData[0].data.jcyqhsb = []
    }
    Object.assign(formData, resData)
    dataHeader.value = dataHeader.value.flatMap((item, index) =>
      item.fileds
        ? Object.entries(item.fileds).map(([key, value]) => ({
            value,
            rules:
              value.enableNull == 1
                ? { required: false }
                : { required: true, message: '字段用于计算不能为空', trigger: 'change' },
            sourceIndex: index // 原始数组中的索引位置
          }))
        : []
    )
    dataHeader.value = dataHeader.value.filter(
      (item) => item.value.code != 'sheet_index' && item.value.code != 'business_key'
    )
    dataHeaderself.value = []
    dataHeaderdevice.value = []
    dataHeadercount.value = []
    for (const item of dataHeader.value) {
      if (item.value.displayMark == '1') {
        dataHeaderself.value.push(item)
      } else if (item.value.displayMark == '2') {
        dataHeaderdevice.value.push(item)
      } else if (item.value.displayMark == '3') {
        dataHeadercount.value.push(item)
      }
    }
  }
  getMaterialTree()
  getTree()
  getProjectTree()
  // 获取试验标准字典数据
  // NOTE: 试验标准和评定标准，按最新要求用同一个字典
  examineBasisOptions.value = await getStrDictOptions('standardNorms')
  examineBasisOptionsList.value = examineBasisOptions.value
  judgeStandardOptions.value = await getStrDictOptions('standardNorms')
  instrumentsAndEquipment.value = await getStrDictOptions('device')
  sampleStatusOptions.value = await getStrDictOptions('sample_status')
  handleResultOptions.value = await getStrDictOptions('handle_result')
  reportSendTypeOptions.value = await getStrDictOptions('report_send_type')
  // resetForm()
  showNext.value = false
  dialogVisible.value = true

  if (type === 'initiate') {
    dialogTitle.value = '任务发起'
  } else if (type === 'editAndCreate') {
    dialogTitle.value = '编辑新增'
  } else {
    dialogTitle.value = t('action.' + type)
  }
  getModelList()
  formType.value = type

  //编辑
}

const getMaterialTree = async () => {
  materialList.value = await InspectionItemApi.getMaterialTree({ businessType: 1 })
}
const handleProjectChange = async (val) => {
  console.log('检测指标改变:', val)
  formData.value.bpmModelId = undefined
  formData.value.examineName = val.examineName
  // 如果当前选择的检测指标ID与之前的相同，则保持 propertyList 不变
  if (formData.value.examineProjectId !== examineProjectId) {
    formLoading.value = true
    const data = await InspectionItemApi.getExamineProjectDetail(val.id)
    formLoading.value = false
    console.log('data', data.propertyList)

    // Filter out items with specified propertyNames or isMust=1
    formData.propertyList = data.propertyList?.length
      ? data.propertyList
          .filter((item) => item.isMust !== 1)
          .map((item) => {
            !item.propertyValue && (item.propertyValue = '')
            return item
          })
      : []
    console.log('formData.value.propertyList', formData.value.propertyList)
  } else {
    formData.propertyList = originalProperty.value
    originalProperty.value = []
    examineProjectId = null
  }
  // 改变检测指标的联动操作
  // itemList 指标集合
  const hitProject = itemList.value?.find((ite) => ite.id === val.id)

  if (hitProject) {
    const { bpmModelId } = hitProject
    formData.value.bpmModelId = bpmModelId
    bpmModelId && handleChangeBpmModel(bpmModelId)
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    sampleCode: '',
    sampleName: '',
    projectId: '', // 工程名称
    examineProjectId: undefined, // 检测指标
    examineContext: '', // 检测内容
    designParam: '', // 设计参数
    materialId: '', // 物料种类ID
    delegateUnitId: '', // 委托单位ID
    examineUnitId: '', // 受检单位ID
    inputDate: '', // 收样日期
    attachment1: '', // 附件
    attachment: '', // 附件
    taskType: '', // 检测类别
    sendExaminer: undefined, // 收样人
    examiner: undefined, // 试验人
    equipmentId: '', // 设备ID
    bpmModelId: undefined,
    propertyList: [],
    delegateNo: '', // 委托编号
    takeAddress: '', // 取样地点
    address: '', // 详细地址
    projectPartId: '', // 工程部位
    samplingQuantity: '', // 抽样数量
    sampleCategory: '', // 品种
    factory: '', // 厂家
    factoryNumber: '', // 出厂编号
    sampleStatus: [], // 样品状态
    modelNo: '', // 规格型号
    representQuantity: '', // 代表数量
    examineBasis: [], // 试验标准
    judgeStandard: [], // 评定标准
    receivePerson: '', // 抽检人
    receiveDate: '', // 收样日期
    handleResult: '', // 已检样品处理
    reportSendType: '', // 报告发送方式
    userId: '', // 下一节点处理人
    examineDeptId: '', // 检测单位ID
    examinerPhone: '', // 试验人手机号
    witness: '', //见证人
    delegateDate: '', // 委托单日期
    dynamicData: [{}] // 动态数据
  }

  mobile.value = ''
  formRef.value?.resetFields()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  // 提交请求
  formLoading.value = true
  // debugger
  // formData.value.attachment = JSON.stringify(formData.value.attachment1 || [])
  console.log('formData.value', formData)
  // formData.value.attachment1 = undefined
  formData.processInstanceId = processInstanceid.value
  formData.dynamicData[0].data.business_key = businessKey.value
  formData.dynamicData[0].data.sheet_index = '123'
  if (formData.dynamicData[0].data.jcyqhsb) {
    formData.dynamicData[0].data.jcyqhsb = formData.dynamicData[0].data.jcyqhsb.join('、')
  }
  const payloadData = { ...formData }
  // payloadData.attachment = JSON.stringify(payloadData.attachment1 || [])
  // payloadData.attachment1 = undefined
  // payloadData.sampleStatus = formData.value.sampleStatus?.join('、')
  // payloadData.examineBasis = formData.value.examineBasis?.join('、')
  // payloadData.judgeStandard = formData.value.judgeStandard?.join('、')
  console.log('🚀 ~ submitForm ~ payloadData:', payloadData)
  console.log('🚀 ~ submitForm ~ formData:', formData)

  try {
    await ledgerManage.getLedgerInfoUpdate(payloadData)
    // if (formType.value === 'create') {
    //   await SampleApi.createSampleInfo(payloadData)
    //   message.success(t('common.createSuccess'))
    // } else if (formType.value === 'editAndCreate') {
    //   payloadData.id = null
    //   await SampleApi.createSampleInfo(payloadData)
    // } else if (formType.value === 'edit') {
    //   await SampleApi.updateSampleInfo(payloadData)
    //   message.success(t('common.updateSuccess'))
    // } else if (formType.value === 'initiate') {
    //   await SampleApi.updateSampleInfo(payloadData)
    //   const {
    //     taskType,
    //     id: businessKey,
    //     examineProjectId,
    //     bpmModelId,
    //     examiner,
    //     userId
    //   } = formData.value ?? {}
    // const payload = {
    //   taskType,
    //   businessKey,
    //   examineProjectId,
    //   bpmModelId,
    //   examiner,
    //   variables: {
    //     [uploadKey]: [userId]
    //   }
    // }

    // console.log('payload', payload)
    // await TaskApi.createTask(payload)
    message.success(t('common.updateSuccess'))
    // message.success('任务发起成功')
    // } else {
    //   //
    // }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 流程图的详情按钮操作 */
const bpmnDetailVisible = ref(false)
const bpmnXML = ref(null)
const bpmnControlForm = ref({
  prefix: 'flowable'
})

const handleBpmnDetail = async (id) => {
  if (!id) {
    return message.warning('请先选择流程模型')
  }

  const data = await ModelApi.getModel(id)
  bpmnXML.value = data.bpmnXml || ''
  bpmnDetailVisible.value = true
}

const projectPartList = ref([])

// 项目选择改变时的处理函数
const handleProjectNameChange = async (id, clear = false) => {
  if (!id) return

  if (clear) {
    formData.value.projectPartId = ''
    formData.value.projectPart = ''
    projectPartList.value = []
  }

  const res = await ItemApi.getItemList({ projectType: 0, projectId: id })
  projectPartList.value = res ?? []
}

const handleProjectPartChange = (nodeData) => {
  formData.value.projectPart = nodeData.projectName
}

const handleClose = () => {
  formLoading.value = false
  submitBtnLoading.value = false
}
</script>
<style lang="scss" scoped>
.moreInfoIcon {
  position: absolute;
  right: -20px;
  cursor: pointer;
}
</style>
<style lang="scss">
.customPv {
  height: 560px !important;
}

.popper_class {
  top: -50px !important;
  display: block !important;
  background-color: #f2f6fc !important;
  box-shadow: none !important;

  .el-popper__arrow {
    top: 60px !important;
    left: -4px !important;
  }

  .el-popper__arrow::before {
    width: 14px;
    height: 14px;
    background-color: #f2f6fc !important;
  }
}
.edit-title {
  margin-bottom: 15px;
  margin-left: 15px;
  position: relative;
  font-size: 18px;
}
.edit-title::before {
  content: '';
  display: inline-block;
  position: absolute;
  width: 4px;
  height: 20px;
  background: rgb(23, 104, 200);
  left: -10px;
  top: 50%;
  margin-top: -10px;
}

.el-collapse {
  width: 100%;
}

.title-wrapper {
  margin-left: 15px;
  position: relative;
  font-size: 14px;
  align-items: center;
}
.title-wrapper::before {
  content: '';
  display: inline-block;
  position: absolute;
  width: 4px;
  height: 16px;
  background: rgba(23, 104, 200, 1);
  left: -10px;
  top: 50%;
  margin-top: -8px;
}
</style>
