<template>
  <ContentWrap class="document-list-search">
    <el-form
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item
        v-show="activeName !== 'flw_cl_'"
        :label="activeName === 'flw_wt_' ? '物探指标' : '检测指标'"
        prop="examineProjectId"
      >
        <el-select
          v-model="queryParams.examineProjectId"
          placeholder="请选择"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in itemList"
            :key="dict.id"
            :label="dict.examineName"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="activeName === 'flw_jc_'" label="样品名称" prop="sampleName">
        <el-input
          v-model="queryParams.sampleName"
          placeholder="请输入"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item v-show="activeName === 'flw_jc_'" label="试验人" prop="examiner">
        <el-select v-model="queryParams.examiner" placeholder="请选择" clearable class="!w-240px">
          <el-option
            v-for="dict in userOptions"
            :key="dict.id"
            :label="dict.nickname"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="activeName === 'flw_cl_'" label="工程名称" prop="projectId">
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
        <el-button color="rgb(63, 98, 151)" dark @click="handleQuery"
          ><Icon icon="ep:search" /> 搜索</el-button
        >
        <el-button @click="resetQuery" color="rgb(229, 231, 235)"> <Icon icon="ep:refresh" />重置 </el-button>
        <el-button
          v-hasPermi="['biz:processInstance:create']"
          v-show="activeName === 'flw_wt_'"
          type="primary"
          @click="openForm('initiate')"
        >
          任务发起
        </el-button>
        <el-button
          v-hasPermi="['biz:processInstance:create']"
          v-show="activeName === 'flw_cl_'"
          type="primary"
          @click="openForm('create')"
        >
          任务发起
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <div class="bg-white p-20px">
    <div class="flex items-center justify-between w-full">
      <p class="title">任务分配 </p>
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
    <!-- <el-tabs v-if="isAdmin" v-model="activeName" @tab-click="handleClick">
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
        sortable="custom"
        label="样品名称"
        align="center"
        prop="sampleName"
        width="160"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="样品编号"
        sortable="custom"
        align="center"
        prop="sampleCode"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName !== 'flw_cl_'"
        :label="activeName === 'flw_wt_' ? '物探类型' : '材料类型'"
        align="center"
        prop="materialName"
        sortable="custom"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_wt_'"
        label="物探指标"
        sortable="custom"
        align="center"
        prop="examineProjectName"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="检测指标"
        align="center"
        prop="examineProjectName"
        sortable="custom"
        width="120"
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
        v-if="activeName === 'flw_jc_'"
        label="试验人"
        align="center"
        sortable="custom"
        prop="examinerName"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        label="工程名称"
        align="center"
        sortable="custom"
        prop="projectName"
        :width="activeName === 'flw_cl_' ? 'auto' : '160'"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="委托单位"
        align="center"
        sortable="custom"
        prop="delegateUnitName"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="受检单位"
        align="center"
        sortable="custom"
        prop="examineUnitName"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column
        label="流程编号"
        align="center"
        sortable="custom"
        prop="processInstanceId"
        :width="activeName !== 'flw_jc_' ? 'auto' : '140'"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="任务类型"
        align="center"
        prop="taskTypeDesc"
        sortable="custom"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        label="业务状态"
        align="center"
        sortable
        prop="businessStatus"
        :width="activeName !== 'flw_jc_' ? 'auto' : '120'"
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
        label="任务发起人"
        align="center"
        prop="startUserName"
        sortable="custom"
        :width="activeName !== 'flw_jc_' ? 'auto' : 120"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        label="发起时间"
        sortable
        prop="startTime"
        :width="activeName !== 'flw_jc_' ? 'auto' : 180"
      >
        <template #default="scope">
          <el-tag type="primary">{{ formatDate(scope.row.startTime) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="150" prop="createTime">
        <template #default="scope">
          <el-button
            v-hasPermi="['task:view']"
            plain
            size="small"
            type="primary"
            link
            @click="handleDetail(scope.row)"
          >
            详情
          </el-button>
          <el-button
            plain
            v-hasPermi="['task:cancel']"
            size="small"
            type="primary"
            link
            color="rgb(213, 73, 65)"
            v-if="judgeCancelBtnShow(scope.row)"
            @click="handleCancel(scope.row)"
          >
            取消
          </el-button>
          <!-- <el-button link type="primary" v-else @click="handleCreate(scope.row)">
            重新发起
          </el-button> -->
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
  <editForm v-if="activeName == 'flw_jc_'" ref="formRef" @success="getList" />
  <Detail v-if="activeName == 'flw_jc_'" ref="detailRef" @success="getList" />
  <clEditForm v-if="activeName == 'flw_cl_'" ref="formRef" @success="getList" />
  <clDetail v-if="activeName == 'flw_cl_'" ref="detailRef" @success="getList" />
  <wtEditForm v-if="activeName == 'flw_wt_'" ref="formRef" @success="getList" />
  <wtDetail v-if="activeName == 'flw_wt_'" ref="detailRef" @success="getList" />
</template>
<script setup>
import { DocumentCopy, DocumentRemove, Document } from '@element-plus/icons-vue'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { formatDate, formatPast2 } from '@/utils/formatTime'
import * as ItemApi from '@/api/itemManage'
import * as PostApi from '@/api/system/post'
import * as TaskApi from '@/api/task'
import * as UserApi from '@/api/system/user'
import * as SampleApi from '@/api/sample'
import { EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP } from '@/constants/sampleTask'
import * as InspectionItemApi from '@/api/inspectionItem'
import editForm from './addEditForm.vue'
import clEditForm from '../../clTaskManage/taskDistribution/taskInitiateForm.vue'
import wtEditForm from '../../wtTaskManage/taskDistribution/addEditForm.vue'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import Detail from '../detail/index.vue'
import clDetail from '../../clTaskManage/detail/index.vue'
import wtDetail from '../../wtTaskManage/detail/index.vue'
import ExamineProjectDetailModal from '../../sampleManage/examineProjectDetailModal.vue'
import AttachmentListModal from '../../sampleManage/attachmentListModal.vue'
import { useUserStore } from '@/store/modules/user'
import { useWorkbench } from '@/hooks/web/useWorkbench'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { camelToUnderscore } from '@/utils/commonMethods'

const userStore = useUserStore()
console.log('🚀 ~ userStore:', userStore.user.id)
const { isAdmin, dashboardConfig } = useWorkbench()

import tab_jc from '@/assets/imgs/tab_jc.png'
import tab_jc1 from '@/assets/imgs/tab_jc1.png'
import tab_wt from '@/assets/imgs/tab_wt.png'
import tab_wt1 from '@/assets/imgs/tab_wt1.png'
import tab_cl from '@/assets/imgs/tab_cl.png'
import tab_cl1 from '@/assets/imgs/tab_cl1.png'
import { custom } from 'vue-types'

const setHeaderStyle = () => {
  return 'custom-header'
}

const judgeCancelBtnShow = (row) => {
  const canCancelByProcessStatus = row.processStatus == 0 || row.processStatus == 1

  // NOTE: 接口返回的是string，用户原始数据是number，用==
  const isCurrentUserProcess = userStore.user.id == row.startUserId
  return canCancelByProcessStatus && isCurrentUserProcess
}

const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const colorList = ref(['#67C23A', '#F56C6C', '#F56C6C', '#67C23A'])
const selectIds = ref([])
const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  businessType: dashboardConfig.data.flwTag,
  pageNo: 1,
  pageSize: 10,
  sampleName: undefined,
  examineProjectId: undefined,
  examiner: undefined,
  projectId: undefined
})
const itemList = ref([])
const userOptions = ref([])

