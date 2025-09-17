<template>
  <div>
    <ContentWrap class="document-list-search">
      <el-form
        v-if="!fillHistoryModalshow"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="100px"
      >
        <el-form-item label="材料类型" prop="materialId">
          <el-tree-select
            v-model="queryParams.materialId"
            :data="materialList"
            :default-expanded-keys="[0]"
            :props="defaultProps"
            check-strictly
            class="!w-240px"
            node-key="id"
          />
        </el-form-item>
        <el-form-item label="样品名称" prop="sampleName">
          <el-input
            v-model="queryParams.sampleName"
            placeholder="请输入"
            clearable
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item label="样品编码" prop="sampleCode">
          <el-input
            v-model="queryParams.sampleCode"
            placeholder="请输入"
            clearable
            class="!w-240px"
          />
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
      <div v-else @click="fillHistoryModalshow = false" class="GoBack">填报记录</div>
    </ContentWrap>
    <div v-if="!fillHistoryModalshow" class="bg-white p-20px">
      <div class="flex items-center justify-between mb-14px w-full">
        <p class="title">样品管理 </p>
        <!-- <el-button
        v-hasPermi="['sql:db:create']"
        plain
        @click="openForm(OPERATE_TYPE_MAP.create.key)"
        class="!bg-gray-200 ![color:rgb(45,77,126)] hover:!bg-gray-100 hover:![color:rgb(45,77,126)] hover:!border-none"
      >
        <Icon icon="ep:plus" /> 新增
      </el-button> -->
        <el-button
          v-hasPermi="['sample:manage:create']"
          plain
          class="!bg-gray-200 ![color:rgb(45,77,126)] hover:!bg-gray-100 hover:![color:rgb(45,77,126)] hover:!border-none"
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" /> 新增
        </el-button>
      </div>
      <el-table
        v-loading="loading"
        @selection-change="handleSelectionChange"
        :data="list"
        ref="tableRef"
        @sort-change="handleSortChange"
        :height="tableHeight"
        :header-cell-class-name="setHeaderStyle"
      >
        <el-table-column label="序号" align="center" fixed="left" type="index" width="60" />
        <el-table-column
          label="委托编号"
          align="center"
          sortable="custom"
          prop="delegateNo"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="样品编号"
          align="center"
          sortable="custom"
          prop="sampleCode"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="工程名称"
          sortable
          align="center"
          prop="projectName"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="委托单位"
          fixed="left"
          align="center"
          sortable="custom"
          width="120"
          prop="delegateUnitName"
          show-overflow-tooltip
        />
        <el-table-column
          label="检测类别"
          align="center"
          prop="taskTypeDesc"
          width="120"
          sortable="custom"
        />
        <el-table-column
          label="受检单位"
          sortable="custom"
          align="center"
          prop="examineUnitName"
          width="130"
          show-overflow-tooltip
        />
        <el-table-column
          label="取样地点"
          sortable="custom"
          align="center"
          prop="takeAddress"
          width="120"
        />
        <el-table-column
          label="工程部位"
          align="center"
          prop="projectPart"
          show-overflow-tooltip
          sortable="custom"
          width="120"
        />
        <el-table-column
          label="详细地址"
          align="center"
          prop="address"
          sortable="custom"
          width="120"
        />
        <el-table-column
          label="样品名称"
          sortable="custom"
          align="center"
          prop="sampleName"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="抽样数量"
          align="center"
          sortable="custom"
          prop="samplingQuantity"
          width="120"
        />
        <el-table-column
          label="品种"
          align="center"
          sortable="custom"
          prop="sampleCategory"
          width="100"
        />
          
        <el-table-column label="厂家" show-overflow-tooltip align="center" sortable="custom" prop="factory" width="120" />
        <el-table-column
          label="出厂编号"
          align="center"
          sortable="custom"
          prop="factoryNumber"
          width="120"
        />
        <el-table-column
          label="规格型号"
          align="center"
          sortable="custom"
          prop="modelNo"
          width="120"
        />
        <el-table-column
          label="代表数量"
          align="center"
          sortable="custom"
          prop="representQuantity"
          width="120"
        />
        <el-table-column
          label="样品状态"
          align="center"
          sortable="custom"
          prop="sampleStatus"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="材料类型"
          align="center"
          sortable="custom"
          prop="materialName"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="检测项目"
          align="center"
          show-overflow-tooltip
          sortable
          prop="examineProjectName"
          width="120"
        />
        <el-table-column
          label="检测内容"
          align="center"
          sortable="custom"
          prop="examineContext"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="设计参数"
          align="center"
          sortable="custom"
          prop="designParam"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column label="指标配置" align="center" prop="property" width="100">
          <template #default="scope">
            <el-button link type="primary" @click="openExamineProjectDetail(scope.row.id)">
              查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="业务状态"
          sortable="custom"
          align="center"
          prop="businessStatus"
          width="120"
        >
          <template #default="scope">
            <span v-if="scope.row.businessStatus == null">-</span>
            <el-tooltip
              v-else-if="scope.row.businessStatus == 4"
              effect="dark"
              placement="top"
              :content="scope.row.cancelReason"
            >
              <el-tag
                :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.type"
              >
                {{ EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.label }}
              </el-tag>
            </el-tooltip>
            <el-tag
              v-else
              :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.type"
            >
              {{ EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="检测依据"
          sortable="custom"
          align="center"
          prop="examineBasis"
          show-overflow-tooltip
          width="120"
        />
        <el-table-column
          label="判定标准"
          sortable="custom"
          show-overflow-tooltip
          align="center"
          prop="judgeStandard"
          width="120"
        />
        <el-table-column
          label="检测单位"
          align="center"
          prop="examineDeptName"
          sortable="custom"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="收样人"
          align="center"
          prop="receivePerson"
          sortable="custom"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="收样日期"
          align="center"
          prop="receiveDate"
          width="120"
          sortable="custom"
        >
          <template #default="scope">
            <div v-if="scope.row.receiveDate">{{
              formatDate(scope.row.receiveDate, 'YYYY-MM-DD')
            }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="已检样品处理"
          align="center"
          prop="handleResult"
          width="140"
          sortable="custom"
        />
        <el-table-column
          label="报告发送方式"
          align="center"
          prop="reportSendType"
          width="140"
          sortable="custom"
        />
        <el-table-column
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
        </el-table-column>
        <el-table-column label="录入日期" sortable align="center" prop="inputDate" width="120">
          <template #default="scope">
            <div v-if="scope.row.inputDate">{{
              formatDate(scope.row.inputDate, 'YYYY-MM-DD')
            }}</div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="345" prop="createTime">
          <template #default="scope">
            <el-button
              v-hasPermi="['biz:processInstance:create']"
              type="primary"
              link
              size="small"
              plain
              @click="openForm('initiate', scope.row.id)"
              :disabled="!(scope.row.businessStatus == null || scope.row.businessStatus == 4)"
            >
              任务发起
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="openForm('editAndCreate', scope.row.id)"
              v-hasPermi="['sample:manage:create']"
            >
              以此新增
            </el-button>
            <el-button
              v-hasPermi="['sample:manage:process']"
              type="primary"
              link
              size="small"
              plain
              :disabled="!scope.row.processInstanceId"
              @click="openFlwDetail(scope.row)"
            >
              流程详情
            </el-button>
            <el-dropdown>
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
                  <span v-hasPermi="['sample:manage:record']">
                    <el-dropdown-item @click="openFillingRecord(scope.row.id)"
                      >填报记录</el-dropdown-item
                    >
                  </span>
                  <span v-hasPermi="['sample:manage:edit']">
                    <el-dropdown-item
                      @click="openForm('edit', scope.row.id)"
                      :disabled="
                        !(scope.row.businessStatus == null || scope.row.businessStatus == 4)
                      "
                      >编辑</el-dropdown-item
                    >
                  </span>
                  <span v-hasPermi="['sample:manage:delete']">
                    <el-dropdown-item
                      @click="handleDelete(scope.row.id)"
                      :disabled="
                        !(scope.row.businessStatus == null || scope.row.businessStatus == 4)
                      "
                      >删除</el-dropdown-item
                    >
                  </span>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
          <span class="total-text">共 {{ total }} 项数据</span>
          <Pagination
            :total="total"
            v-model:current-page="queryParams.pageNo"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            @current-change="getList"
            @size-change="getList"
            layout="sizes, prev, pager, next, jumper"
            class="pg_box"
          />
     </div>
    </div>
    <FillHistoryModal ref="fillHistoryModalRef" v-else />
  </div>
  <!-- 添加附件弹窗组件 -->
  <attachmentListModal ref="attachmentListModalRef" />

  <editForm ref="formRef" @success="getList" />
  <filePreview ref="fileRef" />
  <Detail ref="detailRef" title="流程详情" @success="getList" />
  <ExamineProjectDetailModal ref="examineProjectDetailRef" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import filePreview from '@/components/FilePreview/index.vue'
import { formatDate } from '@/utils/formatTime'
import * as PostApi from '@/api/system/post'
import * as SampleApi from '@/api/sample'
import * as InspectionItemApi from '@/api/inspectionItem'
import AttachmentListModal from './attachmentListModal.vue'
import editForm from './addEditForm.vue'
import FillHistoryModal from './fillHistoryModal.vue'
import ExamineProjectDetailModal from './examineProjectDetailModal.vue'
import Detail from '@/views/taskManage/detail/index.vue'
import download from '@/utils/download'
import { downloadByUrl } from '@/utils/filt'
import { EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP } from '@/constants/sampleTask'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { usehasPermi } from '@/hooks/web/usehasPermi'
import { camelToUnderscore } from '@/utils/commonMethods'

const { push } = useRouter()
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

const setHeaderStyle = () => {
  return 'custom-header'
}

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  materialId: undefined,
  sampleCode: undefined,
  sampleName: undefined
  // sendExaminer: undefined
})
const defaultProps = {
  children: 'children',
  label: 'materialName'
}

const queryFormRef = ref() // 搜索的表单
const formRef = ref()
const fillHistoryModalRef = ref(false)
const fillHistoryModalshow = ref(false)
const materialList = ref([])

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SampleApi.getSampleInfoPage(queryParams)
    console.log('data', data)
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
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
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
const resetQuery = () => {
  queryParams.orderColumn = undefined
  queryParams.orderAsc = undefined
  tableRef.value?.clearSort()
  queryFormRef.value?.resetFields()
  handleQuery()
}

/**编辑 */
const openForm = (type, id) => {
  formRef.value.open(type, id, materialList.value)
}

const getMaterialTree = async () => {
  const res = await InspectionItemApi.getMaterialTree({ businessType: 1 })
  materialList.value = res
}

const handleDelete = async (id) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await SampleApi.deleteSampleInfo(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}
const handleSelectionChange = (val) => {
  selectIds.value = val.map((item) => item.id)
}
const batchDelete = async () => {
  if (selectIds.value.length === 0) {
    message.warning('请选择要删除的数据！')
    return
  }
  await SampleApi.deleteSampleInfo({ ids: selectIds.value })
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
  fillHistoryModalshow.value = true
  fillHistoryModalRef.value.open(id)
}

const detailRef = ref()

const openFlwDetail = (row) => {
  detailRef.value?.open?.(row.processInstanceId)
}

// 指标详情弹窗的引用
const examineProjectDetailRef = ref()
// 打开指标详情弹窗的方法
const openExamineProjectDetail = async (id) => {
  try {
    const resData = await SampleApi.getSampleInfoDetail(id)
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
  getList()
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
  min-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) -
      var(--app-footer-height) - 90px
  );
}

::v-deep .el-button:focus-visible {
  border: none;
  outline: 2px solid #fff;
}
</style>
