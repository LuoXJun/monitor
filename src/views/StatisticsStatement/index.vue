<template>
  <ContentWrap  class="document-list-search">
  <el-form
        class="md-5px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="工程部位" prop="projectId">
          <el-tree-select
            clearable
            v-model="queryParams.projectId"
            :data="projectList"
            :default-expanded-keys="[0]"
            :props="defaultProps"
            check-strictly
            style="width: 200px"
            node-key="id"
          />
        </el-form-item>
        <el-form-item class="ml-auto">
          <el-button color="rgb(63, 98, 151)" dark @click="handleQuery">
            <Icon icon="ep:search" />搜索
          </el-button>
          <el-button color ="rgb(229, 231, 235)" @click="resetQuery"> <Icon icon="ep:refresh" />重置 </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>
  <div class="bg-white p-20px">
   
        <div class="flex items-center justify-between mb-0px w-full">
          <p class="title">统计报表
          </p>
           
        </div>
      <el-radio-group v-if="isAdmin" v-model="activeName" @change="handleClick" style="margin-bottom: 10px" class="custom-radio-group">
        
        <el-radio-button  v-for="item in tabsConfig" :key="item.name" :name="item.name" :label="item.name">{{item.label}}</el-radio-button>

      </el-radio-group>


    <!-- <el-tabs v-if="isAdmin" v-model="activeName" @tab-click="handleClick" >
      <el-tab-pane v-for="tab in tabsConfig" :key="tab.name" :name="tab.name">
        <template #label>
          <span class="custom-tabs-label flex items-center">
            <span class="ml-5px">{{ tab.label }}</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs> -->
   
    
    <el-table
      v-loading="loading"
      @selection-change="handleSelectionChange"
      :data="list"
      show-summary
      ref="tableRef"
      :height="tableHeight"
      :summary-method="getSummaries"
      :header-cell-class-name="setHeaderStyle"

    >
      <el-table-column label="序号" width="70px" type="index" align="center" />
      <el-table-column label="工程部位" sortable align="center" prop="projectName" />
      <el-table-column
        :label="
          activeName === 'flw_jc_'
            ? '检测次数'
            : activeName === 'flw_wt_'
              ? '任务次数'
              : activeName === 'flw_cl_'
                ? '归档次数'
                : ''
        "
        sortable
        align="center"
        prop="totalCount"
      />
      <el-table-column label="通过次数" sortable align="center" prop="passCount" />
      <el-table-column label="未通过次数" sortable align="center" prop="noPassCount" />
      <el-table-column
        label="正在检测次数"
        align="center"
        sortable
        prop="doingCount"
        v-if="activeName == 'flw_jc_'"
      />
    </el-table>
  </div>
</template>
<script setup>
import { useWorkbench } from '@/hooks/web/useWorkbench'
import { dateFormatter } from '@/utils/formatTime'
import * as ItemApi from '@/api/itemManage'
import * as HomeApi from '@/api/home'

import tab_jc from '@/assets/imgs/tab_jc.png'
import tab_jc1 from '@/assets/imgs/tab_jc1.png'
import tab_wt from '@/assets/imgs/tab_wt.png'
import tab_wt1 from '@/assets/imgs/tab_wt1.png'
import tab_cl from '@/assets/imgs/tab_cl.png'
import tab_cl1 from '@/assets/imgs/tab_cl1.png'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { camelToUnderscore } from '@/utils/commonMethods'
const setHeaderStyle = () => {
  return 'custom-header'
}
const { tableHeight } = useTableHeight({
  extraHeight: -50
})
const { isAdmin, dashboardConfig } = useWorkbench()

const defaultProps = {
  children: 'children',
  label: 'projectName'
}

const message = useMessage() // 消息弹窗

const { t } = useI18n() // 国际化

const selectIds = ref([])
const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const tableRef = ref(null)

const projectList = ref([])
const list = ref([]) // 列表的数
const queryParams = reactive({
  projectId: undefined,
  businessType: undefined
})

const queryFormRef = ref() // 搜索的表单
const formRef = ref()
const activeName = ref('flw_jc_')

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
    const data = await HomeApi.getReportList(queryParams)
    list.value = data.data
  } finally {
    loading.value = false
  }
}

const getSummaries = (param) => {
  const { columns, data } = param
  const sums = []

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = ''
    } else if (index === 1) {
      sums[index] = '合计'
    } else {
      const values = data.map((item) => Number(item[column.property]))
      if (!values.every((value) => isNaN(value))) {
        sums[index] = values.reduce((prev, curr) => {
          const value = Number(curr)
          if (!isNaN(value)) {
            return prev + curr
          } else {
            return prev
          }
        }, 0)
      } else {
        sums[index] = 'N/A'
      }
    }
  })

  return sums
}

const getProjectTree = async () => {
  const data = await ItemApi.getItemList()
  projectList.value = data
}

/** 搜索按钮操作 */
const handleQuery = () => {
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

const handleSelectionChange = (val) => {
  selectIds.value = val.map((item) => item.id)
}

const handleClick = (value) => {
  queryParams.orderColumn = undefined
  queryParams.orderAsc = undefined
  tableRef.value?.clearSort()
  queryFormRef.value?.resetFields()
  // queryParams.businessType = tab.props.name
   // 根据使用的组件类型选择处理方式
  queryParams.businessType = 
    typeof value === 'object'   // 如果是 Tabs 组件传递的 tab 对象
    ? value.props.name          // 保持原有逻辑
    : value                     // 如果是 Radio 传递的值
  
  // 重置分页并重新获取列表
  queryParams.pageNo = 1
  getList()
}

/** 初始化 */
onMounted(async () => {
  queryParams.businessType = !isAdmin ? dashboardConfig.data.flwTag : undefined
  activeName.value = dashboardConfig.data.flwTag
  getProjectTree()
  getList()
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
    100vh - var(--top-tool-height) - var(--tags-view-height)- var(--tags-view-height) - var(--app-content-padding) -
      var(--app-footer-height) - 93px
  );
}
.document-list-search{
    height: 55px;
    margin-bottom: 8px;
    padding-top: 10px;
    padding-left: 16px;
}
::v-deep .el-radio-group{
  background-color: #F1F2F5;
  padding:3px 3px;
  border-radius: 5px;
  box-shadow: none;
}
::v-deep .el-radio-button__inner{
 background-color: #F1F2F5;
  color: #4E5969;
  border: none;
  border-radius: 5px;
  box-shadow: none;
  
}
::v-deep .el-radio-button.is-active .el-radio-button__original-radio:not(:disabled)+.el-radio-button__inner {
    background-color: #fff;
     border: none;
     box-shadow: none;
    color: #1E2945;
    border-radius: 5px;
}
/* ::v-deep .demo-tabs > .el-tabs__content {
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
  border: none;
} */
</style>
