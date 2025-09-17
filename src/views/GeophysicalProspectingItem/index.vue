<template>
  <el-row :gutter="20">
    <!-- 左侧部门树 -->
    <el-col :span="4" :xs="24">
      <ContentWrap class="!mb-0 !h-full demo_tree" bodyStyle="0">
        <div class="pro_title">
           <img src="@/assets/imgs/myUpdate/path.svg"/>
           物探类型管理</div>
        <materialsTree ref="leftTreeRef" @node-click="handleDeptNodeClick" />
      </ContentWrap>
    </el-col>
    <el-col :span="20" :xs="24">
      <ContentWrap  class="document-list-search">
         <el-form
          class="mb-10px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="物探指标" prop="examineName">
            <el-input
              v-model="queryParams.examineName"
              placeholder="请输入"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <!-- <el-form-item label="版本号" prop="version">
            <el-input
              v-model="queryParams.version"
              placeholder="请输入"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item> -->
          <el-form-item class="ml-auto">
            <el-button color="rgb(63, 98, 151)" dark @click="handleQuery">
              <Icon icon="ep:search" />搜索
            </el-button>
            <el-button @click="resetQuery" color ="rgb(229, 231, 235)"> <Icon icon="ep:refresh" />重置 </el-button>
           
          </el-form-item>
        </el-form>
      </ContentWrap>
      <!-- 搜索 -->
      <div class="bg-white p-20px">
        <div class="flex items-center justify-between mb-14px w-full">
          <p class="title">物探项目
          </p>
          <el-button
              v-hasPermi="['wt:examine:create']"
              plain
              @click="openForm('create')"
              class="!bg-gray-200  ![color:rgb(45,77,126)] hover:!bg-gray-100 hover:![color:rgb(45,77,126)] hover:!border-none"
            >
              <Icon icon="ep:plus" /> 新增物探指标
            </el-button>
          </div>
        <el-table
          v-loading="loading"
          :data="list"
          ref="tableRef"
          @sort-change="handleSortChange"
          :height="tableHeight"
          :header-cell-class-name="setHeaderStyle"
        >
          <el-table-column label="序号" type="index" width="60px" align="center" />
          <el-table-column
            label="物探类型"
            sortable="custom"
            align="center"
            key="id"
            prop="materialName"
          />

          <el-table-column
            label="物探指标"
            sortable="custom"
            align="center"
            key="id"
            prop="examineName"
          />
          <!-- <el-table-column label="物探指标" align="center" key="id" prop="measure" /> -->
          <el-table-column
            label="创建部门"
            sortable="custom"
            align="center"
            key="id"
            prop="deptName"
          />
          <el-table-column
            label="创建人"
            sortable="custom"
            align="center"
            key="id"
            prop="creator"
          />
          <el-table-column label="创建日期" sortable="custom" align="center" prop="createTime">
            <template #default="scope">
              <el-tag type="info">{{ formatDate(scope.row.createTime, 'YYYY-MM-DD') }}</el-tag>
            </template>
          </el-table-column>
          <!-- <el-table-column label="版本号" align="center" prop="version" /> -->
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <div class="flex items-center justify-center">
                <!-- <el-button type="primary" link @click="handleTogglePublishHistory(scope.row)">
                  发布历史
                </el-button>
                <el-button type="primary" link @click="handleDesign(scope.row, 'preview')">
                  预览
                </el-button>
                <el-button type="primary" link @click="handleDesign(scope.row, 'design')">
                  设计
                </el-button> -->
                <!-- <el-button type="primary" link @click="openForm('initiate', scope.row.id)">
                  任务发起
                </el-button> -->
                <el-button
                  style="color:rgb(0, 82, 217)" 
                  plain
                  size="small"
                  v-hasPermi="['wt:examine:edit']"
                  @click="openForm('update', scope.row.id)"
                   class="no-border-btn"
                >
                  编辑
                </el-button>
                <!-- <el-button type="primary" link @click="handlePublish(scope.row)"> 发布 </el-button> -->

                <el-button
                 style="color: rgb(213, 73, 65);"
                  v-hasPermi="['wt:examine:delete']"
                  plain
                  size="small"
                  @click="handleDelete(scope.row.id)"
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
          v-model:page="queryParams.pageNo"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
         </div>
      </div>
    </el-col>
  </el-row>
  <addEdit ref="formRef" @success="handleAddEditSuccess" />
  <filePreview ref="fileRef" />
  <PublishHistoryModal ref="publishHistoryModalRef" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import * as InspectionItemApi from '@/api/inspectionItem'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import * as PostApi from '@/api/system/post'
import materialsTree from './materialsTree.vue'
import filePreview from '@/components/FilePreview/index.vue'
import PublishHistoryModal from './publishHistoryModal.vue'
import addEdit from './addEditForm.vue'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { camelToUnderscore } from '@/utils/commonMethods'
const { tableHeight } = useTableHeight({
  extraHeight: -10
})
const setHeaderStyle = () => {
  return 'custom-header'
}
const { push } = useRouter()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const leftTreeRef = ref()

const publishHistoryModalRef = ref(null)
const fileRef = ref(null)
const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
let childList = ref([])
const tableRef = ref(null)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  examineName: undefined,
  materialType: '',
  version: undefined
})
const queryFormRef = ref() // 搜索的表单
const lookVideoRef = ref()

const showExcel = (link) => {
  fileRef.value.open(link)
}
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await InspectionItemApi.getExamineProjectWtPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleAddEditSuccess = async () => {
  handleRefreshLeftTree()
  getList()
}

const handleRefreshLeftTree = async () => {
  leftTreeRef.value?.refresh?.()
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
const lastClickedNode = ref(null) // 上次点击的节点
/** 处理部门被点击 */
const handleDeptNodeClick = async (row) => {
  console.log(row)
  if (lastClickedNode.value === row.id) {
    queryParams.materialType = '' // 如果一致，重置 materialType
    lastClickedNode.value = '' // 更新上次点击的节点
  } else {
    queryParams.materialType = row.id // 否则，更新为当前节点的 id
    lastClickedNode.value = row.id // 更新上次点击的节点
  }

  await getList()
}

/** 添加/修改操作 */
const formRef = ref(null)
const openForm = (type, id) => {
  // if (type === 'create') {
  //   if (childList.value != null) {
  //     message.error('只能在节点子项新增！')
  //     return
  //   }
  // }
  formRef.value.open(type, id, queryParams.materialType)
}
const handleDelete = async (id) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await InspectionItemApi.deleteExamineProject(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

const openVideo = (row) => {
  lookVideoRef.value.open()
}

const handleTogglePublishHistory = (row) => {
  publishHistoryModalRef.value.open(row?.id)
}

/** 设计流程 */
const handleDesign = (row, type) => {
  push({
    name: type === 'design' ? 'InspectionDesignEditor' : 'InspectionDesignEditorPreview',
    query: {
      examineProjectId: row.id
    }
  })
}

const handlePublish = async (row) => {
  const { formInfo, id } = row
  const payload = {
    examineProjectId: id,
    formInfo
  }

  await InspectionItemApi.publishExamineProjectForm(payload)

  message.success(t('common.publishSuccess'))

  await getList()
}

/** 初始化 */
onMounted(async () => {
  getList()
})
</script>
<style lang="scss" scoped>
@import '@/styles/tableCommon.scss';
.full-height {
  min-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) - var(
        --app-footer-height
      )
  );
}

.full-height-1 {
  min-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-content-padding) - var(
        --app-footer-height
      ) - 90px
  );
}
</style>
