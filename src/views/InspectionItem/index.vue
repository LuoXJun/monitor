<template>
  <el-row :gutter="10">
    <!-- 左侧部门树 -->
    <el-col :span="4" :xs="24">
      <ContentWrap class="!mb-0 !h-full demo_tree" bodyStyle="0">
        <div class="pro_title">
          <img src="@/assets/imgs/myUpdate/path.svg"/>
           材料管理</div>
        <materialsTree ref="leftTreeRef" @node-click="handleDeptNodeClick" />
      </ContentWrap>
    </el-col>
    <el-col :span="20" :xs="24">
      <ContentWrap  class="document-list-search">
          <!-- 搜索 -->
        <el-form
          class="mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="检测指标" prop="examineName">
            <el-input
              v-model="queryParams.examineName"
              placeholder="请输入"
              clearable
              @keyup.enter="handleQuery"
              class="!w-230px"
            />
          </el-form-item>
          <el-form-item label="版本号" prop="version">
            <el-input
              v-model="queryParams.version"
              placeholder="请输入"
              clearable
              @keyup.enter="handleQuery"
              class="!w-230px"
            />
          </el-form-item>
          <el-form-item class="ml-auto">
            <el-button color="rgb(63, 98, 151)" dark @click="handleQuery">
              <Icon icon="ep:search" />搜索
            </el-button>
            <el-button @click="resetQuery" color ="rgb(229, 231, 235)"> <Icon icon="ep:refresh" />重置 </el-button>
           
          </el-form-item>
        </el-form>

      </ContentWrap>
      <div class="bg-white p-20px">
        <div class="flex items-center justify-between mb-14px w-full">
          <p class="title">指标设置
          </p>
 <el-button