const queryFormRef = ref() // 搜索的表单
const formRef = ref()
const activeName = ref('flw_jc_')
const projectList = ref([])
const tableRef = ref(null)

const defaultProps2 = {
  children: 'children',
  label: 'projectName'
}

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

/** 查询列表 */
const getList = async () => {
  loading.value = true

  try {
    const data = await TaskApi.getSampleInfoSendTaskPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const detailRef = ref('')

/** 查看详情 */
const handleDetail = (row) => {
  // router.push({
  //   name: 'TaskDetail',
  //   query: {
  //     id: row.processInstanceId,
  //     sampleId: row.id
  //   }
  // })
  detailRef.value?.open(row.processInstanceId)
}

/** 取消按钮操作 */
const handleCancel = async (row) => {
  // 二次确认
  const { value } = await ElMessageBox.prompt('请输入取消原因', '取消流程', {
    confirmButtonText: t('common.ok'),
    cancelButtonText: t('common.cancel'),
    inputPattern: /^[\s\S]*.*\S[\s\S]*$/, // 判断非空，且非空格
    inputErrorMessage: '取消原因不能为空'
  })
  console.log('🚀 ~ handleCancel ~ value:', value)

  // 发起取消
  await TaskApi.cancelTask(row.processInstanceId, value)
  message.success('取消成功')
  // // 刷新列表
  await getList()
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

  const res = await InspectionItemApi.getExamineProjectList({
    materialType: data,
    businessType: businessType
  })
  itemList.value = res
}

const handleClick = (tab) => {
  activeName.value = tab.props.name
  queryParams.orderColumn = undefined
  queryParams.orderAsc = undefined
  tableRef.value?.clearSort()
  queryFormRef.value?.resetFields()
  queryParams.businessType = tab.props.name
  // 重置分页并重新获取列表
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

const { tableHeight } = useTableHeight()

/** 初始化 */
onMounted(async () => {
  activeName.value = dashboardConfig.data.flwTag
  getList()
  fetchItemList()
  getProjectTree()
  userOptions.value = await UserApi.getSimpleUserList()
})
</script>

<style>
/* 修改未选中状态样式 */
.el-radio-button:not(.is-active) .el-radio-button__inner {
  background: #f5f7fa;
  /* border: none; */
  border: #f5f7fa 3px solid !important;
  color: #606266;
}

/* 修改选中状态样式 */
.el-radio-button.is-active .el-radio-button__inner {
  background: #fff !important;
  border: #f5f7fa 3px solid !important;
  color: #000 !important;
  box-shadow: -1px 0 0 0 #f5f7fa !important;
}

/* 修改悬停状态样式 */
/* .el-radio-button__inner:hover {
  color: #409eff;
} */
</style>

<style scoped>
@import '@/styles/tableCommon.scss';
.red {
  color: red;
}

.green {
  color: green;
}
</style>
