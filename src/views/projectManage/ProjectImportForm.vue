<template>
  <Dialog v-model="dialogVisible" title="项目导入" width="500">
     <template #title>
      <div class="dialog-header">
        <span><img src="@/assets/imgs/myUpdate/pathImport.svg"/>项目导入</span>
      </div>
    </template>
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="importUrl"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx, .xls"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-left">
          <!-- <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            是否更新已经存在的用户数据
          </div> -->
          <span>仅允许导入 xls、xlsx 格式文件。</span>
          <el-link
            :underline="false"
            style="font-size: 12px; vertical-align: baseline ;float: right;color:#3F6297"
            type="primary"
            @click="handleDownloadTemplate"
          >
            下载模板
          </el-link>
          <div class="text-left">
            <div>填写规则：</div>
            <div>1. 父级项目必须在子级项目之前；</div>
            <div>2. 项目编码需唯一；</div>
          </div>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" color="#3F6297" @click="submitForm">
            <Icon icon="ep:check" class="mr-1"/>
            确 定</el-button>
          <el-button @click="dialogVisible = false">
             <Icon icon="ep:close" class="mr-1"/>
            取 消</el-button>
    </template>
  </Dialog>
  <Dialog v-model="responseDialogVisible" :fullscreen="false" title="" width="1000">
    <div class="response-content">
      <div class="response-create-success">
        <el-text class="response-title" type="success">
          导入成功的数量：<span>{{ createNames.length }}</span>
        </el-text>
        <el-table :data="createNames" stripe scrollbar-always-on height="300" style="width: 100%">
          <el-table-column show-overflow-tooltip prop="name" label="项目名称" align="center" />
        </el-table>
      </div>
      <div class="response-update-success">
        <el-text class="response-title" type="primary">
          更新成功的数量：<span>{{ updateNames.length }}</span>
        </el-text>
        <el-table :data="updateNames" stripe scrollbar-always-on height="300" style="width: 100%">
          <el-table-column show-overflow-tooltip prop="name" label="项目名称" align="center" />
        </el-table>
      </div>
      <div class="response-update-failure">
        <el-text class="response-title" type="danger">
          更新失败的数量：<span>{{ failureNames.length }}</span>
        </el-text>
        <el-table :data="failureNames" stripe scrollbar-always-on height="300" style="width: 100%">
          <el-table-column show-overflow-tooltip prop="name" label="项目名称" align="center" />
          <el-table-column show-overflow-tooltip prop="reason" label="失败原因" align="center" />
        </el-table>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="responseDialogVisible = false">确 定</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as ItemApi from '@/api/itemManage'
import { getAccessToken, getTenantId } from '@/utils/auth'
import download from '@/utils/download'

defineOptions({ name: 'ProjectImportForm' })

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const uploadRef = ref()
const importUrl =
  import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/projectInfo/import'
const uploadHeaders = ref() // 上传 Header 头
const fileList = ref([]) // 文件列表
const updateSupport = ref(0) // 是否更新已经存在的用户数据

// 响应内容弹框
const responseDialogVisible = ref(false) // 弹窗的是否展示
const createNames = ref<any[]>([]) // 创建成功的工程名字
const updateNames = ref([]) // 更新成功的工程名字
const failureNames = ref([]) // 失败的工程名字和原因

/** 打开弹窗 */
const open = () => {
  dialogVisible.value = true
  updateSupport.value = 0
  fileList.value = []
  resetForm()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const submitForm = async () => {
  if (fileList.value.length == 0) {
    message.error('请上传文件')
    return
  }
  // 提交请求
  uploadHeaders.value = {
    Authorization: 'Bearer ' + getAccessToken(),
    'tenant-id': getTenantId()
  }
  formLoading.value = true
  uploadRef.value!.submit()
}

/** 文件上传成功 */
const emits = defineEmits(['success'])
const submitFormSuccess = (response: any) => {
  if (response.code !== 0) {
    message.error(response.msg)
    formLoading.value = false
    return
  }

  responseDialogVisible.value = true

  // 拼接提示语
  const data = response.data ?? {}

  const _createNames = []
  const _updateNames = []
  const _failureNames = []
  for (let name of data.createNames) {
    // @ts-ignore
    _createNames.push({ name })
  }

  for (const name of data.updateNames) {
    // @ts-ignore
    _updateNames.push({ name })
  }

  for (const name in data.failureNames) {
    // @ts-ignore
    _failureNames.push({ name, reason: data.failureNames[name] })
  }

  createNames.value = _createNames
  updateNames.value = _updateNames
  failureNames.value = _failureNames
  formLoading.value = false
  dialogVisible.value = false

  // 发送操作成功的事件
  emits('success')
}

/** 上传错误提示 */
const submitFormError = (): void => {
  message.error('上传失败，请您重新上传！')
  formLoading.value = false
}

/** 重置表单 */
const resetForm = async (): Promise<void> => {
  // 重置上传状态和文件
  formLoading.value = false
  await nextTick()
  uploadRef.value?.clearFiles()
}

/** 文件数超出提示 */
const handleExceed = (): void => {
  message.error('最多只能上传一个文件！')
}

/** 下载模板操作 */
const handleDownloadTemplate = async () => {
  const data = await ItemApi.getImportTemplate()
  download.excel(data, '项目工程导入模板.xlsx')
}
</script>

<style lang="scss" scoped>

.response-content {
  display: flex;
 
  > div {
    flex: 1;

    &:not(:last-child) {
      margin-right: 10px;
    }
  }

  .response-update-failure {
    flex: 2;
  }

  .response-title {
    display: block;
    margin-bottom: 10px;
  }
}
</style>
