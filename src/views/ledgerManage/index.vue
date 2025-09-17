<template>
  <ContentWrap class="document-list-search">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="100px">
      <el-form-item label="材料类型" prop="materialId">
        <el-tree-select
v-model="queryParams.examineProjectId" :data="materialList" :default-expanded-keys="[0]"
          :props="defaultProps" class="!w-240px" node-key="id" />
      </el-form-item>
      <el-form-item label="样品名称" prop="sampleName">
        <el-input v-model="queryParams.sampleName" placeholder="请输入" clearable class="!w-240px" />
      </el-form-item>
      <el-form-item label="样品编码" prop="sampleCode">
        <el-input v-model="queryParams.sampleCode" placeholder="请输入" clearable class="!w-240px" />
      </el-form-item>

      <el-form-item class="ml-auto">
        <el-button color="rgb(63, 98, 151)" dark @click="handleQuery">
          <Icon icon="ep:search" />搜索
        </el-button>
        <el-button @click="resetQuery" color="rgb(229, 231, 235)">
          <Icon icon="ep:refresh" />重置
        </el-button>
        <!-- <el-button type="primary"
                     plain
                     @click="batchDelete">
            <Icon icon="ep:delete" /> 批量删除
          </el-button> -->
      </el-form-item>
    </el-form>
  </ContentWrap>
  <div class="bg-white p-20px">
    <div class="flex items-center justify-between mb-14px w-full">
      <p class="title">台账管理 </p>
      <!-- <el-button
        v-hasPermi="['sql:db:create']"
        plain
        @click="openForm(OPERATE_TYPE_MAP.create.key)"
        class="!bg-gray-200 ![color:rgb(45,77,126)] hover:!bg-gray-100 hover:![color:rgb(45,77,126)] hover:!border-none"
      >
        <Icon icon="ep:plus" /> 新增
      </el-button> -->
      <!-- <el-button
        v-hasPermi="['sample:manage:create']"
        plain
        class="!bg-gray-200 ![color:rgb(45,77,126)] hover:!bg-gray-100 hover:![color:rgb(45,77,126)] hover:!border-none"
        @click="openForm('create')"
      >
        <Icon icon="ep:plus" /> 新增
      </el-button> -->
    </div>
    <el-table
v-loading="loading" @selection-change="handleSelectionChange" :data="list" ref="tableRef"
      @sort-change="handleSortChange" :row-class-name="tableRowClassName" :height="tableHeight"
      :header-cell-class-name="setHeaderStyle">
      <el-table-column label="序号" align="center" fixed="left" type="index" width="60" />
      <el-table-column
label="委托编号" align="center" sortable="custom" prop="delegateNo" width="120"
        show-overflow-tooltip />
      <el-table-column
label="委托日期" align="center" sortable="custom" prop="delegateDate" width="120"
        show-overflow-tooltip />
      <el-table-column
label="样品编号" align="center" sortable="custom" prop="sampleCode" width="120"
        show-overflow-tooltip />
      <el-table-column label="工程名称" sortable align="center" prop="projectName" width="120" show-overflow-tooltip />
      <el-table-column
label="委托单位" fixed="left" align="center" sortable="custom" width="120" prop="delegateUnitName"
        show-overflow-tooltip />
      <el-table-column label="检测类别" align="center" prop="taskTypeDesc" width="120" sortable="custom" />
      <el-table-column
label="受检单位" sortable="custom" align="center" prop="examineUnitName" width="130"
        show-overflow-tooltip />
      <el-table-column label="取样地点" sortable="custom" align="center" prop="takeAddress" width="120" />
      <el-table-column
label="工程部位" align="center" prop="projectPart" show-overflow-tooltip sortable="custom"
        width="120" />
      <el-table-column label="详细地址" align="center" prop="address" sortable="custom" width="120" />
      <el-table-column
label="样品名称" sortable="custom" align="center" prop="sampleName" width="120"
        show-overflow-tooltip />
      <el-table-column label="抽样数量" align="center" sortable="custom" prop="samplingQuantity" width="120" />
      <el-table-column label="品种" align="center" sortable="custom" prop="sampleCategory" width="100" />
      <el-table-column label="厂家" show-overflow-tooltip align="center" sortable="custom" prop="factory" width="120" />
      <el-table-column label="出厂编号" align="center" sortable="custom" prop="factoryNumber" width="120" />
      <el-table-column label="规格型号" align="center" sortable="custom" prop="modelNo" width="120" />
      <el-table-column label="代表数量" align="center" sortable="custom" prop="representQuantity" width="120" />
      <el-table-column
