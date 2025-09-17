<template>
  <ContentWrap class="document-list-search">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
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
      <el-form-item v-if="activeName === 'flw_jc_'" label="样品编号" prop="sampleCode">
        <el-input
          v-model="queryParams.sampleCode"
          placeholder="请输入"
          clearable
          class="!w-240px"
        />
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
      <!-- <el-form-item label="任务类型" prop="siloStatus">
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
        <el-form-item label="代办类型" prop="siloStatus">
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

        <el-form-item label="任务状态" prop="siloStatus">
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
        </el-form-item> -->

      <el-form-item class="ml-auto">
        <el-button color="rgb(63, 98, 151)" dark @click="handleQuery">
          <Icon icon="ep:search" />搜索
        </el-button>
        <el-button @click="resetQuery" color="rgb(229, 231, 235)"> <Icon icon="ep:refresh" />重置 </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <div class="bg-white p-20px">
    <div class="flex items-center justify-between w-full">
      <p class="title">已办任务 </p>
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
      border
      ref="tableRef"
      @sort-change="handleSortChange"
      stripe
      :height="tableHeight"
    >
      <el-table-column label="序号" align="center" type="index" width="80" />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="样品名称"
        sortable
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
        v-if="activeName !== 'flw_cl_'"
        :label="activeName === 'flw_wt_' ? '物探类型' : '材料类型'"
        align="center"
        prop="materialName"
        sortable="custom"
        width="120"
        show-overflow-tooltip
      />
      <!-- <el-table-column
        v-if="activeName !== 'flw_cl_'"
        :label="activeName === 'flw_wt_' ? '物探指标' : '检测指标'"
        align="center"
               :sortable="activeName === 'flw_jc_'"
        prop="examineProjectName"
        width="140"
        show-overflow-tooltip
      /> -->
      <el-table-column
        v-if="activeName === 'flw_wt_'"
        label="物探指标"
        align="center"
        prop="examineProjectName"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="检测指标"
        align="center"
        prop="examineProjectName"
        sortable="custom"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column
        label="任务名称"
        align="center"
        sortable="custom"
        prop="taskName"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column
        label="任务编号"
        align="center"
        sortable="custom"
        prop="taskId"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="activeName === 'flw_jc_'"
        label="任务类型"
        align="center"
        sortable="custom"
        prop="taskTypeDesc"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        label="工程名称"
        align="center"
        sortable="custom"
        prop="projectName"
        width="140"
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
        label="业务状态"
        align="center"
        sortable="custom"
        prop="businessStatus"
        :width="activeName === 'flw_cl_' ? 'auto' : '120'"
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
        label="任务状态"
        sortable="custom"
        align="center"
        prop="taskStatus"
        width="120"
      >
        <template #default="scope">
          <el-tooltip
            v-if="scope.row.taskStatus == 4"
            effect="dark"
            placement="top"
            :content="scope.row.cancelReason"
          >
            <el-tag
              :type="
                activeName === DEPARTMENT_BUSINESS_MAP.jc.key
                  ? getTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type
                  : getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type
              "
            >
              {{
                activeName === DEPARTMENT_BUSINESS_MAP.jc.key
                  ? getTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label
                  : getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label
              }}
            </el-tag>
          </el-tooltip>
          <el-tag
            v-else
            :type="
              activeName === DEPARTMENT_BUSINESS_MAP.jc.key
                ? getTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type
                : getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type
            "
          >
            {{
              activeName === DEPARTMENT_BUSINESS_MAP.jc.key
                ? getTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label
                : getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label
            }}
          </el-tag>
        </template>
      </el-table-column>
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
        align="center"
        label="任务开始时间"
        sortable
        prop="taskStartTime"
        width="180"
      >
        <template #default="scope">
          <el-tag type="primary">{{ formatDate(scope.row.taskStartTime) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="任务结束时间" sortable prop="taskEndTime" width="180">
        <template #default="scope">
          <el-tag type="primary">{{ formatDate(scope.row.taskEndTime) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="耗时"
        sortable="custom"
        prop="taskDuration"
        width="160"
      >
        <template #default="scope">
          {{ formatPast2(scope.row.taskDuration) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="120" prop="createTime">
        <template #default="scope">
          <el-button
            v-hasPermi="['task:view']"
            type="primary"
            link
            size="small"
            plain
            @click="handleDetail(scope.row)"
          >
            查看
          </el-button>
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
  <!-- <submitForm ref="formRef" @success="getList" /> -->
  <Detail v-if="activeName == 'flw_jc_'" ref="detailRef" @success="getList" />
  <clDetail v-if="activeName == 'flw_cl_'" ref="detailRef" @success="getList" />
  <wtDetail v-if="activeName == 'flw_wt_'" ref="detailRef" @success="getList" />
</template>
<script setup>
import { DocumentCopy, DocumentRemove, Document } from '@element-plus/icons-vue'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP } from '@/constants/sampleTask'
import * as PostApi from '@/api/system/post'
import * as TaskApi from '@/api/task'
import * as ItemApi from '@/api/itemManage'
import * as SampleApi from '@/api/sample'
import { formatDate, formatPast2 } from '@/utils/formatTime'
import * as InspectionItemApi from '@/api/inspectionItem'
// import editForm from './addEditForm.vue'
// import submitForm from './submitForm.vue';
import { TASK_STATUS_MAP } from '@/constants/sampleTask'
import { getTaskStatus, getWtTaskStatus } from '@/utils/sampleTask'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import Detail from '../detail/index.vue'
import clDetail from '../../clTaskManage/detail/index.vue'
import wtDetail from '../../wtTaskManage/detail/index.vue'
import ExamineProjectDetailModal from '../../sampleManage/examineProjectDetailModal.vue'
import AttachmentListModal from '../../sampleManage/attachmentListModal.vue'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { camelToUnderscore } from '@/utils/commonMethods'

import tab_jc from '@/assets/imgs/tab_jc.png'
import tab_jc1 from '@/assets/imgs/tab_jc1.png'
import tab_wt from '@/assets/imgs/tab_wt.png'
import tab_wt1 from '@/assets/imgs/tab_wt1.png'
import tab_cl from '@/assets/imgs/tab_cl.png'
import tab_cl1 from '@/assets/imgs/tab_cl1.png'

import { useWorkbench } from '@/hooks/web/useWorkbench'
const { isAdmin, dashboardConfig } = useWorkbench()

const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const { tableHeight } = useTableHeight()
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
  projectId: undefined
})
const itemList = ref([])
const tableRef = ref()

const queryFormRef = ref() // 搜索的表单
const formRef = ref()
const activeName = ref('flw_jc_')
const projectList = ref([])

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
    const data = await TaskApi.getSampleInfoDoneTaskPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
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

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
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

const detailRef = ref('')

const handleDetail = (row) => {
  // router.push({
  //   name: 'TaskDetail',
  //   query: {
  //     id: row.procInstId,
  //     sampleId: row.id
  //   }
  // })
  detailRef.value?.open(row.procInstId)
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

const attachmentListModalRef = ref()
// 显示附件方法
const showAttachments = (attachment) => {
  console.log('附件列表：', attachment)
  attachmentListModalRef.value.open(attachment)
}

/** 初始化 */
onMounted(() => {
  activeName.value = dashboardConfig.data.flwTag
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
</style>
