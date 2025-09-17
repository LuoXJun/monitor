<template>
  <div :class="attrs.class">
    <el-input v-model="tableName" class="mb-20px" clearable placeholder="请输入表注释">
      <template #prefix>
        <Icon icon="ep:search" class="search-icon" @click="handleSearch" />
      </template>
    </el-input>
    <div class="tree-wrap">
      <el-tree
        ref="treeRef"
        style="max-width: 600px"
        :data="deptList"
        :filter-node-method="filterNode"
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
              <span v-else>{{ data.label }}</span>
            </span>
          </span>
          <el-tooltip placement="right">
            <Icon icon="ep:info-filled" />
            <template #content>
              <div :style="{ width: '100%' }">
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
  </div>
</template>

<script setup>
import { ElTree } from 'element-plus'
import * as SqlApi from '@/api/sql'

defineOptions({ name: 'DatasetTree' })

const emits = defineEmits(['node-dragend'])
const treeRef = ref()

const TREE_NODE_TYPES = {
  table: 'table',
  field: 'field'
}

const attrs = useAttrs()

const tableName = ref('')
const deptList = ref([])

const renderField = (data) => {
  return data.label
}

const buildTreeTableData = (tableList = []) => {
  const data = []
  tableList.forEach((table) => {
    data.push({
      id: table.tableName,
      label: table.tableDesc,
      value: table.tableName,
      type: TREE_NODE_TYPES.table,
      children: JSON.parse(table.tableColumns || '[]').map((field) => {
        return {
          id: field.fieldName,
          label: field.fieldRemark,
          value: field.fieldName,
          fieldType: field.fieldType,
          table: table.tableName,
          type: TREE_NODE_TYPES.field
        }
      })
    })
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

const handleDataDragEnd = (data) => {
  emits('node-dragend', data)
}

const filterNode = (value, data) => {
  if (!value) return true

  return (data?.label ?? '').includes(value)
}

watch(tableName, (val) => {
  treeRef.value?.filter(val)
})

onMounted(async () => {
  await getTableList()
})
</script>

<style lang="scss" scoped>
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
</style>