label="样品状态" align="center" sortable="custom" show-overflow-tooltip prop="sampleStatus"
        width="120" />
      <el-table-column
label="材料类型" align="center" sortable="custom" prop="materialName" width="120"
        show-overflow-tooltip />
      <el-table-column
label="检测项目" align="center" show-overflow-tooltip sortable prop="examineProjectName"
        width="120" />
      <el-table-column
label="检测内容" align="center" sortable="custom" prop="examineContext" width="120"
        show-overflow-tooltip />
      <el-table-column
label="设计参数" align="center" sortable="custom" prop="designParam" width="120"
        show-overflow-tooltip />
      <el-table-column label="指标配置" align="center" prop="property" width="100">
        <template #default="scope">
          <el-button link type="primary" @click="openExamineProjectDetail(scope.row.id)">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="业务状态" sortable="custom" align="center" prop="businessStatus" width="120">
        <template #default="scope">
          <span v-if="scope.row.businessStatus == null">-</span>
          <el-tooltip
v-else-if="scope.row.businessStatus == 4" effect="dark" placement="top"
            :content="scope.row.cancelReason">
            <el-tag :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.type">
              {{ EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.label }}
            </el-tag>
          </el-tooltip>
          <el-tag v-else :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.type">
            {{ EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
label="检测依据" sortable="custom" align="center" show-overflow-tooltip prop="examineBasis"
        width="120" />
      <el-table-column
label="判定标准" sortable="custom" align="center" show-overflow-tooltip prop="judgeStandard"
        width="120" />
      <el-table-column
label="检测单位" align="center" prop="examineDeptName" sortable="custom" width="120"
        show-overflow-tooltip />
      <el-table-column
label="收样人" align="center" prop="receivePerson" sortable="custom" width="120"
        show-overflow-tooltip />
      <el-table-column label="收样日期" align="center" prop="receiveDate" width="120" sortable="custom">
        <template #default="scope">
          <div v-if="scope.row.receiveDate">{{
            formatDate(scope.row.receiveDate, 'YYYY-MM-DD')
            }}</div>
        </template>
      </el-table-column>
      <el-table-column label="已检样品处理" align="center" prop="handleResult" width="140" sortable="custom" />
      <el-table-column label="报告发送方式" align="center" prop="reportSendType" width="140" sortable="custom" />
      <!-- <el-table-column
        label="附件"
        align="center"
        prop="attachment"
        width="100"
        show-overflow-tooltip
      >
        <template #default="scope">
          <el-button
            type="primary"
            v-if="scope.row.attachment != '[]'"
            link
            @click="showAttachments(scope.row.attachment)"
          >
            查看附件
          </el-button>
          <span v-else></span>
        </template>
      </el-table-column> -->
      <el-table-column label="录入日期" sortable align="center" prop="inputDate" width="120">
        <template #default="scope">
          <div v-if="scope.row.inputDate">{{ formatDate(scope.row.inputDate, 'YYYY-MM-DD') }}</div>
        </template>
      </el-table-column>
      <el-table-column
label="报告编号" align="center" prop="reportNumber" width="140" sortable="custom"
        show-overflow-tooltip />
      <el-table-column label="报告日期" align="center" prop="reportDate" width="140" sortable="custom" />
      <el-table-column label="检测日期" align="center" prop="testDate" width="140" sortable="custom" />
      <el-table-column
label="检测环境" align="center" prop="testEnvironment" show-overflow-tooltip width="140"
        sortable="custom" />
      <el-table-column
label="检测设备" align="center" prop="testEquipment" width="140" sortable="custom"
        show-overflow-tooltip />
      <el-table-column
v-for="col in tableColumns" :key="col.prop || col.label" :label="col.label" :align="col.prop"
        :sortable="col.sortable" :prop="col.prop" :width="col.width" :show-overflow-tooltip="col.showOverflowTooltip" />
      <el-table-column fixed="right" label="操作" align="center" width="335" prop="createTime">
        <template #default="scope">
          <!-- <el-button v-hasPermi="['biz:processInstance:create']" type="primary" link size="small" plain
            :disabled="!(scope.row.businessStatusDesc === '试验中')" @click="calAndSave(scope.row)">
            计算保存
          </el-button> -->
          <el-button
type="primary" link size="small" @click="
            openForm(
              'editAndCreate',
              scope.row.processInstanceId,
              queryParams.examineProjectId,
              scope.row.businessKey
            )
            " v-hasPermi="['sample:manage:create']" :disabled="!(scope.row.businessStatusDesc === '试验中')">
            {{ scope.row.firstFill == true ? '填报' : '编辑' }}
          </el-button>
          <el-button
type="primary" link size="small" @click="
            opensubmitForm(
              scope.row.processInstanceId,
              scope.row.procInstId,
              scope.row.examineProjectId
            )
            " :disabled="!(scope.row.businessStatusDesc === '试验中')" v-hasPermi="['sample:manage:create']">
            提交
          </el-button>
          <el-button
v-hasPermi="['sample:manage:process']" type="primary" link size="small" plain
            :disabled="!scope.row.processInstanceId" @click="openFlwDetail(scope.row)">
            报告打印
          </el-button>
          <!-- <el-dropdown>
            <el-button
              v-if="
                checkHasPermi([
                  'sample:manage:record',
                  'sample:manage:edit',
                  'sample:manage:delete'
                ])
              "
              class="ml-5px pos-relative top-3px"
            type="primary"
            link
              size="small"
            >
              更多</el-button
            >
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-hasPermi="['sample:manage:record']"
                  @click="openFillingRecord(scope.row.id)"
                  >填报记录</el-dropdown-item
                >
                <el-dropdown-item
                  @click="openForm('edit', scope.row.id)"
                  v-hasPermi="['sample:manage:edit']"
                  :disabled="!(scope.row.businessStatus == null || scope.row.businessStatus == 4)"
                  >编辑</el-dropdown-item
                >
                <el-dropdown-item
                  @click="handleDelete(scope.row.id)"
                  v-hasPermi="['sample:manage:delete']"
                  :disabled="!(scope.row.businessStatus == null || scope.row.businessStatus == 4)"
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
  </el-dropdown> -->
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <span class="total-text">共 {{ total }} 项数据</span>
      <Pagination
:total="total" v-model:current-page="queryParams.pageNo" v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 30, 50]" @current-change="getList" @size-change="getList"
        layout="sizes, prev, pager, next, jumper" class="pg_box" />
    </div>
  </div>
  <!-- 添加附件弹窗组件 -->

  <editForm ref="formRef" @success="getList" />
  <SubmitFillData
ref="submitFillDataRef" :approvalTask="sampleFillData.approvalTask"
    :approvalUser="sampleFillData.approvalUser" :approvalInfo="{
      approvalTask: sampleFillData.approvalTask,
      approvalUser: sampleFillData.approvalUser
    }" :equipmentId="sampleFillData.equipmentId" @submit="handleSubmitFillData" />
  <autoGenerateTables :processInstanceId="processInstanceId" @success="stopLoading" ref="autoGenerateTablesRef" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import { judgeIsFillTask, getWtTaskStatus } from '@/utils/sampleTask'
