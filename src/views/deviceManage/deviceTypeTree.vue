<template>
 
  <div class="head-container">
    
      <div class="add-btn">
        <el-button  v-hasPermi="['device:info:add']" plain @click="openForm('create', 1)">
          <Icon icon="ep:plus" /> 新增设备种类
        </el-button>
      </div>
     
    <div class="list">
      <div
        class="item"
        :style="{ background: currentId === item.id ? '#ecf5ff' : '' }"
        @click="clickItem(item.id)"
        v-for="item in list"
        :key="item.id"
        @contextmenu="(e) => handleNodeContextmenu(e, item)"
      >
        <div class="left">
          <img
            class="transform-translate-y-2px"
            src="../../assets/imgs/icon6.png"
            alt=""
            srcset=""
          />
          {{ item.categoryName }}
        </div>
        <!-- <div class="right">
          <a style="color: #409eff; cursor: pointer" @click.stop="openForm('edit', item.id)">
            编辑
          </a>
          <a
            style="margin-left: 8px; color: #f56c6c; cursor: pointer"
            @click.stop="remove(item.id)"
          >
            删除
          </a>
        </div> -->
      </div>
    </div>

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
        <el-form-item label="设备种类名称" prop="categoryName">
          <el-input v-model="formData.categoryName" maxlength="180" placeholder="请输入" />
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
  <context-menu v-model:show="contextmenuShow" :options="optionsComponent">
    <context-menu-item
      label="编辑"
      :disabled="currentContextMenuNode.projectType === 0"
      @click="openForm('edit', currentContextMenuNode.id)"
    />
    <context-menu-sperator />
    <context-menu-item
      label="删除"
      :disabled="currentContextMenuNode.projectType === 0"
      @click="remove(currentContextMenuNode.id)"
    />
  </context-menu>
</template>

<script setup>
import * as DeviceApi from '@/api/device.js'
import { useDeviceStore } from '@/store/modules/device'
import { DEVICE_NOTICE_TYPE } from '@/constants/index'

defineOptions({ name: 'VideoTree' })

const message = useMessage() // 消息弹窗
const useDevice = useDeviceStore()

const formLoading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const currentId = ref('')
const formRef = ref() // 表单 Ref
const list = ref([])
const formData = ref({
  categoryName: ''
})
const formRules = reactive({
  categoryName: [{ required: true, message: '设备种类名称不能为空', trigger: 'blur' }]
})
const contextmenuShow = ref(false)
const optionsComponent = reactive({
  zIndex: 999,
  minWidth: 230,
  x: 500,
  y: 200
})
const currentContextMenuNode = ref({})

const handleNodeContextmenu = (e, node, component, ...rest) => {
  console.log('🚀 ~ handleNodeContextmenu ~ node:', node)
  e.preventDefault()
  currentContextMenuNode.value = node
  contextmenuShow.value = true
  optionsComponent.x = e.x
  optionsComponent.y = e.y
}

/** 获得部门树 */
const getDeviceList = async () => {
  await useDevice.getDeviceTypeList()

  const data = useDevice.deviceTypeList ?? []

  list.value = data

  const storageNoticeType = sessionStorage.getItem(DEVICE_NOTICE_TYPE)

  if (storageNoticeType) {
    emit('change-device', undefined, { type: storageNoticeType })
  } else {
    currentId.value = data?.[0]?.id
    emit('change-device', currentId.value)
  }

  sessionStorage.removeItem(DEVICE_NOTICE_TYPE)
}

const emit = defineEmits(['change-device'])
const clickItem = (id) => {
  sessionStorage.removeItem(DEVICE_NOTICE_TYPE)
  currentId.value === id ? (currentId.value = '') : (currentId.value = id)
  emit('change-device', id)
}

const openForm = async (type, id) => {
  if (type == 'create') {
    title.value = '新增'
    formData.value.categoryName = ''
  } else {
    title.value = '编辑'
    const res = await DeviceApi.getDeviceTypeDetail(id)
    formData.value = res
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
    const res = await DeviceApi.createDeviceType(formData.value)
    if (res.code == 200) {
      message.success('新增成功')
    }
  } else {
    await DeviceApi.updateDeviceType(formData.value)
    message.success('编辑成功')
    formData.value.id = undefined
  }
  getDeviceList()
  formLoading.value = false
  dialogVisible.value = false
}

const remove = async (id) => {
  await message.delConfirm()

  await DeviceApi.deleteDeviceType(id)
  message.success('删除成功')
  getDeviceList()
}

/** 初始化 */
onMounted(async () => {
  await getDeviceList()
})
</script>

<style lang="scss" scoped>
.add-btn {
  margin-top: 20px;
  margin-bottom: 20px;
  text-align: center;
  padding: 0px 12px !important;
  color: rgba(0, 0, 0, 0.8) !important;
  font-size: var(--font-size-base) !important;
}

.custom-tree-node {
  display: flex;
  padding-right: 8px;
  font-size: 14px;
  flex: 1;
  align-items: center;
  justify-content: space-between;
}

.list {
  .item {
    display: flex;
    // margin: 8px;
    padding: 8px;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }

    .left {
      font-size: 14px;
      color: #606266;
      flex: 1;
    }

    .right {
      width: 90px;
      font-size: 14px;
    }
  }
}
.head-container{
  margin: 10px 7.5px;

}

</style>
