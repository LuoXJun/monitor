<template>
  <ContentWrap class="document-list-search">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <!-- <el-form-item label="代办类型" prop="siloStatus">
        <el-select
          v-model="queryParams.siloStatus"
          placeholder="请选择"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
       -->
      <el-form-item
        v-show="activeName !== 'flw_cl_'"
        :label="activeName === 'flw_wt_' ? '物探指标' : '检测指标'"
        prop="examineProjectId"
      >
        <el-select
          v-model="queryParams.examineProjectId"
          placeholder="请选择"
          clearable
          class="!w-200px"
        >
          <el-option
            v-for="dict in itemList"
            :key="dict.id"
            :label="dict.examineName"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="activeName === 'flw_jc_'" label="样品编号" prop="sampleCode">
        <el-input
          v-model="queryParams.sampleCode"
          placeholder="请输入"
          clearable
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item v-show="activeName === 'flw_jc_'" label="任务类型" prop="taskType">
        <el-select v-model="queryParams.taskType" class="!w-200px" placeholder="请选择" clearable>
          <el-option
            v-for="dict in taskTypeList"
            :key="dict.value"
            :label="dict.name"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务状态" prop="businessStatus">
        <el-select
          v-model="queryParams.businessStatus"
          placeholder="请选择"
          clearable
          class="!w-200px"
        >
          <el-option
            v-for="dict in businessStatusOptions"
            :key="dict.value || dict"
            :label="dict.label || EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[dict].label"
            :value="dict.value || dict"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="activeName === 'flw_cl_'" label="工程名称" prop="projectId">
        <el-tree-select
          v-model="queryParams.projectId"
          :data="projectList"
          :default-expanded-keys="[0]"
          :props="defaultProps2"
          check-strictly
          style="width: 240px"
          node-key="id"
        />
      </el-form-item>

      <el-form-item class="ml-auto">
        <el-button color="#2559ec" dark @click="handleQuery">
          <Icon icon="ep:search" />搜索
        </el-button>
        <el-button @click="resetQuery"> <Icon icon="ep:refresh" />重置 </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <div class="bg-white p-20px">
    <div class="flex items-center justify-between w-full">
      <p class="title">代办任务 </p>
    </div>
    <el-radio-group class="mb-14px" v-if="isAdmin" v-model="activeName">
      <el-radio-button
        v-for="tab in tabsConfig"
        :key="tab.name"
        :name="tab.name"
        :label="tab.label"
        :value="tab.name"
      />
    </el-radio-group>
    <!-- <el-tabs v-show="isAdmin" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="tab in tabsConfig" :key="tab.name" :name="tab.name">
        <template #label>
          <span class="custom-tabs-label flex items-center">
            <img :src="activeName === tab.name ? tab.ac_icon : tab.icon" alt="图标" />
            <span class="ml-5px">{{ tab.label }}</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs> -->
    <el-table
      v-loading="loading"
      @selection-change="handleSelectionChange"
      :data="list"
      ref="tableRef"
      @sort-change="handleSortChange"
      :height="tableHeight"
      :header-cell-class-name="setHeaderStyle"
    >
      <!-- <el-table-column type="selection" /> -->
      <el-table-column label="序号" align="center" type="index" width="80" />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="样品名称"
        sortable="custom"
        align="center"
        prop="sampleName"
        width="160"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="样品编号"
        align="center"
        sortable="custom"
        prop="sampleCode"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_wt_'"
        :label="activeName === 'flw_wt_' ? '物探类型' : '材料类型'"
        align="center"
        sortable="custom"
        prop="materialName"
        :width="activeName !== 'flw_jc_' ? 'auto' : 120"
      />
      <!-- <el-table-column
        v-if="activeName !== 'flw_cl_'"
        :label="activeName === 'flw_wt_' ? '物探指标' : '检测指标'"
        align="center"
          :sortable="activeName === 'flw_jc_'"
        prop="examineProjectName"
        :width="activeName !== 'flw_jc_' ? 'auto' : 160"
      /> -->

      <el-table-column
        v-if="activeName === 'flw_wt_'"
        label="物探指标"
        align="center"
        sortable="custom"
        prop="examineProjectName"
        width="auto"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="检测指标"
        align="center"
        prop="examineProjectName"
        sortable="custom"
        width="160"
        show-overflow-tooltip
      />
      <el-table-column
        label="指标配置"
        align="center"
        prop="property"
        width="120"
        show-overflow-tooltip
        v-if="activeName === 'flw_jc_'"
      >
        <template #default="scope">
          <el-button link type="primary" @click="openExamineProjectDetail(scope.row.businessKey)">
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="工程名称"
        align="center"
        sortable="custom"
        prop="projectName"
        :width="activeName !== 'flw_jc_' ? 'auto' : 160"
      />
      <el-table-column
        label="业务状态"
        align="center"
        sortable="custom"
        prop="businessStatus"
        width="120"
      >
        <template #default="scope">
          <el-tooltip
            v-if="scope.row.businessStatus == 4"
            effect="dark"
            placement="top"
            :content="scope.row.cancelReason"
          >
            <el-tag :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.type">
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
        v-if="activeName === 'flw_jc_'"
        label="委托单位"
        sortable="custom"
        align="center"
        prop="delegateUnitName"
        width="140"
        show-overflow-tooltip
      />
      <!-- <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="受检单位"
        align="center"
        prop="examineUnitName"
        width="140"
        show-overflow-tooltip
      /> -->
      <el-table-column
        label="任务节点名称"
        sortable="custom"
        align="center"
        prop="taskName"
        :width="activeName !== 'flw_jc_' ? 'auto' : 150"
      />
      <el-table-column
        label="任务编号"
        align="center"
        sortable="custom"
        prop="taskId"
        :width="activeName !== 'flw_jc_' ? 'auto' : 140"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="任务类型"
        align="center"
        sortable="custom"
        prop="taskTypeDesc"
        width="120"
      />
      <!-- <el-table-column label="任务状态" align="center" prop="taskStatus" width="120">
        <template #default="scope">
          <el-tag :type="getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type">
            {{ getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label }}
          </el-tag>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="附件" v-if="activeName === 'flw_jc_'" align="center" prop="attachment" show-overflow-tooltip>
        <template #default="scope">
          <el-button
            type="primary"
            v-if="scope.row.attachment != '[]' && scope.row.attachment != null"
            link
            @click="showAttachments(scope.row.attachment)"
          >
            查看附件
          </el-button>
          <span v-else></span>
        </template>
      </el-table-column> -->
      <el-table-column
        align="center"
        sortable
        label="任务发起时间"
        prop="taskCreateTime"
        :width="activeName !== 'flw_jc_' ? 'auto' : 180"
      >
        <template #default="scope">
          <el-tag type="primary">{{ formatDate(scope.row.taskCreateTime) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="120" prop="createTime">
        <template #default="scope">
          <el-button
            v-hasPermi="['task:todo:approve']"
            type="primary"
            link
            size="small"
            plain
            @click="handleDetail(scope.row)"
          >
            {{
              queryParams.businessType === DEPARTMENT_BUSINESS_MAP.jc.key
                ? judgeIsFillTask(scope.row.taskDefKey)
                  ? '去填报'
                  : '去审批'
                : '去审批'
            }}
          </el-button>
          <!-- <el-button link type="primary"> 去审批 </el-button>
          <el-button link type="primary"> 填报 </el-button> -->
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
  <!-- 添加附件弹窗组件 -->
  <attachmentListModal ref="attachmentListModalRef" />
  <ExamineProjectDetailModal ref="examineProjectDetailRef" />
  <submitForm v-if="activeName == 'flw_jc_'" ref="formRef" @success="getList" />
  <Detail v-if="activeName == 'flw_jc_'" ref="detailRef" @success="getList" />
  <clSubmitForm v-if="activeName == 'flw_cl_'" ref="formRef" @success="getList" />
  <clDetail v-if="activeName == 'flw_cl_'" ref="detailRef" @success="getList" />
  <wtSubmitForm v-if="activeName == 'flw_wt_'" ref="formRef" @success="getList" />
  <wtDetail v-if="activeName == 'flw_wt_'" ref="detailRef" @success="getList" />
</template>
<script setup>
import { DocumentCopy, DocumentRemove, Document } from '@element-plus/icons-vue'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import * as PostApi from '@/api/system/post'
import * as TaskApi from '@/api/task'
import * as ItemApi from '@/api/itemManage'
import * as InspectionItemApi from '@/api/inspectionItem'
import * as SampleApi from '@/api/sample'
import { EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP } from '@/constants/sampleTask'
// import editForm from './addEditForm.vue'
import ExamineProjectDetailModal from '../../sampleManage/examineProjectDetailModal.vue'
import AttachmentListModal from '../../sampleManage/attachmentListModal.vue'
import submitForm from './submitForm.vue'
import { usePermissionStore } from '@/store/modules/permission';// 导入权限模块
import wtSubmitForm from '../../wtTaskManage/toDoTask/submitForm.vue'
import clSubmitForm from '../../clTaskManage/toDoTask/submitForm.vue'
import { judgeIsFillTask, getWtTaskStatus } from '@/utils/sampleTask'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import Detail from '../detail/index.vue'
import clDetail from '../../clTaskManage/detail/index.vue'
import wtDetail from '../../wtTaskManage/detail/index.vue'
import { useWorkbench } from '@/hooks/web/useWorkbench'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { camelToUnderscore } from '@/utils/commonMethods'
import tab_jc from '@/assets/imgs/tab_jc.png'
import tab_jc1 from '@/assets/imgs/tab_jc1.png'
import tab_wt from '@/assets/imgs/tab_wt.png'
import tab_wt1 from '@/assets/imgs/tab_wt1.png'
import tab_cl from '@/assets/imgs/tab_cl.png'
import tab_cl1 from '@/assets/imgs/tab_cl1.png'
const { push } = useRouter()
const { isAdmin, dashboardConfig } = useWorkbench()
const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const { query } = useRoute() // 查询参数
const colorList = ref(['#67C23A', '#F56C6C', '#F56C6C', '#67C23A'])
const selectIds = ref([])
const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  businessType: dashboardConfig.data.flwTag,
  pageNo: 1,
  pageSize: 10,
  examineProjectId: undefined,
  sampleCode: undefined,
  projectId: undefined,
  taskId: undefined,
  taskType: undefined,
  businessStatus: undefined
})
const { tableHeight } = useTableHeight()
const queryFormRef = ref() // 搜索的表单
const formRef = ref()
const itemList = ref([])
const activeName = ref('flw_jc_')
const projectList = ref([])
const tableRef = ref(null)

