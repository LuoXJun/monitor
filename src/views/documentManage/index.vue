<template>
  <el-row :gutter="10">
    <!-- 左侧部门树 -->
    <el-col :span="4" :xs="24">

      <ContentWrap class="!mb-0 !h-full demo_tree" bodyStyle="0">
        <div class="pro_title">
          <img src="@/assets/imgs/myUpdate/path.svg"/>
          项目工程树</div>
        <projectTree ref="leftTreeRef" @node-click="handleDeptNodeClick" />
      </ContentWrap>
    </el-col>
    <el-col :span="20" :xs="24">
      <!-- 搜索 -->
        <ContentWrap  class="document-list-search">
          <el-form
          class="mb-0px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="80px"
        >
          <el-form-item label="文件名称:" prop="fileOriginName">
            <el-input
              v-model="queryParams.fileOriginName"
              placeholder="请输入"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px !h-30px"
            />
          </el-form-item>
          <el-form-item
            label="检测指标:"
            prop="examineProjectId"
            v-if="businessType !== DEPARTMENT_BUSINESS_MAP.cl.key"
          >
            <el-select
              v-model="queryParams.examineProjectId"
              placeholder="请选择"
              class="!w-240px !h-30px"
              clearable
            >
              <el-option
                v-for="dict in itemList"
                :key="dict.id"
                :label="dict.examineName"
                :value="dict.id"
              />
            </el-select>
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
        <div class="flex items-center justify-between mb-14px w-full">
          <p class="title">文件管理
          </p>
           <el-button
              text-align="right"
              v-hasPermi="['document:project:create']"
              plain
              @click="openForm('create')"
              class="!bg-gray-200  ![color:rgb(45,77,126)] hover:!bg-gray-100 hover:![color:rgb(45,77,126)] hover:!border-none"
              
            >
              <Icon icon="ep:plus" /> 新建
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
          <el-table-column label="序号" width="80px" type="index" align="center" />
          <el-table-column
            label="部门名称"
            sortable
            align="center"
            prop="deptName"
            show-overflow-tooltip
          />
          <el-table-column
            label="项目工程"
            align="center"
            sortable="custom"
            prop="projectName"
            show-overflow-tooltip
          />
          <el-table-column
            label="文件名称"
            sortable="custom"
            align="center"
            key="id"
            prop="fileOriginName"
            show-overflow-tooltip
          >
            <template #default="scope">
              <span @click="showExcel(scope.row.fileUrl)" style="color: rgb(0, 82, 217); cursor: pointer">
                {{ scope.row.fileOriginName }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
            v-if="businessType !== DEPARTMENT_BUSINESS_MAP.cl.key"
            label="检测指标"
            align="center"
            sortable="custom"
            prop="examineProjectName"
            show-overflow-tooltip
          />
          <el-table-column
            label="文件创建时间"
            align="center"
            sortable="custom"
            prop="createTime"
            width="170"
          >
            <template #default="scope">
              <el-tag type="info">{{ formatDate(scope.row.createTime) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="文件创建人"
            align="center"
            sortable="custom"
            prop="creatorName"
            show-overflow-tooltip
          />
          <el-table-column fixed="right" label="操作" align="center" width="160">
            <template #default="scope">
              <div class="flex items-center justify-center">
                <el-button style="color:rgb(0, 82, 217)"  class="no-border-btn"  size="small" plain @click="copy(scope.row.fileUrl)">
                  复制链接
                </el-button>
                <el-button
                  class="no-border-btn" 
                  v-hasPermi="['document:project:delete']"
                  type="danger"
                  size="small"
                  plain
                  @click="handleDelete(scope.row.id)"
                  style="color: rgb(213, 73, 65);"
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
    </el-col>
  </el-row>
  <addEdit ref="formRef" @success="handleAddEditSuccess" />
  <filePreview ref="fileRef" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import * as PostApi from '@/api/system/post'
import * as DocumentApi from '@/api/document'
import projectTree from './projectTree.vue'
import filePreview from '@/components/FilePreview/index.vue'
import addEdit from './addForm.vue'
import * as InspectionItemApi from '@/api/inspectionItem'
import { copyText } from '@/utils/common'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'
import { useWorkbench } from '@/hooks/web/useWorkbench'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { camelToUnderscore } from '@/utils/commonMethods'

const { tableHeight } = useTableHeight({
  extraHeight: -10
})
const setHeaderStyle = () => {
  return 'custom-header'
}
const { isAdmin, dashboardConfig } = useWorkbench()
const tableRef = ref(null)
const fileRef = ref(null)
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
let childList = ref([])
const leftTreeRef = ref() // 左侧树形控件的引用

const itemList = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  fileOriginName: undefined,
  examineProjectId: '',
  projectId: undefined
})
const queryFormRef = ref() // 搜索的表单
const lookVideoRef = ref()
const businessType = ref(dashboardConfig.data.flwTag)

const showExcel = (link) => {
  console.log(link)

  fileRef.value.open(link)
}
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await DocumentApi.getProjectFilePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
const getItemList = async (data) => {
  const payload = { materialType: data }

  if (!isAdmin) {
    if (businessType.value === DEPARTMENT_BUSINESS_MAP.jc.key) {
      payload.businessType = 1
    } else if (businessType.value === DEPARTMENT_BUSINESS_MAP.wt.key) {
      payload.businessType = 2
    }
  }

  const res = await InspectionItemApi.getExamineProjectSimpleList(payload)

  itemList.value = res
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

const handleAddEditSuccess = async () => {
  handleRefreshLeftTree()
  getList()
}

const handleRefreshLeftTree = async () => {
  leftTreeRef.value?.refresh?.()
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
    queryParams.projectId = '' // 如果一致，重置 projectId
    lastClickedNode.value = '' // 更新上次点击的节点
  } else {
    queryParams.projectId = row.id // 否则，更新为当前节点的 id
    lastClickedNode.value = row.id // 更新上次点击的节点
  }

  await getList()
}

const copy = (url) => {
  // navigator.clipboard.writeText(url)
  copyText(url)
  message.success('复制成功！')
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
  formRef.value.open(type, queryParams.projectId, id)
}
const handleDelete = async (id) => {
  try {
    // 删除的二次确认
    await message.delConfirm('是否确认删除所选中的数据','删除提示')
    // 发起删除
    await DocumentApi.deleteProjectFile(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

const openVideo = (row) => {
  lookVideoRef.value.open()
}

/** 初始化 */
onMounted(async () => {
  getList()
  getItemList()
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
      ) - 93px
  );
}

</style>

