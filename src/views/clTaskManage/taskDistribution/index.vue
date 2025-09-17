<template>
  <!-- <div style="margin-top: 15px"> -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <!-- <el-form-item label="任务类型" prop="siloStatus">
        <el-select v-model="queryParams.siloStatus" placeholder="请选择" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item> -->
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
      <!-- <el-form-item label="物探指标" prop="siloStatus">
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
      </el-form-item> -->
      <!-- <el-form-item label="样品名称" prop="sampleName">
        <el-input
          v-model="queryParams.sampleName"
          placeholder="请输入"
          clearable
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="试验人" prop="examiner">
        <el-select v-model="queryParams.examiner" placeholder="请选择" clearable class="!w-240px">
          <el-option
            v-for="dict in userOptions"
            :key="dict.id"
            :label="dict.nickname"
            :value="dict.id"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button @click="handleQuery"> <Icon icon="ep:search" />搜索 </el-button>
        <el-button @click="resetQuery"> <Icon icon="ep:refresh" />重置 </el-button>
        <el-button type="primary" @click="openForm('create')"> 任务发起 </el-button>
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
      <!-- <el-table-column type="selection" /> -->
      <el-table-column label="序号" align="center" type="index" width="80" />
      <!-- <el-table-column label="样品名称" align="center" prop="sampleName" width="160" /> -->
      <!-- <el-table-column label="样品编号" align="center" prop="sampleCode" width="120" /> -->
      <!-- <el-table-column label="材料类型" align="center" prop="materialName" /> -->
      <!-- <el-table-column label="物探指标" align="center" prop="examineProjectName" width="120" /> -->
      <!-- <el-table-column label="试验人" align="center" prop="examinerName" width="120" /> -->
      <el-table-column
        label="工程名称"
        align="center"
        prop="projectName"
        width="160"
        show-overflow-tooltip
      />
      <!-- <el-table-column
        label="委托单位"
        align="center"
        prop="delegateUnitName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="受检单位"
        align="center"
        prop="examineUnitName"
        :show-overflow-tooltip="true"
      /> -->
      <el-table-column
        label="流程编号"
        align="center"
        prop="processInstanceId"
        show-overflow-tooltip
      />
      <!-- <el-table-column label="任务类型" align="center" prop="taskTypeDesc" width="100" /> -->
      <!-- <el-table-column label="业务状态" align="center" prop="processStatus" width="120">
        <template #default="scope">
          <el-tooltip
            v-if="scope.row.processStatus == 4"
            effect="dark"
            placement="top"
            :content="scope.row.cancelReason"
          >
            <el-tag :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.processStatus]?.type">
              {{ EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.processStatus]?.label }}
            </el-tag>
          </el-tooltip>
          <el-tag
            v-else
            :type="EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.processStatus]?.type"
          >
            {{ EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP[scope.row.processStatus]?.label }}
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column label="任务状态" align="center" prop="businessStatus" width="120">
        <template #default="scope">
          <el-tag :type="getWtTaskStatus(scope.row.taskDefKey, scope.row.businessStatus)?.type">
            {{ getWtTaskStatus(scope.row.taskDefKey, scope.row.businessStatus)?.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="任务发起人"
        align="center"
        prop="startUserName"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column align="center" label="发起时间" prop="startTime" width="180">
        <template #default="scope">
          <el-tag type="primary">{{ formatDate(scope.row.startTime) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="120" prop="createTime">
        <template #default="scope">
          <el-button 
            plain
            size="small"
            type="primary" 
            @click="handleDetail(scope.row)"> 详情 </el-button>
          <el-button
            plain
            size="small"
            type="primary" 
            v-if="scope.row.processStatus == 0 || scope.row.processStatus == 1"
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
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
  <!-- </div> -->
  <taskInitiateForm ref="formRef" @success="getList" />
  <!-- <editForm ref="formRef" @success="getList" /> -->
  <Detail ref="detailRef" @success="getList" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { formatDate, formatPast2 } from '@/utils/formatTime'
import * as PostApi from '@/api/system/post'
import * as TaskApi from '@/api/task'
import * as UserApi from '@/api/system/user'
import { EXCEL_FILL_PROCESS_INSTANCE_STATUS_MAP } from '@/constants/sampleTask'
import * as InspectionItemApi from '@/api/inspectionItem'
import editForm from './addEditForm.vue'
import taskInitiateForm from './taskInitiateForm.vue'
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
  projectId: undefined
  // sampleName: undefined,
  // examineProjectId: undefined,
  // examiner: undefined
})
const itemList = ref([])
const userOptions = ref([])
const projectList = ref([])

const queryFormRef = ref() // 搜索的表单
const formRef = ref()

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

const getProjectTree = async () => {
  const data = await ItemApi.getItemList()
  projectList.value = data
}

const detailRef = ref()

/** 查看详情 */
const handleDetail = (row) => {
  // router.push({
  //   name: 'ClTaskDetail',
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

const fetchItemList = async (data) => {
  const res = await InspectionItemApi.getExamineProjectWtList({ materialType: data })
  itemList.value = res
}

/** 初始化 */
onMounted(async () => {
  getList()
  fetchItemList()
  getProjectTree()
  userOptions.value = await UserApi.getSimpleUserList()
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
