<template>
  <!-- <div class="add-btn">
    <el-button type="primary" plain @click="openForm('add', '')">
      <Icon icon="ep:plus" /> 新增
    </el-button>
  </div> -->
  
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
    <el-row >
     <el-col :span="24">
        <el-button class="add-btn"  v-hasPermi="['document:project:add']" plain @click="openForm('add', '')">
          <Icon icon="ep:plus" />新增
        </el-button>
      </el-col>
      </el-row>
  </div>
  <div class="tree-warp" :class="{'cancel-tree': !currentSelectedId}" ref="treeWrapRef">
    <el-tree
      ref="treeRef"
      :style="{ height: treeHeight + 'px' }"
      :data="projectList"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :props="defaultProps"
      default-expand-all
      highlight-current
      node-key="id"
      @node-click="handleNodeClick"
      @node-contextmenu="handleNodeContextmenu"
    >
      <template #default="{ node }">
        <span
         
          :class="['custom-tree-node', { isDoc: node.data.projectType === 1 }]"
        >
          <!-- <img src="@/assets/imgs/folder.png" alt="" /> -->
          <el-tooltip :content="node.label" placement="top">
            <span class="node-label">{{ node.label }} </span>
          </el-tooltip>
          <el-tag class="tag_quantity">{{ node.data?.quantity ?? 0 }}</el-tag>
        </span>
         
      </template>
    </el-tree>
    <context-menu v-model:show="contextmenuShow" :options="optionsComponent">
      <context-menu-item
        label="添加"
        v-hasPermi="['document:project:add']"
        :disabled="currentContextMenuNode.projectType === 0"
        @click="openForm('create', currentContextMenuNode.id)"
      />
      <context-menu-sperator />
      <context-menu-item
        label="编辑"
        v-hasPermi="['document:project:edit']"
        :disabled="currentContextMenuNode.projectType === 0"
        @click="openForm('edit', currentContextMenuNode.id)"
      />
      <context-menu-sperator />
      <context-menu-item
        label="删除"
        v-hasPermi="['document:project:del']"
        :disabled="currentContextMenuNode.projectType === 0 || currentContextMenuNode.quantity > 0"
        @click="remove({}, currentContextMenuNode)"
      />
    </context-menu>
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
        <el-form-item label="上级工程" v-if="addType === 'create'" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :disabled="true"
            :data="projectList"
            :default-expanded-keys="[0]"
            :props="defaultProps"
            @node-click="handleNode"
            check-strictly
            node-key="id"
          />
        </el-form-item>

        <el-form-item label="工程名称" prop="projectName">
          <el-input v-model="formData.projectName" maxlength="180" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
         <el-button color="#3F6297" @click="submitForm">
            <Icon icon="ep:document-add" class="mr-1"/>
            保 存</el-button>
          <el-button @click="dialogVisible = false">
             <Icon icon="ep:close" class="mr-1"/>
            取 消</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { ElTree } from 'element-plus'

// import * as VideoApi from '@/api/video.js'
import * as ItemApi from '@/api/itemManage'
const message = useMessage() // 消息弹窗
defineOptions({ name: 'VideoTree' })
const formLoading = ref(false)
const dialogVisible = ref<boolean>(false)
const title = ref('')
const deptName = ref('')
const formRef = ref() // 表单 Ref

const treeRef = ref<InstanceType<typeof ElTree>>()
const parentCode = ref('1')
const addType = ref('')
const projectList = ref([])
const defaultProps = {
  children: 'children',
  label: 'projectName'
}
const formData = ref({
  projectType: 1,
  projectName: '',
  parentId: undefined,
  id: undefined
})
const formRules = reactive({
  projectName: [{ required: true, message: '工程名称不能为空', trigger: 'blur' }],
  parentId: [{ required: true, message: '上级区域不能为空', trigger: 'blur' }]
})
const contextmenuShow = ref(false)
const optionsComponent = reactive({
  zIndex: 999,
  minWidth: 230,
  x: 500,
  y: 200
})
const currentContextMenuNode = ref({})

const treeWrapRef = ref()
const treeHeight = ref(0)
const currentSelectedId= ref('')