import { useWorkbench } from '@/hooks/web/useWorkbench'
import * as PostApi from '@/api/system/post'
import * as ledgerManage from '@/api/ledgerManage'
import * as InspectionItemApi from '@/api/inspectionItem'
import * as TaskApi from '@/api/task'
import editForm from './addEditForm.vue'
import { convertExcel2Pdf } from '@/api/luckysheet/luckysheet'
import { clone, mergeDeepRight, isNil, isEmpty, is } from 'ramda'
import download from '@/utils/download'
import { downloadByUrl } from '@/utils/filt'
import { EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP } from '@/constants/sampleTask'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { usehasPermi } from '@/hooks/web/usehasPermi'
import { camelToUnderscore } from '@/utils/commonMethods'
import SubmitFillData from './SubmitFillData.vue'
import autoGenerateTables from './autoGenerateTables.vue'

const { isAdmin, dashboardConfig } = useWorkbench()
const route = useRoute() // 路由
const { checkHasPermi } = usehasPermi()
const { tableHeight } = useTableHeight()
const colorList = ref(['#67C23A', '#F56C6C', '#F56C6C', '#67C23A'])
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const selectIds = ref([])
const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const projectList = ref([])
const fileRef = ref(null)
const tableRef = ref(null)
const autoGenerateTablesRef = ref()
const procInstId = ref()
const submitFillDataRef = ref()
const sampleFillData = ref({})
const processInstanceId = ref()