//储存当前选中的路由
    const permissionStore = usePermissionStore()


const defaultProps2 = {
  children: 'children',
  label: 'projectName'
}

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

// 定义 tabs 配置
const tabsConfig = [
  {
    name: 'flw_jc_',
    icon: tab_jc,
    ac_icon: tab_jc1,
    label: '试验中心'
  },
  {
    name: 'flw_wt_',
    icon: tab_wt,
    ac_icon: tab_wt1,
    label: '物探中心'
  },
  {
    name: 'flw_cl_',
    icon: tab_cl,
    ac_icon: tab_cl1,
    label: '测量中心'
  }
]

//动态名称
const setHeaderStyle = () => {
  return 'custom-header'
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TaskApi.getSampleInfoTodoTaskPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
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
  if (query.taskId) {
    push({
      name: 'toDoTask'
    })
  }
  queryParams.orderColumn = undefined
  queryParams.orderAsc = undefined
  tableRef.value?.clearSort()
  queryFormRef.value?.resetFields()
  handleQuery()
}

/**编辑 */
const openForm = (type, id) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await MaterialApi.delMaterial(id)
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
  await MaterialApi.batchDelMaterial({ ids: selectIds.value })
  message.success(t('common.delSuccess'))
  getList()
}

const detailRef = ref('')