const calculateTreeHeight = () => {
  if (treeWrapRef.value) {
    const windowHeight = window.innerHeight
    const treeWrapTop = treeWrapRef.value.getBoundingClientRect().top
    treeHeight.value = windowHeight - treeWrapTop - 75 // 20px buffer
  }
}

const getTree = async () => {
  const data = await ItemApi.getTreeList()
  projectList.value = data
}

/** 基于名字过滤 */
const filterNode = (name: string, data: any) => {
  if (!name) return true
  return data.projectName.includes(name)
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

const handleNode = (node: any) => {
  console.log(node)
}

const openForm = async (type: string, id: any) => {
  addType.value = type
  if (type == 'create' || type == 'add') {
    title.value = '新增'

    formData.value.parentId = id
  } else {
    title.value = '编辑'
    const res = await ItemApi.getItemDetail(id)
    formData.value.projectName = res.projectName
    formData.value.projectType = res.projectType
    formData.value.id = res.id
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  if (title.value == '新增') {
    const res = await ItemApi.createItem(formData.value)
    if (res.code == 200) {
      message.success('新增成功')
    }
  } else {
    await ItemApi.updateItem(formData.value)
    message.success('编辑成功')
    formData.value.id = undefined
  }
  getTree()
  formLoading.value = false
  dialogVisible.value = false
}

const remove = async (node: any, data: any) => {
  console.log('🚀 ~ remove ~ data:', data)
  if (data.children && data.children.length) {
    message.error('请先删除子节点')
    return
  }
  await message.delConfirm()

  await ItemApi.deleteItem(data.id)
  message.success('删除成功')
  getTree()
}

const handleNodeContextmenu = (e, node, component, ...rest) => {
  console.log('🚀 ~ handleNodeContextmenu ~ node:', e, node, component, rest)
  e.preventDefault()
  currentContextMenuNode.value = node
  contextmenuShow.value = true
  optionsComponent.x = e.x
  optionsComponent.y = e.y
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

const refresh = async () => {
  await getTree()
}

defineExpose({ refresh }) // 提供 open 方法，用于打开弹窗

</script>

<style lang="scss" scoped>
.add-btn {
  text-align: center;
  padding: 0px 12px !important;
  color: rgba(0, 0, 0, 0.8) !important;
  font-size: var(--font-size-base) !important;
}

.custom-tree-node {
  display: flex;
  padding-right: 8px;
  font-size:  var(--font-size-base);
  flex: 1;
  align-items: center;
  // justify-content: space-between;



  span {
    margin-left: 5px;
  }
}

.custom-contextmenu-item {
  padding: 0;
  margin: 5px 0;
}

.custom-contextmenu-item__content {
  width: 100%;

  > button {
    width: 100%;
  }
}

.isDoc {
  //olor: var(--el-color-primary);
  color: rgb(45, 77, 126);
}

.tree-warp {
  // Remove fixed height
   //height: 100%;  
   width: 100%;
   //height: 75vh !important; // 限制高度以触发滚动
    //overflow-y: auto;
  // overflow-x: auto;

  
  
}

.tree-warp .el-tree {
  // Remove fixed height
  // height: 100%;
   width: 1000px; // 临时设置一个很大的宽度以测试滚动条
 
}

.tree-warp .el-tree::-webkit-scrollbar{
  width: 8px; // 滚动条宽度
}
.tree-warp .el-tree::-webkit-scrollbar-track{
   background: #f1f1f1; // 滚动条轨道背景
    border-radius: 4px; // 圆角
}
.tree-warp .el-tree::-webkit-scrollbar-thumb{
    background: #d6d2d2; // 滚动条滑块颜色
    border-radius: 4px; // 圆角
}
.tree-warp .el-tree::-webkit-scrollbar-thumb:hover{
   background: #555; // 滑块悬停颜色
}
.tree-warp .el-tree::-webkit-scrollbar-corner{
  background: rgba(236,245,255,1);
}

.cancel-tree {
  ::v-deep .el-tree-node:focus > .el-tree-node__content {
    background-color: unset!important;
  }
}
.head-container{
  margin: 10px 7.5px;

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
