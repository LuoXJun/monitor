<template>
  <el-row :gutter="10" class="device-manager-container">
    <!-- 左侧部门树 -->
    <el-col :xs="24" :sm="24" :md="7" :lg="6" :xl="5" class="device-manager-left-col">
      <ContentWrap class="!mb-0 !h-full demo_tree" bodyStyle="0">
        <div class="pro_title">
          <img src="@/assets/imgs/myUpdate/path.svg"/>
          设备种类树</div>
        <deviceTypeTree @change-device="handleChangeDevice" />
      </ContentWrap>
      <!-- <ContentWrap class="device-tree">
        <deviceTypeTree @change-device="handleChangeDevice" />
      </ContentWrap> -->
    </el-col>
    <el-col :xs="24" :sm="24" :md="17" :lg="18" :xl="19" class="device-manager-right-col">
      <!-- 搜索 -->
      <ContentWrap class="device-list-search document-list-search">
        <el-form
          class="-mb-0px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="设备名称" prop="equipmentName">
            <el-input
              v-model="queryParams.equipmentName"
              placeholder="请输入"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="设备型号" prop="equipmentCode">
            <el-input
              v-model="queryParams.equipmentCode"
              placeholder="请输入"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>

          <el-form-item class="ml-auto">
            <el-button color="rgb(63, 98, 151)" dark @click="handleQuery">
              <Icon icon="ep:search" />搜索
            </el-button>
            <el-button color ="rgb(229, 231, 235)" @click="resetQuery"> <Icon icon="ep:refresh" />重置 </el-button>
            <el-button color="rgb(63, 98, 151)" plain @click="listAll">
              <Icon icon="ep:memo" /> 显示全部
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
      <div class="bg-white p-20px">
        <div class="flex items-center justify-between mb-14px w-full">
          <p class="title">文件管理
          </p>
           <el-button
              v-hasPermi="['device:info:create']"
              type="success"
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
          class="device-list-content-table"
          :header-cell-class-name="setHeaderStyle"
          
        >
          <el-table-column label="序号" type="index" width="70px" align="center" />
          <el-table-column
            label="设备名称"
            sortable="custom"
            align="left"
            key="id"
            prop="equipmentName"
          />
          <el-table-column label="检定记录"  sortable="custom"  align="center" prop="attachment">
            <template #default="scope">
              <el-menu :collapse="true">
                <el-menu-item v-if="parseAttachment(scope.row.attachment).length === 0">
                  <div class="attachment-num-tag">
                    <el-tag type="info" round effect="plain">0</el-tag>
                  </div>
                </el-menu-item>
                <el-sub-menu index="1" v-if="parseAttachment(scope.row.attachment).length > 0">
                  <template #title>
                    <div class="attachment-num-tag">
                      <el-tag type="primary" round effect="plain">{{
                        parseAttachment(scope.row.attachment).length
                      }}</el-tag>
                    </div>
                  </template>
                  <el-menu-item
                    v-for="(item, index) in parseAttachment(scope.row.attachment)"
                    :key="index"
                    class="attachment-name"
                  >
                    <div
                      @click="showExcel(item.url)"
                      style="color: #0256ff; white-space: nowrap; cursor: pointer"
                    >
                      {{ item?.name || item?.originFileName }}
                    </div>
                  </el-menu-item>
                </el-sub-menu>
              </el-menu>
            </template>
          </el-table-column>
          <el-table-column
            label="上次检定时间"
            sortable="custom"
            align="center"
            prop="lastCheckTime"
          >
            <template #default="scope">
              <el-tag type="primary" class="no-border-btn">{{ scope.row.lastCheckTime }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="下次检定时间"
            sortable="custom"
            align="center"
            prop="nextCheckTime"
          >
            <template #default="scope">
              <el-tag :type="getNextCheckTimeTagType(scope.row.nextCheckTime)" class="no-border-btn">{{
                scope.row.nextCheckTime
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="检定周期" sortable="custom" align="center" prop="cycleType">
            <template #default="scope">
              <div>
                {{ scope.row.cycleNum
                }}{{ getDictLabel(DICT_TYPE.INSPECTION_CYCLE, scope.row.cycleType) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" fixed="right" width="200">
            <template #default="scope">
              <div class="flex items-center justify-center">
                <el-button
                  style="color:rgb(0, 82, 217)"
                  plain
                  size="small"
                  v-hasPermi="['device:info:edit']"
                  @click="openForm('update', scope.row.id)"
                  class="no-border-btn"
                >
                  编辑
                </el-button>
                <el-button
                  style="color:rgb(0, 82, 217)"
                  plain
                  size="small"
                  v-hasPermi="['device:info:verification']"
                  @click="openForm('verification', scope.row.id)"
                  class="no-border-btn"
                >
                  检定
                </el-button>
                <!-- <el-button type="primary" plain size="small" @click="openHistory(scope.row.id)">
                  检定历史
                </el-button> -->
                <!-- <el-button link type="danger" @click="handleDelete(scope.row.id)"> 删除 </el-button> -->
                <el-dropdown v-if="checkPermi(['device:info:delete', 'device:info:history'])">
                  <el-button style="color:rgb(0, 82, 217)" class="ml-5px" link> 更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-hasPermi="['device:info:delete']"
                        @click="handleDelete(scope.row.id)"
                        >删除</el-dropdown-item
                      >
                      <el-dropdown-item
                        v-hasPermi="['device:info:history']"
                        @click="openHistory(scope.row.id)"
                        >检定历史</el-dropdown-item
                      >
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
          v-model:page="queryParams.pageNo"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
          class="device-list-content-pagination"
        />
        </div>
      </div>
      
    </el-col>
  </el-row>
  <addEdit ref="formRef" @success="getList" />
  <filePreview ref="fileRef" />
  <verificationHistory ref="historyRef" />
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'

import deviceTypeTree from './deviceTypeTree.vue'
import * as DeviceApi from '@/api/device.js'
import filePreview from '@/components/FilePreview/index.vue'
import verificationHistory from './verificationHistory.vue'
import addEdit from './addEdit.vue'
import { usehasPermi } from '@/hooks/web/usehasPermi'
import { camelToUnderscore } from '@/utils/commonMethods'
const { checkHasPermi } = usehasPermi()
const { query } = useRoute() // 查询参数

const fileRef = ref(null)
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const type = query.type

const loading = ref(false) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
let childList = ref([])
const setHeaderStyle = () => {
  return 'custom-header'
}
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  type: type,
  equipmentType: '',
  equipmentName: undefined,
  equipmentCode: undefined
})
const queryFormRef = ref() // 搜索的表单
const lookVideoRef = ref()
const historyRef = ref(null)
const tableRef = ref(null)
const showExcel = (link) => {
  fileRef.value.open(link)
}

const parseAttachment = (attachment) => {
  let result = []
  try {
    result = JSON.parse(attachment)
  } catch (error) {
    console.log('附件的格式错误:', attachment)
    result = []
  }
  return result
}

const resetQueryParams = () => {
  queryParams.equipmentType = ''
  queryParams.equipmentName = undefined
  queryParams.equipmentCode = undefined

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

const listAll = () => {
  resetQueryParams()
  resetQuery()
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await DeviceApi.getDeviceInfoPage(queryParams)
    list.value = data.list
    total.value = data.total
    // list.value[0].link = 'http://static.shanhuxueyuan.com/demo/excel.xlsx'
    // list.value[1].link = 'http://static.shanhuxueyuan.com/test6.docx'
    // list.value[2].link = 'http://static.shanhuxueyuan.com/test.pdf'
    // list.value[3].link = 'http://101.126.77.103:9000/sandfile/6d516d9d6b546215db1f5017bf61fb702c1e01e0c6b677d2ce532c6b5501f770.png'
  } finally {
    loading.value = false
  }
}
const lastClickedNode = ref(null) // 记录上次点击的节点

const handleChangeDevice = (id, params) => {
  if (lastClickedNode.value === id) {
    queryParams.equipmentType = null // 如果一致，重置 equipmentType
    lastClickedNode.value = '' // 更新上次点击的节点
  } else {
    queryParams.equipmentType = id // 否则，更新为当前节点的 id
    lastClickedNode.value = id // 更新上次点击的节点
  }

  queryParams.type = params?.type
  getList()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.orderColumn = undefined
  queryParams.orderAsc = undefined
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
const openForm = (type, id) => {
  // if (type === 'create') {
  //   if (childList.value != null) {
  //     message.error('只能在节点子项新增！')
  //     return
  //   }
  // }
  formRef.value.open(type, queryParams.equipmentType, id)
}
const handleDelete = async (id) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await DeviceApi.deleteDeviceInfo(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

const openVideo = (row) => {
  lookVideoRef.value.open()
}

const openHistory = (id) => {
  historyRef.value.open(id)
}

const getNextCheckTimeTagType = (nextCheckTime) => {
  const nextCheck = new Date(nextCheckTime)
  const now = new Date()
  const diffDays = Math.ceil((nextCheck - now) / (1000 * 60 * 60 * 24))

  const tagTypes = new Map([
    ['gray', 'info'],
    ['red', 'danger'],
    ['orange', 'warning'],
    ['blue', 'primary'],
    ['green', 'success']
  ])

  if (diffDays <= 0) {
    //   return tagTypes.get('gray')
    // } else if (diffDays <= 7) {
    return tagTypes.get('red') // 超时显示红色
  } else if (diffDays <= 30) {
    return tagTypes.get('orange') // 一个月内显示橙色
  } else {
    return tagTypes.get('green') // 其他情况显示默认颜色
  }
}

/** 初始化 */
onMounted(() => {
  listAll()
})
</script>

<style lang="scss" scoped>
@import '@/styles/tableCommon.scss';
$el-menu-item-height: 24px;
$menu-bg-color: #fff0;

.device-manager-container {
  $contain-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--tags-view-height) - var(--app-footer-height) - var(
        --app-content-padding
      )
  ) !important;
  $reactive-width: 992px; // 对应响应式尺寸 md = 992px

  /* 响应式，当宽度小于响应式尺寸md=992px时触发 */
  @media (max-width: $reactive-width) {
    & {
      min-height: $contain-height;
    }

    .device-manager-left-col {
      margin-bottom: 15px;
    }
  }

  /* 响应式，当宽度大于等于响应式尺寸md=992px时触发 */
  @media (min-width: $reactive-width) {
    & {
      height: $contain-height;
      overflow: hidden;
    }

    .device-manager-left-col {
      height: 100%;
    }

    .device-manager-right-col {
      display: flex;
      height: 100%;
      flex-direction: column;
    }
  }

  .el-card {
    margin: 0;
  }

  .el-menu {
    margin: auto;
    background-color: $menu-bg-color;
    border: none;

    :deep(.el-sub-menu__title) {
      height: $el-menu-item-height;
      background-color: $menu-bg-color;
    }

    .el-menu-item {
      height: $el-menu-item-height;
      background-color: $menu-bg-color;
    }

    :deep(.attachment-num-tag) {
      display: flex;
    }
  }

  .device-tree {
    height: 100%;
  }

  .device-list-search {
    margin-bottom: 10px;
  }

  .device-list-content {
    display: flex;
    margin-bottom: 0;
    flex: 1;
    flex-direction: column;
    padding: 20px;

    .device-list-content-table {
      width: 100%;

      /* 高度 = 100% - 分页组件高度 */
      height: calc(100% - 32px);
      padding-bottom: 15px;
    }

    .device-list-content-pagination {
      width: 100%;
      margin: 0;
      justify-content: end;
    }
  }
}

.attachment-name {
  height: $el-menu-item-height;
}

::v-deep .el-button:focus-visible {
  border: none;
  outline: 2px solid #fff;
}
</style>
