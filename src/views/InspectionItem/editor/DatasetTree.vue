<template>
  <div :class="attrs.class">
    <div class="operation">
      <el-button color="#3F6297" :style="{ width: '100%' }" @click="openForm">
        <!-- <Icon icon="ep:plus" /> -->
        选择业务表
      </el-button>
    </div>
    <el-input v-model="tableName" class="mb-20px" clearable placeholder="请输入表注释或字段名">
      <template #prefix>
        <Icon icon="ep:search" class="search-icon" @click="handleSearch" />
      </template>
    </el-input>
    <div class="tree-wrap">
      <el-tree
        ref="treeRef"
        style="max-width: 600px"
        :data="deptList"
        v-loading="loading"
        :filter-node-method="filterNode"
        class="custom-tree"
        @node-contextmenu="handleNodeContextmenu"
      >
        <template #default="{ data }">
          <span
            class="custom-tree-node"
            @dragend="(e) => handleDataDragEnd(data, e)"
            :draggable="data.type === TREE_NODE_TYPES.field"
          >
            <span :title="renderField(data)">
              <el-tag type="primary" v-if="data.type === TREE_NODE_TYPES.field">
                {{ data.label }}
              </el-tag>
              <span v-else class="table-name">{{ data.label }}</span>
            </span>
          </span>
          <el-tooltip placement="right">
            <Icon icon="ep:info-filled" />
            <template #content>
              <div :style="{ width: '100%' }">
                <p v-if="data.type === TREE_NODE_TYPES.table"> 表注释: {{ data.label }} </p>
                <p>
                  {{ data.type === TREE_NODE_TYPES.table ? '表名' : '字段名' }}: {{ data.value }}
                </p>
                <p v-if="data.type === TREE_NODE_TYPES.field">字段类型: {{ data.fieldType }}</p>
              </div>
            </template>
          </el-tooltip>
        </template>
      </el-tree>
    </div>
    <context-menu v-model:show="contextmenuShow" :options="optionsComponent">
      <context-menu-item label="编辑" @click="handleEdit(currentContextMenuNode)" />
      <context-menu-item
        label="删除"
        :disabled="
          currentContextMenuNode.tableType == 1 ||
          currentContextMenuNode.type === 'field' ||
          currentContextMenuNode.projectType === 0 ||
          currentContextMenuNode.quantity > 0
        "
        @click="remove(currentContextMenuNode)"
      />
    </context-menu>
    <AddForm
      ref="addFormRef"
      :examineId="props.examineId"
      @success="handleAddSuccess"
      @delete:table="handleDelete"
    />
    <AddEditDataBaseModal ref="addEditDataBaseModalRef" @success="handleEditTableSuccess" />
  </div>
</template>

<script setup>
import { ElTree } from 'element-plus'
import * as SqlApi from '@/api/sql'
import { getExamineTable, delExamineTable } from '@/api/inspectionItem'
import { useEmitt } from '@/hooks/web/useEmitt'
import {
  TZ_BASE_TABLE_NAME,
  BASIC_TABLE_REQUEST_STATUS_MAP
} from '@/components/luckysheet/constants/index'
import { getSheetsHasConfigFields } from '@/components/luckysheet/utils/util'
import AddEditDataBaseModal from '@/views/databaseManage/addEditForm.vue'
import { OPERATE_TYPE_MAP } from '@/constants/databaseManage'
import AddForm from './addForm.vue'

defineOptions({ name: 'DatasetTree' })

const props = defineProps({
  examineId: {
    type: String,
    default() {
      return ''
    }
  }
})

const emits = defineEmits(['node-dragend'])
const treeRef = ref()

const TREE_NODE_TYPES = {
  table: 'table',
  field: 'field'
}

const attrs = useAttrs()

const addFormRef = ref()
const tableName = ref('')
const deptList = ref([])
const contextmenuShow = ref(false)
const optionsComponent = reactive({
  zIndex: 999,
  minWidth: 230,
  x: 500,
  y: 200
})
const currentContextMenuNode = ref({})
const loading = ref(false)

const handleNodeContextmenu = (e, node, component, ...rest) => {
  e.preventDefault()

  if (node?.type === 'field') {
    return
  }

  currentContextMenuNode.value = node
  contextmenuShow.value = true
  optionsComponent.x = e.x
  optionsComponent.y = e.y
}

const addEditDataBaseModalRef = ref(null)

const openEditTableForm = (operateType, tableName) => {
  let sheetsFields = []

  if (operateType === OPERATE_TYPE_MAP.edit.key) {
    sheetsFields = getSheetsHasConfigFields()
  }
  addEditDataBaseModalRef.value.open(operateType, tableName, sheetsFields)
}

