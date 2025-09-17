<template>
  <div class="head-container">
    <el-input v-model="deptName" class="mb-10px" clearable placeholder="请输入部门名称">
      <template #prefix>
        <Icon icon="ep:search" />
      </template>
    </el-input>
  </div>
  <div class="head-container" :class="{'cancel-tree': !currentSelectedId}" ref="treeWrapRef">
    <el-tree
      ref="treeRef"
      :style="{ height: treeHeight + 'px' }"
      :data="deptList"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :props="defaultProps"
      default-expand-all
      highlight-current
      node-key="id"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { ElTree } from 'element-plus'
import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'

defineOptions({ name: 'SystemUserDeptTree' })

const deptName = ref('')
const deptList = ref<Tree[]>([]) // 树形结构
const treeRef = ref<InstanceType<typeof ElTree>>()
const treeWrapRef = ref()
const treeHeight = ref(0)
const currentSelectedId=ref('')

/** 获得部门树 */
const getTree = async () => {
  const res = await DeptApi.getSimpleDeptList()
  deptList.value = []
  deptList.value.push(...handleTree(res))
}

/** 基于名字过滤 */
const filterNode = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}

/** 处理部门被点击 */
const handleNodeClick = async (row: { [key: string]: any }) => {
  if(row.id === currentSelectedId.value){
    currentSelectedId.value = ''

  }else{
    currentSelectedId.value = row.id
  }
  emits('node-click', row)
}
const emits = defineEmits(['node-click'])

/** 监听deptName */
watch(deptName, (val) => {
  treeRef.value!.filter(val)
})

/** 计算树的高度 */
const calculateTreeHeight = () => {
  if (treeWrapRef.value) {
    const windowHeight = window.innerHeight
    const treeWrapTop = treeWrapRef.value.getBoundingClientRect().top
    treeHeight.value = windowHeight - treeWrapTop - 86 // 75px buffer
  }
}

/** 初始化 */
onMounted(async () => {
  await getTree()
  calculateTreeHeight()
  window.addEventListener('resize', calculateTreeHeight)
})

/** 卸载 */
onUnmounted(() => {
  window.removeEventListener('resize', calculateTreeHeight)
})
</script>

<style lang="scss" scoped>
.head-container .el-tree {
  overflow: auto;
}

.head-container .el-tree::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.head-container .el-tree::-webkit-scrollbar-track {
  background: rgb(255, 255, 255, 1);
  border-radius: 2px;
}

.head-container .el-tree::-webkit-scrollbar-thumb {
  background: rgba(236, 245, 255, 1);
  border-radius: 10px;
}

.head-container .el-tree::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 158, 255, 0.4);
}

.head-container .el-tree::-webkit-scrollbar-corner {
  background: rgba(236, 245, 255, 1);
}

.cancel-tree {
  ::v-deep .el-tree-node:focus > .el-tree-node__content {
    background-color: unset!important;
  }
}
</style>
