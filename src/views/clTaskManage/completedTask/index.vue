<template>
  <div style="margin-top: 15px">
    <ContentWrap>
      <el-form
        class="-mb-15px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="工程名称" prop="projectId">
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
        <!-- <el-form-item label="样品编号" prop="sampleCode">
          <el-input
            v-model="queryParams.sampleCode"
            placeholder="请输入"
            clearable
            class="!w-240px"
          />
        </el-form-item> -->
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

        <el-form-item>
          <el-button @click="handleQuery"> <Icon icon="ep:search" />搜索 </el-button>
          <el-button @click="resetQuery"> <Icon icon="ep:refresh" />重置 </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>
    <ContentWrap>
      <el-table
        v-loading="loading"
        @selection-change="handleSelectionChange"
        :data="list"
        border
        stripe
      >
        <el-table-column label="序号" align="center" type="index" width="80" />
        <!-- <el-table-column label="样品名称" align="center" prop="sampleName" width="160" /> -->
        <!-- <el-table-column
          label="样品编号"
          align="center"
          prop="sampleCode"
          width="120"
          :show-overflow-tooltip="true"
        /> -->
        <!-- <el-table-column label="材料类型" align="center" prop="materialName" width="120" /> -->
        <!-- <el-table-column label="物探指标" align="center" prop="examineProjectName" width="140" /> -->
        <el-table-column label="任务名称" align="center" prop="taskName" show-overflow-tooltip />
        <el-table-column
          label="任务编号"
          align="center"
          prop="taskId"
          width="180"
          show-overflow-tooltip
        />
        <!-- <el-table-column label="任务类型" align="center" prop="taskTypeDesc" width="100" /> -->
        <el-table-column
          label="工程名称"
          align="center"
          prop="projectName"
          width="140"
          show-overflow-tooltip
        />
        <!-- <el-table-column
          label="委托单位"
          align="center"
          prop="delegateUnitName"
          width="140"
          :show-overflow-tooltip="true"
        /> -->
        <el-table-column label="任务状态" align="center" prop="taskStatus" width="120">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.taskStatus == 4"
              effect="dark"
              placement="top"
              :content="scope.row.cancelReason"
            >
              <el-tag :type="getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type">
                {{ getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label }}
              </el-tag>
            </el-tooltip>
            <el-tag
              v-else
              :type="getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.type"
            >
              {{ getWtTaskStatus(scope.row.taskDefKey, scope.row.taskStatus)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="任务开始时间" prop="taskStartTime" width="180">
          <template #default="scope">
            <el-tag type="primary">{{ formatDate(scope.row.taskStartTime) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="任务结束时间" prop="taskEndTime" width="180">
          <template #default="scope">
            <el-tag type="primary">{{ formatDate(scope.row.taskEndTime) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="耗时" prop="taskDuration" width="160">
          <template #default="scope">
            {{ formatPast2(scope.row.taskDuration) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="120" prop="createTime">
          <template #default="scope">
            <el-button
              plain
              size="small"
              type="primary"  
              @click="handleDetail(scope.row)"> 查看 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </ContentWrap>
  </div>
  <!-- <submitForm ref="formRef" @success="getList" /> -->
  <Detail ref="detailRef" @success="getList" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import * as PostApi from '@/api/system/post'
import * as TaskApi from '@/api/task'
import { formatDate, formatPast2 } from '@/utils/formatTime'
import * as InspectionItemApi from '@/api/inspectionItem'
// import editForm from './addEditForm.vue'
// import submitForm from './submitForm.vue';
import { TASK_STATUS_MAP } from '@/constants/sampleTask'
import { getWtTaskStatus } from '@/utils/sampleTask'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import * as ItemApi from '@/api/itemManage'
import Detail from '../detail/index.vue'

const defaultProps2 = {
  children: 'children',
  label: 'projectName'
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
  businessType: DEPARTMENT_BUSINESS_MAP.cl.key,
  pageNo: 1,
  pageSize: 10,
  examineProjectId: undefined,
  sampleCode: undefined
})
const itemList = ref([])
const projectList = ref([])

const queryFormRef = ref() // 搜索的表单
const formRef = ref()

const getProjectTree = async () => {
  const data = await ItemApi.getItemList()
  projectList.value = data
}

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

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
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

const detailRef = ref()

const handleDetail = (row) => {
  // router.push({
  //   name: 'ClTaskDetail',
  //   query: {
  //     id: row.procInstId,
  //     sampleId: row.id
  //   }
  // })
  detailRef.value?.open(row.procInstId)
}

const fetchItemList = async (data) => {
  const res = await InspectionItemApi.getExamineProjectWtList({ materialType: data })
  itemList.value = res
}

/** 初始化 */
onMounted(() => {
  getList()
  fetchItemList()
  getProjectTree()
})
</script>
<style scoped>
.red {
  color: red;
}

.green {
  color: green;
}
</style>
