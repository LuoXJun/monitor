<template>
  <div class="head-container">
    <el-row>
      <el-col :span="24">
       <el-input v-model="deptName" class="mb-10px" clearable placeholder="请输入关键词">
      <template #suffix>
        <Icon icon="ep:search" />
      </template>
    </el-input>
    </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-button  class="add-btn" v-hasPermi="['inspection:item:add']"  plain @click="openForm('create', '')">
          <Icon icon="ep:plus" /> 
          新增材料类型
        </el-button>
     </el-col>
      </el-row>
  </div>
  <div class="tree-warp" :class="{'cancel-tree': !currentSelectedId}" ref="treeWrapRef">
    <el-tree
      ref="treeRef"
      :data="deptList"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :props="defaultProps"
      default-expand-all
      node-key="id"
      @node-click="handleNodeClick"
      @node-contextmenu="handleNodeContextmenu"
    >
      <template #default="{ node }">
        <span style="margin-right: 10px" class="custom-tree-node">
          <!-- <img src="@/assets/imgs/jcxm-icon.png" alt="" /> -->
          <el-tooltip :content="node.label" placement="top">
            <span class="node-label">{{ node.label }} </span>
          </el-tooltip>
          <el-tag  class="tag_quantity">{{ node.data?.quantity ?? 0 }}</el-tag>
          <!-- <span style="font-size: 14px">
            <a @click.stop="openForm('add', data.id)" style="color: #409eff"> 添加 </a>
            <a @click.stop="openForm('edit', data.id)" style="margin-left: 5px; color: #409eff">
              编辑
            </a>
            <a style="margin-left: 5px; color: #f56c6c" @click.stop="remove(node, data)"> 删除 </a>
          </span> -->
        </span>
      </template>
    </el-tree>
    <Dialog v-model="dialogVisible" :title="title" width="600px">
        <template #title>
      <div class="dialog-header">
        <span><img src="@/assets/imgs/myUpdate/path2svg.svg"/>{{title}}</span>
      </div>
    </template>
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="130px"
      >
        <el-form-item label="上级材料" v-if="addType === 'add'" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :disabled="true"
            :data="deptList"
            :default-expanded-keys="[0]"
            :props="defaultProps"
            @node-click="handleNode"
            check-strictly
            node-key="id"
          />
        </el-form-item>

        <el-form-item label="材料名称" prop="materialName">
          <el-input v-model="formData.materialName" maxlength="180" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button  @click="submitForm" color="#3F6297"><Icon icon="ep:document-add" class="mr-1"/>保 存</el-button>
        <el-button @click="dialogVisible = false"><Icon icon="ep:close" class="mr-1"/>取 消</el-button>
      </template>
      
    </Dialog>
  </div>
  <context-menu v-model:show="contextmenuShow" :options="optionsComponent">
    <context-menu-item label="添加" @click="openForm('add', currentContextMenuNode.id)" />
    <context-menu-sperator />
    <context-menu-item label="编辑" @click="openForm('edit', currentContextMenuNode.id)" />
    <context-menu-sperator />
    <context-menu-item
      :disabled="currentContextMenuNode.quantity > 0"
      @click="remove({}, currentContextMenuNode)"
    >
      <template #label>
        <span class="context-menu-item__label">
          <span>删除</span>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="该类型下存在检测指标，不可删除"
            placement="right"
          >
            <Icon icon="ep:warning" v-if="currentContextMenuNode.quantity > 0" />
          </el-tooltip>
        </span>
      </template>
    </context-menu-item>
  </context-menu>
</template>

<script setup>
import { ElTree } from 'element-plus'
import * as InspectionItemApi from '@/api/inspectionItem'
const message = useMessage() // 消息弹窗
defineOptions({ name: 'VideoTree' })
const formLoading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const deptName = ref('')
const { t } = useI18n() // 国际化
const formRef = ref() // 表单 Ref
const deptList = ref([]) // 树形结构
const treeRef = ref()
const parentCode = ref(0)
const addType = ref('')
const defaultCheckKey = ref('1859783688745394178')
const defaultProps = {
  children: 'children',
  label: 'materialName'
}
const formData = ref({
  materialName: '',
  parentId: '0',
  businessType: 1
})
const formRules = reactive({
  materialName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  parentCode: [{ required: true, message: '上级区域不能为空', trigger: 'blur' }]
})
const contextmenuShow = ref(false)
const optionsComponent = reactive({
  zIndex: 999,
  minWidth: 230,
  x: 500,
  y: 200
})
const currentContextMenuNode = ref({})
const treeWrapRef = ref(null)
const treeHeight = ref('75vh') // Default height
const currentSelectedId = ref('') // 新增：当前选中节点的ID

