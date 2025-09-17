<template>
  <div class="center-left">
    <div class="title">任务进度</div>
    <el-radio-group v-model="activeName" @tab-click="handleClick">
    <el-radio-button :value="TABS_MAP.todo.key">{{TABS_MAP.todo.label}}</el-radio-button>
    <el-radio-button :value="TABS_MAP.done.key">{{TABS_MAP.done.label}}</el-radio-button>
    <el-radio-button :value="TABS_MAP.send.key">{{TABS_MAP.send.label}}</el-radio-button>
    <div class="more" @click="handleLinkToList"></div>
   </el-radio-group>
    <el-tabs v-model="activeName" >
      <el-tab-pane :name="TABS_MAP.todo.key">
        <div class="list">
          <el-table
            :data="sampleInfoTodoTaskList"
            height="100%"
            style="width: 100%"
            ref="todoTableRef"
            @sort-change="handleSortChange"
          >
            <el-table-column
              v-for="col in dashboardConfig?.task?.todo?.columns"
              :key="col.key"
              :prop="col.key"
              :label="col.name"
              :formatter="col.formatter"
              sortable="custom"
              align="center"
            >
              <template #default="scope">
                <el-button
                  v-if="col.template?.show && col.template?.type == 'link'"
                  type="primary"
                  link
                  @click="handleMethod(col.template?.method, scope.row, TABS_MAP.todo.key)"
                >
                  {{ scope.row?.[col.key] }}
                </el-button>
                <el-tag
                  v-else-if="col.template?.type == 'dict'"
                  :type="
                    props.dashboardConfig.flwTag === DEPARTMENT_BUSINESS_MAP.jc.key
                      ? getTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type
                      : getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type
                  "
                >
                  {{
                    props.dashboardConfig.flwTag === DEPARTMENT_BUSINESS_MAP.jc.key
                      ? getTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label
                      : getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label
                  }}
                </el-tag>
                <el-tag
                  v-else-if="col.template?.type == 'b_dict'"
                  :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.type"
                >
                  {{ EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.label }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :name="TABS_MAP.done.key">
        <div class="list">
          <el-table
            :data="sampleInfoDoneTaskList"
            height="100%"
            style="width: 100%"
            ref="doneTableRef"
            @sort-change="handleSortChange"
          >
            <el-table-column
              v-for="col in dashboardConfig?.task?.done?.columns"
              :key="col.key"
              :prop="col.key"
              :label="col.name"
              :formatter="col.formatter"
              sortable="custom"
              align="center"
            >
              <template #default="scope">
                <el-button
                  v-if="col.template?.show && col.template?.type == 'link'"
                  type="primary"
                  link
                  @click="handleMethod(col.template?.method, scope.row, TABS_MAP.todo.key)"
                >
                  {{ scope.row?.[col.key] }}
                </el-button>
                <el-tag
                  v-else-if="col.template?.type == 'dict'"
                  :type="
                    props.dashboardConfig.flwTag === DEPARTMENT_BUSINESS_MAP.jc.key
                      ? getTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type
                      : getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type
                  "
                >
                  {{
                    props.dashboardConfig.flwTag === DEPARTMENT_BUSINESS_MAP.jc.key
                      ? getTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label
                      : getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label
                  }}
                </el-tag>
                <el-tag
                  v-else-if="col.template?.type == 'b_dict'"
                  :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.type"
                >
                  {{ EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.label }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :name="TABS_MAP.send.key">
        <div class="list">
          <el-table
            :data="sampleInfoSendTaskList"
            height="100%"
            style="width: 100%"
            ref="sendTableRef"
            @sort-change="handleSortChange"
          >
            <el-table-column
              v-for="col in dashboardConfig?.task?.send?.columns"
              :key="col.key"
              :prop="col.key"
              :label="col.name"
              :formatter="col.formatter"
              sortable="custom"
              align="center"
            >
              <template #default="scope">
                <el-button
                  v-if="col.template?.show && col.template?.type == 'link'"
                  type="primary"
                  link
                  @click="handleMethod(col.template?.method, scope.row, TABS_MAP.todo.key)"
                >
                  {{ scope.row?.[col.key] }}
                </el-button>
                <el-tag
                  v-else-if="col.template?.type == 'dict'"
                  :type="getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type"
                >
                  {{ getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label }}
                </el-tag>
                <el-tag
                  v-else-if="col.template?.type == 'b_dict'"
                  :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.type"
                >
                  {{ EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.businessStatus]?.label }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
    
  </div>
  <JcDetail ref="jcDetailRef" @success="handleSuccess" />
  <WtDetail ref="wtDetailRef" @success="handleSuccess" />
  <ClDetail ref="clDetailRef" @success="handleSuccess" />
</template>
<script setup>
import { ref } from 'vue'
import * as TaskApi from '@/api/task'
import { formatDate, dateFormatter } from '@/utils/formatTime'
import { getTaskStatus, getWtTaskStatus } from '@/utils/sampleTask'
import { EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP } from '@/constants/sampleTask'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import { useEmitt } from '@/hooks/web/useEmitt'
import JcDetail from '@/views/taskManage/detail/index.vue'
import WtDetail from '@/views/wtTaskManage/detail/index.vue'
import ClDetail from '@/views/clTaskManage/detail/index.vue'
import { camelToUnderscore } from '@/utils/commonMethods'

const props = defineProps({
  dashboardConfig: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const TABS_MAP = {
  todo: {
    key: 'todo',
    label: '待办任务',
    // 这里的组件名是和系统管理-菜单管理对应的组件名称一样，不然会找不到组件
    linkToCpName: 'toDoTask'
  },
  done: {
    key: 'done',
    label: '已办任务',
    linkToCpName: 'completedTask'
  },
  send: {
    key: 'send',
    label: '已发任务',
    linkToCpName: 'taskDistribution'
  }
}

const router = useRouter()

const activeName = ref(TABS_MAP.todo.key)
const queryParams = reactive({
  // ...dashboardConfig?.query,
  pageNo: 1,
  pageSize: 30
})
const sampleInfoTodoTaskList = ref([])
const sampleInfoDoneTaskList = ref([])
const sampleInfoSendTaskList = ref([])

const jcDetailRef = ref()
const wtDetailRef = ref()
const clDetailRef = ref()

const todoTableRef = ref()
const doneTableRef = ref()
const sendTableRef = ref()

watch(
  () => props.dashboardConfig,
  (value) => {
    fetchTasksPage()
  },
  { deep: true }
)

// mock多点数据看效果
const mockMoreData = (backendData, count) => {
  const mockArray = []
  for (let i = 0; i < count; i++) {
    const newData = JSON.parse(JSON.stringify(backendData))
    newData.id = i + 1
    mockArray.push(newData)
  }
  return mockArray
}

const handleClick = (tab) => {
  console.log('🚀 ~ handleClick ~ tab:dashboardConfig', props.dashboardConfig)
  queryParams.orderAsc = undefined
  queryParams.orderColumn = undefined
  todoTableRef.value?.clearSort()
  doneTableRef.value?.clearSort()
  sendTableRef.value?.clearSort()
  console.log('🚀 ~ handleClick ~ activeName.value:', tab.props.name)
  switch (tab.props.name) {
    case TABS_MAP.todo.key:
      fetchSampleInfoTodoTaskPage()
      break
    case TABS_MAP.done.key:
      fetchSampleInfoDoneTaskPage()
      break
    case TABS_MAP.send.key:
      fetchSampleInfoSendTaskPage()
    default:
      break
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

  switch (activeName.value) {
    case TABS_MAP.todo.key:
      fetchSampleInfoTodoTaskPage()
      break
    case TABS_MAP.done.key:
      fetchSampleInfoDoneTaskPage()
      break
    case TABS_MAP.send.key:
      fetchSampleInfoSendTaskPage()
    default:
      break
  }
}

const fetchSampleInfoTodoTaskPage = async () => {
  const data = await TaskApi.getSampleInfoTodoTaskPage({
    ...queryParams,
    ...props.dashboardConfig?.query
  })
  // mock
  // sampleInfoTodoTaskList.value = mockMoreData(data.list?.[0], 30)
  sampleInfoTodoTaskList.value = data.list
}
const fetchSampleInfoDoneTaskPage = async () => {
  const data = await TaskApi.getSampleInfoDoneTaskPage({
    ...queryParams,
    ...props.dashboardConfig?.query
  })
  sampleInfoDoneTaskList.value = data.list
}
const fetchSampleInfoSendTaskPage = async () => {
  const data = await TaskApi.getSampleInfoSendTaskPage({
    ...queryParams,
    ...props.dashboardConfig?.query
  })
  sampleInfoSendTaskList.value = data.list
}

const handleLinkToList = () => {
  const target = props.dashboardConfig?.task?.[activeName.value]
  target &&
    router.push({
      name: target.linkToCpName,
      query: {
        flwTag: props.dashboardConfig.flwTag
      }
    })
}

const handleMethod = (methodObj, row, type) => {
if (type === 'todo' && row.businessStatusDesc === '试验中') {
    router.push({
      name: 'ledgerManage',
      query: {
        examineProjectId: row.examineProjectId,
        processInstanceId: row.processInstanceId,
        businessKey: row.businessKey
      }
    })
  }else if (methodObj?.name === 'handleToDetail') {
    handleToDetail(methodObj, row, type)
  }
}

const handleToDetail = (methodObj, row, type) => {
  const query = { sampleId: row.id, id: row.procInstId || row.processInstanceId }

  if (type === TABS_MAP.send.key) {
    query.id = row.processInstanceId
  }

  if (methodObj?.detailModalRefName) {
    switch (methodObj?.detailModalRefName) {
      case 'jcDetailRef':
        jcDetailRef.value?.open(query.id)
        break
      case 'wtDetailRef':
        wtDetailRef.value?.open(query.id)
        break
      case 'clDetailRef':
        clDetailRef.value?.open(query.id)
        break
      default:
        break
    }
  }
  // methodObj?.CpName &&
  //   router.push({
  //     name: methodObj?.CpName,
  //     query
  //   })
}

const fetchTasksPage = () => {
  queryParams.orderAsc = undefined
  queryParams.orderColumn = undefined
  todoTableRef.value?.clearSort()
  doneTableRef.value?.clearSort()
  sendTableRef.value?.clearSort()
  fetchSampleInfoTodoTaskPage()
  fetchSampleInfoDoneTaskPage()
  fetchSampleInfoSendTaskPage()
}

const handleAddEvent = () => {
  fetchTasksPage()
}

const { emitter } = useEmitt({ name: 'task:refresh', callback: handleAddEvent })
const handleSuccess = () => {
  emitter.emit('task:refresh')
}

onMounted(() => {
  fetchTasksPage()
})
</script>

<style lang="scss" scoped>
.center-left {
  display: flex;
  flex-direction: column;
  //justify-content: space-between;
  width: 75%;
  height: 414px;
  padding: 0 18px 12px 36px;
  margin-right: 20px;
  background-color: #fff;
  border-radius: 4px;
  position: relative;

  .title {
    position: absolute;
    top: 10px;
    left: 10px;
    font-family: 'HarmonyOS Sans SC';
    font-size: 16px;
    color: rgb(30, 41, 69);
    font-weight: 700;
    height: 32px;
    line-height: 32px;
    background: url('../../assets/imgs/myUpdate/titleReg.svg') no-repeat 0% center;
    padding-left: 10px;
    line-height: 32px;
  }

  .list {
    height: 280px;
    overflow: scroll;
    overflow: auto; /* 开启滚动 */ /* 对于现代浏览器，去掉滚动条 */

    /* 兼容IE和Edge */
    -ms-overflow-style: none; /* IE 10+ */

    /* 兼容Firefox */
    scrollbar-width: none; /* Firefox 64 */
  }

  .more {
    // font-family: 'HarmonyOS Sans SC';
    // font-size: 14px;
    // font-weight: normal;
    // color: rgb(37 89 236 / 100%);
    // text-align: center;
    width: 40px;
    height: 40px;
    background: url(../../assets/imgs/myUpdate/more.svg) no-repeat center center;
    margin-left: 20px;

    > span {
      cursor: pointer;
    }
  }
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  color: #999;
}
::v-deep .el-radio-group{
  justify-content: end;
  margin-top: 10px;
} 
::v-deep .el-radio-button{
  --el-radio-button-checked-bg-color: rgb(48, 84, 74);
}
::v-deep .el-radio-button:hover .el-radio-button__inner{
  color: rgb(48, 84, 74);
}
::v-deep .el-tabs {
  margin-top: 0px;
  --el-tabs-header-height: 0px;

}

::v-deep .el-tabs__active-bar {
  background: #2559ec;
}

::v-deep .el-button.is-link {
  color: #2559ec;
}
</style>
