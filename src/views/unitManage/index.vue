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
        <el-form-item label="单位名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入" clearable class="!w-240px" />
        </el-form-item>

        <el-form-item>
          <el-button color="#2559ec" dark @click="handleQuery">
            <Icon icon="ep:search" />搜索
          </el-button>
          <el-button @click="resetQuery"> <Icon icon="ep:refresh" />重置 </el-button>
          <el-button type="primary" @click="openForm('create')">
            <Icon icon="ep:plus" /> 新建
          </el-button>
          <!-- <el-button type="primary"
                     plain
                     @click="batchDelete">
            <Icon icon="ep:delete" /> 批量删除
          </el-button> -->
        </el-form-item>
      </el-form>
    </ContentWrap>
    <ContentWrap>
      <el-table v-loading="loading" @selection-change="handleSelectionChange" :data="list">
        <!-- <el-table-column type="selection" /> -->
        <el-table-column label="序号" align="center" type="index" width="80" />
        <el-table-column label="单位名称" align="center" prop="name" />
        <el-table-column
          label="创建时间"
          align="center"
          :formatter="dateFormatter"
          prop="createTime"
        />
        <el-table-column label="操作" align="center" width="250" prop="createTime">
          <template #default="scope">
            <el-button plain size="small" type="primary" @click="openForm('edit', scope.row.id)">
              编辑
            </el-button>
            <el-button plain size="small" type="danger" @click="handleDelete(scope.row.id)">
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
  <editForm ref="formRef" @success="getList" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as PostApi from '@/api/system/post'
import * as UnitApi from '@/api/unit'
import editForm from './addEditForm.vue'
const colorList = ref(['#67C23A', '#F56C6C', '#F56C6C', '#67C23A'])
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const selectIds = ref([])
const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined
})

const queryFormRef = ref() // 搜索的表单
const formRef = ref()

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UnitApi.getUnitPage(queryParams)
    console.log(data)
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
    await UnitApi.deleteUnit(id)
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
