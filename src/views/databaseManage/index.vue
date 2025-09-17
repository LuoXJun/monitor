<template>
  <!-- 表单 -->
<ContentWrap  class="document-list-search">
      <el-form
      
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
      
    >
      <el-form-item label="表名称：" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="请输入"
          clearable
          @keydown.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item class="ml-auto">
        <el-button color="rgb(63, 98, 151)" dark @click="handleQuery">
          <Icon icon="ep:search" />搜索
        </el-button>
        <el-button @click="resetQuery" color ="rgb(229, 231, 235)"> <Icon icon="ep:refresh" />重置 </el-button>
        
        <!-- <el-button type="primary" plain @click="batchDelete">
          <Icon icon="ep:delete" /> 批量删除
        </el-button> -->
      </el-form-item>
    </el-form>
    </ContentWrap>
  <!-- 搜索 -->
  <div class="bg-white p-20px">
     <div class="flex items-center justify-between mb-14px w-full">
          <p class="title">数据配置
           
          </p>
           <el-button
v-hasPermi="['sql:db:create']"  plain @click="openForm(OPERATE_TYPE_MAP.create.key)"
               class="!bg-gray-200  ![color:rgb(45,77,126)] hover:!bg-gray-100 hover:![color:rgb(45,77,126)] hover:!border-none">
          <Icon icon="ep:plus" /> 新增
        </el-button>
           
        </div>
    
    <el-table
    :row-class-name="removeStripe"
      @selection-change="handleSelectionChange"
      v-loading="loading"
      :data="list"
      ref='tableRef' 
       @sort-change="handleSortChange"
      :height="tableHeight"
      :header-cell-class-name="setHeaderStyle"
  
      
    >
      <!-- <el-table-column type="selection" /> -->
      <!-- <el-table-column /> -->
      <el-table-column label="序号" align="center" type="index" width="80" />

      <el-table-column label="表名称"  sortable="custom" align="center" prop="tableName" show-overflow-tooltip />
      <el-table-column label="表注释"  sortable="custom" align="center" prop="tableDesc" show-overflow-tooltip />
      <!-- <el-table-column
        label="创建时间"
        align="center"
        :formatter="dateFormatter"
        prop="createTime"
      /> -->

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <el-button
              style="color:rgb(0, 82, 217)"
              size="small"
              plain
              v-hasPermi="['sql:db:edit']"
              @click="openForm(OPERATE_TYPE_MAP.edit.key, scope.row.tableName)"
              class="no-border-btn"
            >
              编辑
            </el-button>
            <el-button
              style="color:rgb(0, 82, 217)"
              size="small"
              plain
              v-hasPermi="['sql:db:view']"
              @click="openForm(OPERATE_TYPE_MAP.view.key, scope.row.tableName)"
              class="no-border-btn"
            >
              查看
            </el-button>
            <el-button
              size="small"
              plain
              style="color: rgb(213, 73, 65);"
              v-hasPermi="['sql:db:delete']"
              @click="handleDelete(scope.row.tableName)"
              :disabled="scope.row.tableType === 1"
              class="no-border-btn"
            >
              删除
            </el-button>
          </div>
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
      <!-- <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    /> -->
    
  </div>

  <addEdit ref="formRef" @success="getList" />
  <filePreview ref="fileRef" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import * as PostApi from '@/api/system/post'
import { OPERATE_TYPE_MAP } from '@/constants/databaseManage'

import filePreview from '@/components/FilePreview/index.vue'
import addEdit from './addEditForm.vue'
import * as SqlApi from '@/api/sql'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import {camelToUnderscore} from '@/utils/commonMethods'
const { tableHeight } = useTableHeight()
const setHeaderStyle = () => {
  return 'custom-header'
}
const fileRef = ref(null)
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
let childList = ref([])
const tableRef=ref(null)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  tableName: undefined
})

const selectIds = ref([])
const queryFormRef = ref() // 搜索的表单
const lookVideoRef = ref()

const showExcel = (link) => {
  fileRef.value.open(link)
}
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SqlApi.getDbPage(queryParams)
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
  queryParams.orderColumn=camelToUnderscore(row.prop)
  if (row.order === 'ascending') {
    queryParams.orderAsc = true
  } else if (row.order === 'descending') {
    queryParams.orderAsc = false
  } else{
    queryParams.orderAsc = undefined
    queryParams.orderColumn=undefined
  }
  await getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.orderColumn=undefined
  queryParams.orderAsc=undefined
  tableRef.value?.clearSort()
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 处理部门被点击 */
const handleDeptNodeClick = async (row) => {
  console.log(row)
  childList.value = row.children
  queryParams.areaCode = row.code
  await getList()
}

/** 添加/修改操作 */
const formRef = ref(null)
const openForm = (type, tableName) => {
  // if (type === 'create') {
  //   if (childList.value != null) {
  //     message.error('只能在节点子项新增！')
  //     return
  //   }
  // }
  formRef.value.open(type, tableName)
}
const handleDelete = async (tableName) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await SqlApi.deleteDb(tableName)
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

/** 初始化 */
onMounted(async () => {
  getList()
})
</script>

<style lang="scss" scoped>
@import '@/styles/tableCommon.scss';
.btm-btn {
  margin-top: 16px;
  text-align: center;
}

.full-height {
  min-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) - var(
        --app-footer-height
      ) - 90px
  );
}

</style>
