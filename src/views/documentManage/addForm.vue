<template>
  <Dialog v-model="dialogVisible" width="684px" height="300px"  :fullscreen="false">
     <template #title>
      <div class="dialog-header">
        <span><img src="@/assets/imgs/myUpdate/path2svg.svg"/>{{dialogTitle}}</span>
      </div>
    </template>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="custom-form"
    >
      <el-form-item label="工程名称" prop="projectId">
        <el-tree-select
          v-model="formData.projectId"
          :disabled="!!codeId"
          :data="projectList"
          :default-expanded-keys="[0]"
          :props="defaultProps"
          check-strictly
          node-key="id"
        />
      </el-form-item>

      <el-form-item label="上传附件" prop="fileUrl">
        <UploadFileChunk
          class="min-w-80px"
          v-model="formData.fileUrl"
          :accept="[
            'doc',
            'docx',
            'xls',
            'xlsx',
            'ppt',
            'pptx',
            'txt',
            'pdf',
            'jpg',
            'jpeg',
            'png',
            'gif',
            'zip',
            'rar'
          ]"
          :limit="5"
          @success="handleUploadSuccess"
          @remove="handleRemove"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="custom-footer">
          <el-button :disabled="formLoading" color="#3F6297" @click="submitForm">
            <Icon icon="ep:document-add" class="mr-1"/>
            保 存</el-button>
          <el-button @click="dialogVisible = false">
             <Icon icon="ep:close" class="mr-1"/>
            取 消</el-button>
      </div>
      
    </template>
  </Dialog>
</template>
<script setup>
import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/UploadModal.vue'
import * as ItemApi from '@/api/itemManage'
import * as DocumentApi from '@/api/document'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改

const formData = ref({
  id: undefined,
  projectId: '',
  fileUrl: [],
  fileList: []
})

const codeId = ref('')
const fileList = ref([])
const fileName = ref([]) //获取上传的文件名
const projectList = ref([])
const formRules = reactive({
  projectId: [{ required: true, message: '单位名称不能为空', trigger: 'change' }],
  fileUrl: [{ required: true, message: '附件不能为空', trigger: 'change' }]
})
const defaultProps = {
  children: 'children',
  label: 'projectName'
}
const formRef = ref() // 表单 Ref
const getTree = async () => {
  const data = await ItemApi.getItemList()
  projectList.value = data
}

const handleUploadSuccess = (data) => {
  // fileList.value.push(data)
  // // 手动触发表单验证
  formRef.value?.validateField('fileUrl')
}

const handleRemove = (index) => {
  // fileList.value.splice(index, 1)
  // console.log(fileList.value);
}

/** 打开弹窗 */
const open = async (type, code, id) => {
  await getTree()
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  console.log(code)
  codeId.value = code
  formType.value = type
  resetForm()
  formData.value.projectId = code
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await DocumentApi.getProjectFileDetail(id)
    } finally {
      formLoading.value = false
    }
  }
}

/** 重置表单 */
const resetForm = () => {
  fileList.value = [] //当上传成功后重新赋值，否则为undefined
  formData.value = {
    id: undefined,
    projectId: '',
    fileUrl: [],
    fileList: []
  }
  formRef.value?.resetFields()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  formData.value.fileUrl.forEach((item) => {
    formData.value.fileList.push({
      fileOriginName: item.originFileName ?? item.name,
      fileUrl: item.url
    })
  })

  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  formData.value.fileUrl = undefined
  try {
    if (formType.value === 'create') {
      await DocumentApi.createProjectFile(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await DocumentApi.updateProjectFile(formData.value)
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
<style lang="scss" scoped>

::v-deep .el-dialog{
  border-radius: 40px !important;
}
// .dialog-header {
//   width: 100%;
//   height: 45px;
//   display: flex;
//   align-items: center;
//   color: white;
//   padding: 0 16px; /* 左右填充 */
//   padding-right: 24px;
  
//   box-sizing: border-box; /* 确保填充不增加总宽度 */
//   border-top-left-radius: 4px;
//   border-top-right-radius: 4px;
//   font-size: 16px;
//   text-indent: 2.5em;
//   background:#2b4a7c url('@/assets/imgs/myUpdate/path2svg.svg') no-repeat  6% 55%;
// }
.custom-form{
  margin: 20px 0px 0px 0px;
}
.custom-footer{
  margin-right: 20px;
}

 
 
// .dialog-header .el-icon {
//   margin-right: 8px;
// }
</style>
