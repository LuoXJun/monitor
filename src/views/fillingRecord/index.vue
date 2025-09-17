<template>
  <div style="margin-top: 15px">
    <!-- <ContentWrap>
      <el-form
        class="-mb-15px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="填报人" prop="siloName">
          <el-input
            v-model="queryParams.siloName"
            placeholder="请选择"
            clearable
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"> <Icon icon="ep:search" />搜索 </el-button>
          <el-button @click="resetQuery"> <Icon icon="ep:refresh" />重置 </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap> -->
    <ContentWrap>
      <div class="flex items-center justify-between mb-14px w-full">
        <p class="title">填报记录 </p>
      </div>
      <el-table
        v-loading="loading"
        @selection-change="handleSelectionChange"
        :data="list"
        :header-cell-class-name="setHeaderStyle"
      >
        <!-- <el-table-column type="selection" /> -->
        <el-table-column label="序号" align="center" type="index" width="80" />
        <!-- <el-table-column label="工程名称" align="center" prop="name" />
        <el-table-column label="样品类型" align="center" prop="siloName" />
        <el-table-column label="样品名称" align="center" prop="siloLocation" />
        <el-table-column label="检验项" align="center" prop="siloReserves" /> -->
        <el-table-column label="填报人" align="center" prop="creatorName" />
        <el-table-column
          label="填报日期"
          :formatter="dateFormatter"
          align="center"
          prop="createTime"
        />
        <el-table-column label="操作" align="center" width="250" prop="createTime">
          <template #default="scope">
            <el-button size="small" plain type="primary" link @click="openForm(scope.row.id)">
              查看
            </el-button>
            <el-button
              size="small"
              plain
              type="primary"
              link
              color="#f00"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
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
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as PostApi from '@/api/system/post'
import * as SampleApi from '@/api/sample'

const props = defineProps({
  sampleId: {
    type: Number,
    default() {
      return ''
    }
  }
})

const setHeaderStyle = () => {
  return 'custom-header'
}

const router = useRouter()
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const selectIds = ref([])
const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  sampleId: props.sampleId,
  siloStatus: undefined
})

const queryFormRef = ref() // 搜索的表单
const formRef = ref()

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SampleApi.getFillHistoryPage(queryParams)
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
const openForm = (id) => {
  router.push({
    name: 'InspectionDesignPreviewForHistory',
    query: {
      fillRecordId: id
    }
  })
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
/** 初始化 */
onMounted(() => {
  getList()
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
