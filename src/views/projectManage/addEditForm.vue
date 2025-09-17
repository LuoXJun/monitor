<template>
  <Dialog width="850px" v-model="dialogVisible" :title="dialogTitle">
     <template #title>
      <div class="dialog-header">
        <span><img v-if="dialogTitle === '新增'" src="@/assets/imgs/myUpdate/path2svg.svg"/>
              <img v-else-if="dialogTitle === '编辑'" src="@/assets/imgs/myUpdate/editPath.svg"/>
               <img v-else src="@/assets/imgs/myUpdate/detailPath.svg"/>
          {{dialogTitle}}</span>
      </div>
    </template>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-form-item v-if="formType === 'initiate'" label="上级工程/部位名称" prop="parentId">
        <!-- <el-input :disabled="true" v-model="formData.parentId" placeholder="请输入" /> -->
        <el-tree-select
          v-model="formData.parentId"
          :disabled="true"
          :data="treeList"
          :default-expanded-keys="[0]"
          :props="defaultProps"
          @node-click="handleNode"
          check-strictly
          node-key="id"
        />
      </el-form-item>
      <el-form-item label="工程/部位名称" prop="projectName">
        <el-input v-model="formData.projectName" maxlength="180" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="类别" prop="projectCategory">
        <el-select v-model="formData.projectCategory" placeholder="请选择" clearable>
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.PROJECT_CATEGORY)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="编码" prop="projectCode">
        <el-input v-model="formData.projectCode"  maxlength="40" placeholder="请输入" />
      </el-form-item>
      <!-- <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="请选择"
          class="!w-1/1"
        />
      </el-form-item> -->

      <el-form-item label="上传BIM模型" prop="bimModel">
        <UploadFileChunk
            class="min-w-80px"
            v-model="formData.bimModel"
            :accept="['glb', 'gltf']"
            :limit="1"
            @success="handleUploadSuccess"
            @error="handleUploadError"
          />
      </el-form-item>
    </el-form>
    <template #footer>
       <el-button :disabled="formLoading" color="#3F6297" @click="submitForm">
            <Icon icon="ep:document-add" class="mr-1"/>
            保 存</el-button>
          <el-button @click="dialogVisible = false">
             <Icon icon="ep:close" class="mr-1"/>
            取 消</el-button>
            
    </template>
  </Dialog>
</template>
<script setup>
import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/UploadModal.vue'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import * as ItemApi from '@/api/itemManage'
// import * as MaterialApi from '@/api/material'
import * as PostApi from '@/api/system/post'

defineOptions({ name: 'SystemRoleForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const treeList = ref([])
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  projectName: '',
  projectCategory: '',
  projectCode: '',
  parentId: '',
  // startDate: '',
  bimModel: undefined,
  id: ''
})
const fileList = ref([])
const formRules = reactive({
  projectName: [{ required: true, message: '工程名称不能为空', trigger: 'change' }],
  projectCategory: [{ required: true, message: '工程类别不能为空', trigger: 'change' }],
  projectCode: [{ required: true, message: '编码不能为空', trigger: 'change' }],
  parentId: [{ required: true, message: '上级工程不能为空', trigger: 'change' }]
  // startDate: [{ required: true, message: '开始日期不能为空', trigger: 'blur' }]
  // bimModel: [{ required: true, message: 'BIM模型不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

const handleUploadSuccess = (data) => {
  // fileList.value.push(data)
}

const handleRemove = (index) => {
  // fileList.value.splice(index, 1)
}

/** 打开弹窗 */
const open = async (type, id) => {
  dialogVisible.value = true
  resetForm()
  dialogTitle.value = t('action.' + type)
  getItemList()
  if (type === 'initiate') {
    formData.value.parentId = id
    // formData.value.id=id
  }
  if (type === 'create') {
    formData.value.parentId = 0
  }

  formType.value = type

  // 修改时，设置数据
  if (type === 'edit') {
    formLoading.value = true
    try {
      formData.value = await ItemApi.getItemDetail(id)
      formData.value.bimModel = JSON.parse(formData.value.bimModel || '[]')
    } finally {
      formLoading.value = false
    }
  }
}

const getItemList = async () => {
  const res = await ItemApi.getItemList()
  treeList.value = res
}
const defaultProps = {
  children: 'children',
  label: 'projectName'
}

/** 重置表单 */
const resetForm = () => {
  // fileList.value = []
  formData.value = {
    projectName: '',
    projectCategory: '',
    projectCode: '',
    parentId: '',
    // startDate: '',
    bimModel: undefined
  }
  formRef.value?.resetFields()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  const payload = { ...formData.value }
  payload.bimModel = JSON.stringify(formData.value.bimModel)

  try {
    if (formType.value === 'create' || formType.value === 'initiate') {
      await ItemApi.createItem(payload)
      message.success(t('common.createSuccess'))
    } else {
      await ItemApi.updateItem(payload)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