v-hasPermi="['inspection:item:create']"  plain @click="openForm('create')"
            class="!bg-gray-200  ![color:rgb(45,77,126)] hover:!bg-gray-100 hover:![color:rgb(45,77,126)] hover:!border-none">
              <Icon icon="ep:plus" 
              /> 新增检测指标
            </el-button>
          </div>
  
        <el-table v-loading="loading" :data="list" ref='tableRef'  @sort-change="handleSortChange" :height="tableHeight" :header-cell-class-name="setHeaderStyle" >
          <el-table-column label="序号" type="index" width="60px" align="center" />
          <el-table-column
            label="材料类型"
            align="center"
            sortable="custom"
            key="id"
            prop="materialName"
            show-overflow-tooltip
          />
          <el-table-column
            label="检测指标"
                sortable="custom"
            align="center"
         
            prop="examineName"
            show-overflow-tooltip
          />
          <el-table-column
            label="创建部门"
                  sortable="custom"
            align="center"
            key="id"
            prop="deptName"
            show-overflow-tooltip
          />
          <el-table-column
            label="创建人"
                  sortable="custom"
            align="center"
            key="id"
            prop="creator"
            show-overflow-tooltip
          />
          <el-table-column label="创建日期"       sortable="custom" align="center" prop="createTime">
            <template #default="scope">
              <el-tag type="info">{{ formatDate(scope.row.createTime, 'YYYY-MM-DD') }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="版本号" sortable="custom" align="center" prop="version" show-overflow-tooltip />
          <el-table-column label="操作" align="center" width="180px" fixed="right">
            <template #default="scope">
              <div class="flex items-center justify-center">
                <el-button
                  v-hasPermi="['inspection:item:design']"
                  plain
                  size="small"
                  @click="handleDesign(scope.row, 'design')"
                  style="color:rgb(0, 82, 217)" 
                   class="no-border-btn"
                >
                  设计
                </el-button>

                <el-button 
                  v-hasPermi="['inspection:item:publish']"
                  plain 
                  size="small" 
                  @click="handlePublish(scope.row)"
                  style="color:rgb(0, 82, 217)"  
                  class="no-border-btn"
                >
                  发布
                </el-button>
                <el-dropdown v-if="checkHasPermi(['inspection:item:history', 'inspection:item:preview', 'inspection:item:edit', 'inspection:item:delete'])" @command="handleCommand">
                  <el-button type="primary" class="ml-5px" link>更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item 
                        v-hasPermi="['inspection:item:history']"
                        @click="handleTogglePublishHistory(scope.row)"
                      >发布历史</el-dropdown-item>
                      <el-dropdown-item 
                        v-hasPermi="['inspection:item:preview']"
                        @click="handleDesign(scope.row, 'preview')"
                      >预览</el-dropdown-item>
                      <el-dropdown-item 
                        v-hasPermi="['inspection:item:edit']"
                        @click="openForm('update', scope.row.id)"
                      >编辑</el-dropdown-item>
                      <el-dropdown-item 
                        v-hasPermi="['inspection:item:delete']"
                        @click="handleDelete(scope.row.id)"
                      >删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
  <PublishHistoryModal ref="publishHistoryModalRef" />
  <context-menu v-model:show="contextmenuShow" :options="optionsComponent">
    <context-menu-item
      label="添加"
      :disabled="currentContextMenuNode.projectType === 0"
      @click="openForm('create', currentContextMenuNode.id)"
    />
    <context-menu-sperator />
    <context-menu-item
      label="编辑"
      :disabled="currentContextMenuNode.projectType === 0"
      @click="openForm('edit', currentContextMenuNode.id)"
    />
    <context-menu-sperator />
    <context-menu-item
      label="删除"
      :disabled="currentContextMenuNode.projectType === 0"
      @click="remove({}, currentContextMenuNode)"
    />
  </context-menu>
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
import { usehasPermi } from '@/hooks/web/usehasPermi'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import {camelToUnderscore} from '@/utils/commonMethods'

const { tableHeight } = useTableHeight({
  extraHeight: -10
})
const setHeaderStyle = () => {
  return 'custom-header'
}
const { checkHasPermi } = usehasPermi()

const { push } = useRouter()
const tableRef=ref(null)

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const publishHistoryModalRef = ref(null)
const fileRef = ref(null)
const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
let childList = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  examineName: undefined,
  materialType: '',
  version: undefined
})
const queryFormRef = ref() // 搜索的表单
const lookVideoRef = ref()
const contextmenuShow = ref(false)
const optionsComponent = reactive({
  zIndex: 999,
  minWidth: 230,
  x: 500,
  y: 200
})
const currentContextMenuNode = ref({})
const leftTreeRef = ref()
const lastClickedNode = ref(null) // 记录上次点击的节点

const handleNodeContextmenu = (e, node, component, ...rest) => {
  console.log('🚀 ~ handleNodeContextmenu ~ node:', e, node, component, rest)
  e.preventDefault()
  currentContextMenuNode.value = node
  contextmenuShow.value = true
  optionsComponent.x = e.x
  optionsComponent.y = e.y
}

const showExcel = (link) => {
  fileRef.value.open(link)
}
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await InspectionItemApi.getExamineProjectPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
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


/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
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

  // 判断当前点击的节点是否与上次点击的一致
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
    examineProjectId: id
    // formInfo
  }

  await InspectionItemApi.publishExamineProjectForm(payload)

  message.success(t('common.publishSuccess'))

  await getList()
}

const handleAddEditSuccess = async () => {
  handleRefreshLeftTree()
  getList()
}

const handleRefreshLeftTree = async () => {
  leftTreeRef.value?.refresh?.()
}

const handleCommand = function (commandObj) {
  // 点击菜单项触发的事件回调
  const { command, fn, row } = commandObj
  if (fn) {
    const method = this.$options.methods[fn] // 获取对应操作函数
    method && method.call(this, row) // 执行对应的操作函数
  }
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

::v-deep .el-button:focus-visible {
  border: none;
  outline: 2px solid #fff;
}


</style>