const handleNodeContextmenu = (e, node, component, ...rest) => {
  console.log('🚀 ~ handleNodeContextmenu ~ node:', node)
  e.preventDefault()
  currentContextMenuNode.value = node
  contextmenuShow.value = true
  optionsComponent.x = e.x
  optionsComponent.y = e.y
}

/** 获得部门树 */
const getTree = async () => {
  // const res = await DeptApi.getSimpleDeptList()
  const resData = await InspectionItemApi.getMaterialTree({ businessType: 1 })
  console.log(resData)

  deptList.value = resData
  // deptList.value.push(...handleTree(res))
}

/** 基于名字过滤 */
const filterNode = (name, data) => {
  console.log(data.materialName)

  if (!name) return true
  return data.materialName.includes(name)
}

/** 处理部门被点击 */
const handleNodeClick = async (row) => {

    
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
  treeRef.value?.filter(val)
})

const handleNode = (node) => {
  console.log(node)
  // formData.value.parentCode = node.id
}

const openForm = async (type, id) => {
  title.value = t('action.' + type)
  formData.value.materialName = ''
  addType.value = type
  if (type == 'create') {
    parentCode.value = 0
    formData.value.parentId = 0
  } else if (type == 'edit') {
    const res = await InspectionItemApi.getMaterialDetail(id)
    formData.value = res
    parentCode.value = id
  } else {
    formData.value.parentId = id
  }
  console.log('类型：',addType.value,formData.value)

  dialogVisible.value = true
}

const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  if (title.value == '新增') {
    const res = await InspectionItemApi.createMaterial(formData.value)
    if (res.code == 200) {
      message.success('新增成功')
    }
  } else {
    await InspectionItemApi.updateMaterial(formData.value)
    message.success('编辑成功')
  }
  getTree()
  formLoading.value = false
  dialogVisible.value = false
}

const remove = async (node, data) => {
  console.log(node, data)
  await message.delConfirm()
  if (data.children && data.children.length) {
    message.error('请先删除子节点')
    return
  }
  await InspectionItemApi.deleteMaterial(data.id)
  message.success('删除成功')
  getTree()
}

const refresh = async () => {
  await getTree()
}

defineExpose({ refresh }) // 提供 open 方法，用于打开弹窗

const calculateTreeHeight = () => {
  if (!treeWrapRef.value) return
  const offsetTop = treeWrapRef.value.getBoundingClientRect().top
  const windowHeight = window.innerHeight
  const padding = 72 // Bottom padding
  treeHeight.value = `${windowHeight - offsetTop - padding}px`
}

/** 初始化 */
onMounted(async () => {
  await getTree()
  calculateTreeHeight()
  window.addEventListener('resize', calculateTreeHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateTreeHeight)
})
</script>

<style lang="scss" scoped>
// .head-container {
//   display: flex;
//   width: 100%;
//   justify-content: space-between;
//   align-items: center;
// }

.searchInput {
  width: 100%;
  margin-right: 10px;
}

.custom-tree-node {
  display: flex;
  padding-right: 8px;
  font-size: 14px;
  flex: 1;
  align-items: center;
  font-size:  var(--font-size-base);
  //justify-content: space-between;
}

.node-label {
  max-width: 120px;
  margin: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.context-menu-item__label {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-inline-end: 16px;

  > span {
    margin-right: 5px;
  }
}

.tree-warp {
  height: v-bind(treeHeight);
}

.tree-warp .el-tree {
  height: 100%;
  overflow: auto; // Changed from scroll to auto

}

::v-deep .el-tree-node > .el-tree-node__children {
  overflow: visible;
}

.tree-warp .el-tree::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.tree-warp .el-tree::-webkit-scrollbar-track {
  background: rgb(255 255 255 / 100%);
  border-radius: 2px;
}

.tree-warp .el-tree::-webkit-scrollbar-thumb {
  background: rgb(236 245 255 / 100%);
  border-radius: 10px;
}

.tree-warp .el-tree::-webkit-scrollbar-thumb:hover {
  background: rgb(64 158 255 / 40%);
}

.tree-warp .el-tree::-webkit-scrollbar-corner {
  background: rgb(236 245 255 / 100%);
}
.cancel-tree {
  ::v-deep .el-tree-node:focus > .el-tree-node__content {
    background-color: unset!important;
  }
}
.head-container{
  margin: 10px 7.5px;

}
.add-btn {
  text-align: center;
  padding: 0px 12px !important;
  color: rgba(0, 0, 0, 0.8) !important;
  font-size: var(--font-size-base) !important;
}
.tag_quantity{
  border: 1px solid #ccc;
  border-radius: 3px;
  background: rgb(255, 255, 255);
  color: rgba(0, 0, 0, 0.9);
  padding: 4px 6px;
  margin-left: 10px !important;
}

</style>