const handleEdit = () => {
  console.log('TODO:handleEdit', currentContextMenuNode.value)
  openEditTableForm(OPERATE_TYPE_MAP.edit.key, currentContextMenuNode.value.value)
}

const handleDelete = () => {
  fetchExamineTable()
}

const handleEditTableSuccess = () => {
  fetchExamineTable()
}

const remove = async () => {
  loading.value = true
  try {
    await delExamineTable({ examineId: props.examineId, tableId: currentContextMenuNode.value?.id })
    fetchExamineTable()
  } finally {
    loading.value = false
  }
}

const renderField = (data) => {
  return data.label
}

const buildTreeTableData = (tableList = []) => {
  const data = []

  tableList.forEach((table) => {
    // const isExaminePropertyTable = table?.tableName?.includes?.('tz_examine_property')
    // const isBaseTable = table?.tableName?.includes?.('tz_basetable')
    // if (isBaseTable || isExaminePropertyTable) {
    //   return
    // }

    const _table = {
      id: table.id,
      label: table.tableDesc,
      value: table.tableName,
      type: TREE_NODE_TYPES.table,
      tableType: table.tableType,
      children: []
    }

    JSON.parse(table.tableColumns || '[]').forEach((field) => {
      if (field.isCommonField === 0) {
        _table.children.push({
          id: field.fieldName,
          label: field.fieldRemark,
          value: field.fieldName,
          fieldType: field.fieldType,
          table: table.tableName,
          tableDesc: table.tableDesc,
          tableType: table.tableType,
          type: TREE_NODE_TYPES.field
        })
      }
    })

    data.push(_table)
  })

  return data
}

const handleSearch = () => {
  console.log('TODO:handleSearch', tableName.value)
}

const getTableList = async () => {
  const data = await SqlApi.getDbList()
  const tableData = buildTreeTableData(data)
  deptList.value = tableData
}

const handleAddBasicTableEvent = () => {}

const { emitter } = useEmitt({
  name: BASIC_TABLE_REQUEST_STATUS_MAP.init,
  callback: handleAddBasicTableEvent
})

const fetchExamineTable = async (init) => {
  loading.value = true
  try {
    const data = await getExamineTable({ examineId: props.examineId })
    const tableData = buildTreeTableData(data)
    deptList.value = tableData

    // if (init === BASIC_TABLE_REQUEST_STATUS_MAP.init) {
    const baseTable = data?.find((d) => d.tableName === TZ_BASE_TABLE_NAME)
    const { tableDesc, tableName, tableColumns = '[]' } = { ...baseTable }
    const baseTableColumns = JSON.parse(tableColumns)
    const baseTableColumnsMap = {}
    baseTableColumns.forEach((item) => {
      baseTableColumnsMap[item.fieldRemark] = { ...item, tableDesc, tableName }
    })

    emitter.emit(BASIC_TABLE_REQUEST_STATUS_MAP.init, baseTableColumnsMap)
    // }
  } finally {
    loading.value = false
  }
}

const handleAddSuccess = () => {
  fetchExamineTable()
}

const handleDataDragEnd = (data) => {
  emits('node-dragend', data)
}

const filterNode = (value, data) => {
  if (!value) return true

  return (data?.label ?? '').includes(value)
}

const openForm = () => {
  const selectedTableList = deptList.value.filter(
    (item) => item.tableName !== TZ_BASE_TABLE_NAME && item.tableType !== 1
  )
  addFormRef.value.open(selectedTableList)
}

watch(tableName, (val) => {
  treeRef.value?.filter(val)
})

onMounted(async () => {
  // await getTableList()
  await fetchExamineTable(BASIC_TABLE_REQUEST_STATUS_MAP.init)
})
</script>

<style lang="scss" scoped>
.operation {
  margin-bottom: 12px;
}

.search-icon {
  cursor: pointer;
}

.custom-tree-node {
  display: flex;
  padding-right: 8px;
  font-size: 14px;
  flex: 1;
  align-items: center;
  justify-content: space-between;
}

.custom-tree {
  height: 100%;
  padding-right: 3px;
  overflow: scroll;

  :deep(.el-loading-mask) {
    z-index: 2000 !important;
  }
}

.table-name {
  display: block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-wrap .el-tree::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.tree-wrap .el-tree::-webkit-scrollbar-track {
  background: rgb(255 255 255 / 100%);
  border-radius: 2px;
}

.tree-wrap .el-tree::-webkit-scrollbar-thumb {
  background: rgb(236 245 255 / 100%);
  border-radius: 10px;
}

.tree-wrap .el-tree::-webkit-scrollbar-thumb:hover {
  background: rgb(64 158 255 / 40%);
}

.tree-wrap .el-tree::-webkit-scrollbar-corner {
  background: rgb(236 245 255 / 100%);
}
</style>