const setHeaderStyle = () => {
  return 'custom-header'
}
//
const businessType = ref(dashboardConfig.data.flwTag)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  materialId: undefined,
  sampleCode: undefined,
  sampleName: undefined,
  examineProjectId: 1
  // sendExaminer: undefined
})
const defaultProps = {
  children: 'children',
  label: 'materialName'
}

const queryFormRef = ref() // 搜索的表单
const formRef = ref()
const fillHistoryModalRef = ref()
const materialList = ref([])

//默认表格字段
const defaultColumnConfig = {
  align: 'center',
  sortable: 'custom',
  width: '120',
  showOverflowTooltip: true
}
// 合并后的表格列
const tableColumns = ref([])

//任务列表过来高亮显示
const tableRowClassName = ({ row, rowIndex }) => {
  if (row.processInstanceId === route.query.processInstanceId) {
    return 'Highlight'
  }
}

/** 查询列表 */
const getList = async (search = false) => {
  if (route.query.examineProjectId && !search) {
    queryParams.examineProjectId = route.query.examineProjectId
  }
  try {
    const dataHeader = await ledgerManage.getLedgerInfoHeader(queryParams.examineProjectId)
    const dataHeaderFilter = dataHeader.filter((item) => item.table != 'tz_basetable')
    // 提取并标记每个值的来源位置
    const dataHeaderTotal = dataHeaderFilter.flatMap((item, index) =>
      item.fileds
        ? Object.entries(item.fileds).map(([key, value]) => ({
          value,
          sourceIndex: index // 原始数组中的索引位置
        }))
        : []
    )
    const originalColumns = dataHeaderTotal.filter(item => item.value.code != "business_key" && item.value.code != "sheet_index")
    // 处理动态表头
    const dynamicColumns = originalColumns.map((item) => (
      {
        prop: `dynamicData[${item.sourceIndex}].data.${item.value.code}`,
        label: item.value.name,
        ...defaultColumnConfig
        // ...item // 允许API覆盖默认配置（如特殊宽度）
      }
    )
    )

    // 合并列
    // tableColumns.value = [...originalColumns.value, ...dynamicColumns]
    tableColumns.value = dynamicColumns
    loading.value = true
    const data = await ledgerManage.getLedgerInfoPage(queryParams)
    // const data = await SampleApi.getSampleInfoPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
const showExcel = (link) => {
  fileRef.value.open(link)
}

/** 搜索按钮操作 */
const handleQuery = async () => {
  queryParams.pageNo = 1
  getList(true)
}

//计算保存
const calAndSave = async (row) => {
  await ledgerManage.getLedgerCalculation(row.processInstanceId)
  message.success('计算成功')
  resetQuery()
}

const handleSortChange = async (row) => {
  queryParams.orderColumn = camelToUnderscore(row.prop)
  if (row.order === 'ascending') {
    queryParams.orderAsc = true
  } else if (row.order === 'descending') {
    queryParams.orderAsc = false
  } else {
    queryParams.orderAsc = undefined
    queryParams.orderColumn = undefined
  }
  await getList()
}

/** 重置按钮操作 */
const resetQuery = async () => {
  queryParams.orderColumn = undefined
  queryParams.orderAsc = undefined
  tableRef.value?.clearSort()
  queryFormRef.value?.resetFields()
  const data = await ledgerManage.getLedgerInfoPage(queryParams)
  // const data = await SampleApi.getSampleInfoPage(queryParams)
  list.value = data.list
  total.value = data.total
  // handleQuery()
}

/**编辑 */
const openForm = async (type, id, examineProjectId, businessKey) => {
  formRef.value.open(type, id, examineProjectId, businessKey)
}

const opensubmitForm = async (processInstanceid, procInstid, row) => {
  const data = await TaskApi.getSampleFillData({
    processInstanceId: processInstanceid
  })
  console.log('data:', data)
  sampleFillData.value = data
  processInstanceId.value = processInstanceid
  // console.log('🚀 ~ opensubmitForm ~ data:', data)
  submitFillDataRef.value.open()
}

const handleSubmitFillData = async (params) => {
  submitFillDataRef.value.close()
  // console.log('1111',autoGenerateTablesRef.value);
  // console.log('procInstId',procInstId);
  const loading = ElLoading.service({
    fullscreen: true,
    text: '正在生成报告...',
    target: '#fill-view'
  })
  // if (autoGenerateTablesRef.value?.handleSubmitFillData) {
  // detailRef.value.open(procInstId.value)
  await autoGenerateTablesRef.value.handleSubmitFillData(params)
}

const stopLoading = () => {
  const loading = ElLoading.service({
    fullscreen: true,
    text: '生成报告成功...',
    target: '#fill-view'
  })
  loading?.close?.()
  message.success('保存并提交成功')
  resetQuery()
}

const getFirstLevelLastChild = (tree) => {
  if (!tree.children || tree.children.length === 0) {
    return null
  }
  return tree.children[0]
}

const getMaterialTree = async () => {
  const res = await ledgerManage.getLedgerInfoListTree()
  queryParams.examineProjectId = getFirstLevelLastChild(res[0]).id
  materialList.value = res
  getList()
}

const handleDelete = async (id) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ledgerManage.deleteSampleInfo(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch { }
}
const handleSelectionChange = (val) => {
  selectIds.value = val.map((item) => item.id)
}
const batchDelete = async () => {
  if (selectIds.value.length === 0) {
    message.warning('请选择要删除的数据！')
    return
  }
  await ledgerManage.deleteSampleInfo({ ids: selectIds.value })
  message.success(t('common.delSuccess'))
  getList()
}

const handleUpdate = (row) => {
  MaterialApi.updateMaterial({
    id: row.id,
    dealResult: 1
  }).then(() => {
    message.success('处理成功')
    getList()
  })
}

const openFillingRecord = (id) => {
  fillHistoryModalRef.value.open(id)
}

const detailRef = ref()

const openFlwDetail = async (row) => {
  const data = await ledgerManage.getownloadUUrl(row.processInstanceId)
  window.open(data[0].url)
  // window.open(row.processInstanceId)
  // detailRef.value?.open?.(row.processInstanceId)
}

// 指标详情弹窗的引用
const examineProjectDetailRef = ref()
// 打开指标详情弹窗的方法
const openExamineProjectDetail = async (id) => {
  try {
    const resData = await ledgerManage.getSampleInfoDetail(id)
    console.log('获取指标详情', resData)
    // 将 property 对象转换为数组
    const propertyArray = resData.property ? Object.values(resData.property) : []
    examineProjectDetailRef.value.open(propertyArray)
  } catch (error) {
    console.log('获取指标详情失败', error)
    message.error('获取指标详情失败')
  }
}

const attachmentListModalRef = ref()
// 显示附件方法
const showAttachments = (attachment) => {
  console.log('附件列表：', attachment)
  attachmentListModalRef.value.open(attachment)
}

const handleDownload = function (file) {
  const fileName = file.name
  const lastDotIndex = fileName.lastIndexOf('.')
  const fileExtension =
    lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : ''
  if (fileExtension == 'txt') {
    download.txt(file.url, fileName)
  } else {
    downloadByUrl({
      url: file.url,
      target: '_blank',
      fileName: fileName
    })
  }
}

/** 初始化 */
onMounted(() => {
  getMaterialTree()
})
</script>
<!-- <style>
.custom-header{
  background-color: #F0F4F8 !important; /* 表头背景色 */
}
</style> -->
<style scoped>
@import '@/styles/tableCommon.scss';

.red {
  color: red;
}

.green {
  color: green;
}

.attachment-name {
  cursor: pointer;
}

.full-height {
  min-height: calc(100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) - var(--app-footer-height) - 90px);
}

::v-deep .el-button:focus-visible {
  border: none;
  outline: 2px solid #fff;
}

::v-deep .Highlight {
  background-color: rgb(141, 155, 196);
  color: #fff;

  .el-tag {
    color: #000 !important;
  }

}

::v-deep .el-table .Highlight:hover>td {
  background-color: rgb(93, 118, 185) !important;
}
</style>