const handleDetail = (row) => {
  // router.push({
  //   name: 'TaskDetail',
  //   query: {
  //     id: row.procInstId,
  //     sampleId: row.id
  //   }
  // })
  if (
    queryParams.businessType === DEPARTMENT_BUSINESS_MAP.jc.key &&
    judgeIsFillTask(row.taskDefKey)
  ) {
    router.push({
      name: 'ledgerManage',
      query: {
        examineProjectId: row.examineProjectId,
        processInstanceId: row.processInstanceId,
        businessKey:row.businessKey
      }
    })
  } else {
  detailRef.value?.open(row.procInstId)
  }
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

const fetchItemList = async (data) => {
  let businessType

  switch (activeName.value) {
    case DEPARTMENT_BUSINESS_MAP.jc.key:
      businessType = 1
      break
    case DEPARTMENT_BUSINESS_MAP.wt.key:
      businessType = 2
      break
    default:
      break
  }

  const res = await InspectionItemApi.getExamineProjectList({ businessType, materialType: data })
  itemList.value = res
}
const handleClick = (tab) => {
  activeName.value = tab.props.name
  queryParams.orderColumn = undefined
  queryParams.orderAsc = undefined
  tableRef.value?.clearSort()
  queryFormRef.value?.resetFields()
  queryParams.businessType = tab.props.name
  queryParams.pageNo = 1

  getList()

  if (activeName.value !== DEPARTMENT_BUSINESS_MAP.cl.key) {
    fetchItemList()
  }
}
const getProjectTree = async () => {
  const data = await ItemApi.getItemList()
  projectList.value = data
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

// 添加计算属性
const businessStatusOptions = computed(() => {
  return activeName.value === 'flw_jc_'
    ? Object.keys(EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP).map((key) => ({
        value: key,
        label: EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[key].label
      }))
    : getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)
})

/** 初始化 */
onMounted(() => {
  activeName.value = dashboardConfig.data.flwTag
  queryParams.taskId = query.taskId
  getList()
  fetchItemList()
  getProjectTree()
})
</script>

<style scoped>
@import '@/styles/tableCommon.scss';
.red {
  color: red;
}

.green {
  color: green;
}

.full-height {
  min-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) -
      var(--app-footer-height) - 90px
  );
}
</style>
