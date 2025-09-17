<template>
  <ContentWrap  class="document-list-search">
 <el-form
        class="mb-10px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="工程名称" prop="projectName">
          <el-input
            v-model="queryParams.projectName"
            placeholder="请输入"
            clearable
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item label="类别名称" prop="projectCategory">
          <el-select
            v-model="queryParams.projectCategory"
            placeholder="请选择"
            clearable
            class="!w-240px"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.PROJECT_CATEGORY)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="ml-auto">
          <el-button color="rgb(63, 98, 151)" dark @click="handleQuery">
            <Icon icon="ep:search" />搜索
          </el-button>
          <el-button @click="resetQuery" color ="rgb(229, 231, 235)"> <Icon icon="ep:refresh" />重置 </el-button>
          
          <el-button v-hasPermi="['project:manage:import']" color="rgb(63, 98, 151)"  plain @click="handleToggleImportModal">
            <Icon icon="ep:upload" /> 导入
          </el-button>
        </el-form-item>
      </el-form>
  </ContentWrap>
  <div class="bg-white p-20px">
       <div class="flex items-center justify-between mb-14px w-full">
          <p class="title">项目设置
          </p>
          <el-button v-hasPermi="['project:manage:add']"  @click="openForm('create')" class="!bg-gray-200  ![color:rgb(45,77,126)] hover:!bg-gray-100 hover:![color:rgb(45,77,126)] hover:!border-none">
            <Icon icon="ep:plus" /> 新建
          </el-button>
           
        </div>
      <el-table
        v-loading="loading"
        row-key="id"
        default-expand-all
              ref='tableRef' 
       @sort-change="handleSortChange"
        :data="list"
        :tree-props="{ children: 'children' }"
        :cell-class-name="setClass"
        :height="tableHeight"
        :header-cell-class-name="setHeaderStyle"
      >
        <!-- <el-table-column label="工程名称"  prop="projectName"  /> -->
        <el-table-column label="工程名称" sortable="custom" align="center" prop="projectName" class="one">
          <template #default="scope">
            <!-- <img src="../../assets/imgs/icon_gcmc.png" v-if="scope.row.level === 1" />
            <img src="../../assets/imgs/icon_dwmc.png" v-if="scope.row.level === 2" />
            <img src="../../assets/imgs/icon_fbmc.png" v-if="scope.row.level === 3" />
            <img src="../../assets/imgs/icon_fxmc.png" v-if="scope.row.level === 4" />
            <img src="../../assets/imgs/icon_dymc.png" v-if="scope.row.level === 5" />
            <img src="../../assets/imgs/icon_gxmc.png" v-if="scope.row.level === 6" /> -->
            <div class="projectName">{{ scope.row.projectName }}</div>
          </template>
        </el-table-column>

        <el-table-column label="类别名称" sortable="custom"  align="center" prop="projectCategory">
          <template #default="scope">
            <div>{{ getDictLabel(DICT_TYPE.PROJECT_CATEGORY, scope.row.projectCategory) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="编码" sortable="custom" align="center" prop="projectCode" />
        <el-table-column label="BIM模型" align="center" sortable="custom" prop="bimModel">
          <template #default="scope">
            <div
              v-if="judgeHasBimModel(scope.row.bimModel)"
              @click="openBim(scope.row)"
              style="display: flex; justify-content: center; align-self: center; cursor: pointer"
            >
              <img
                style="width: 21px; height: 21px; margin-right: 10px"
                src="../../assets/imgs/BIM.png"
                :alt="renderBimModel(scope.row.bimModel)"
                :title="renderBimModel(scope.row.bimModel)"
              />
              <!-- <span style="color: #0256ff" class="bim-name" :title="scope.row.bimModel">
                {{ renderBimModel(scope.row.bimModel) }}
              </span> -->
            </div>
            <div v-else></div>
          </template>
        </el-table-column>
        <el-table-column
          :formatter="dateFormatter2"
          align="center"
          sortable="custom"
          label="创建日期"
          prop="createTime"
        />
        <!-- <el-table-column label="创建日期" align="center" prop="createTime" /> -->
        <el-table-column label="操作" align="center" width="250" prop="createTime">
          <template #default="scope">
            <el-button
              v-if="scope.row.level !== 6"
              size="small"
              plain
              type="success"
              v-hasPermi="['project:manage:create']"
              @click="openForm('initiate', scope.row.id)"
              style="color:rgb(0, 82, 217)"  class="no-border-btn" 
            >
              新增子级
            </el-button>
            <el-button v-hasPermi="['project:manage:edit']" size="small" plain style="color:rgb(0, 82, 217)"  class="no-border-btn"  @click="openForm('edit', scope.row.id)">
              编辑
            </el-button>
            <el-button v-hasPermi="['project:manage:delete']" size="small" plain style="color: rgb(213, 73, 65);" class="no-border-btn" @click="handleDelete(scope.row)">
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
  </div>
  <editForm ref="formRef" @success="getList" />
  <lookBim v-if="isShow" @close="close" ref="bimRef" />
  <!-- 用户导入对话框 -->
  <ProjectImportForm ref="projectImportFormRef" @success="getList" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import * as PostApi from '@/api/system/post'
import * as ItemApi from '@/api/itemManage'
import ProjectImportForm from './ProjectImportForm.vue'
import editForm from './addEditForm.vue'
import lookBim from './lookBim.vue'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import {camelToUnderscore} from '@/utils/commonMethods'
const { tableHeight } = useTableHeight({
  extraHeight: -60
})
const setHeaderStyle = () => {
  return 'custom-header'
}
const colorList = ref(['#67C23A', '#F56C6C', '#F56C6C', '#67C23A'])
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const selectIds = ref([])
const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const bimRef = ref(null)
const tableRef = ref(null)
const queryParams = reactive({
  projectName: undefined,
  projectCategory: undefined,
  projectType: 0
})
const isShow = ref(false)
const queryFormRef = ref() // 搜索的表单
const formRef = ref()
const projectImportFormRef = ref()
const tableData = [
  {
    id: 1,
    date: '2016-05-02',
    name: 'wangxiaohu'
  },
  {
    id: 2,
    date: '2016-05-04',
    name: 'wangxiaohu'
  },
  {
    id: 3,
    date: '2016-05-01',
    name: 'wangxiaohu',
    children: [
      {
        id: 31,
        date: '2016-05-01',
        name: 'wangxiaohu'
      },
      {
        id: 32,
        date: '2016-05-01',
        name: 'wangxiaohu'
      }
    ]
  },
  {
    id: 4,
    date: '2016-05-03',
    name: 'wangxiaohu'
  }
]

const judgeHasBimModel = (bimModelStrObj) => {
  let bimModel = []
  try {
    bimModel = JSON.parse(bimModelStrObj)
  } catch (error) {}

  return !!bimModel?.length
}

const renderBimModel = (bimModelStrObj) => {
  let bimModel = []
  try {
    bimModel = JSON.parse(bimModelStrObj)
  } catch (error) {}

  return bimModel?.[0]?.name || ''
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ItemApi.getItemList(queryParams)
    console.log(data)
    // addIndent(data);
    list.value = data
    console.log(list.value)
    // total.value = data.total
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
const openBim = (row) => {
  let bimModel = []
  try {
    bimModel = JSON.parse(row?.bimModel)
  } catch (error) {}

  window.open(bimModel?.[0].url)
  // isShow.value = true
  // bimRef.value.open()
}

const close = () => {
  isShow.value = false
}

/**编辑 */
const openForm = (type, id) => {
  formRef.value.open(type, id)
}

const handleDelete = async (row) => {
  try {
    if (row.children && row.children.length > 0) {
      message.error('请先删除子节点')
      return
    }
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ItemApi.deleteItem(row.id)
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

const handleToggleImportModal = () => {
  projectImportFormRef.value.open()
}

const handleUploadSuccess = (data) => {
  // importProject
  console.log('🚀 ~ handleUploadSuccess ~ data:', data)
  //
}

const setClass = function ({ row, column, rowIndex, columnIndex }) {
  if (columnIndex === 0) {
    // 给第一列添加类名
    return 'treeHeader'
  }
}

/** 初始化 */
onMounted(() => {
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

.bim-name {
  display: inline-block;
  width: 150px; /* 或者任何您想要的宽度 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 显示省略号 */
  white-space: nowrap; /* 防止文本换行 */
}

::v-deep .treeHeader .cell {
  display: flex;
  align-items: center;
}
</style>
