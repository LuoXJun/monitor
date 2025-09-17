<template>
  <el-form
    ref="formRef"
    class="!w-900px"
    v-loading="formLoading"
    :model="formData"
    :rules="formRules"
    label-width="120px"
  >
    <el-form-item label="工程名称" prop="projectId">
      <el-tree-select
        disabled
        v-model="formData.projectId"
        :data="projectList"
        :default-expanded-keys="[0]"
        :props="defaultProps2"
        check-strictly
        style="width: 100%"
        node-key="id"
      />
    </el-form-item>
    <el-form-item label="材料类型" prop="materialId">
      <el-tree-select
        disabled
        v-model="formData.materialId"
        :data="matertiralList"
        :default-expanded-keys="[0]"
        :props="defaultProps"
        check-strictly
        node-key="id"
      />
    </el-form-item>
    <el-form-item label="物探指标" prop="examineProjectId">
      <!-- <el-select
        disabled
        v-model="formData.examineProjectId"
        placeholder="请选择"
        clearable
        @change="handleProjectChange"
      >
        <el-option
          v-for="dict in itemList"
          :key="dict.id"
          :label="dict.examineName"
          :value="dict.id"
        />
      </el-select> -->
      <el-input disabled v-model="formData.examineProjectName" placeholder="请输入" />
    </el-form-item>
    <!-- <el-form-item label="物探指标" prop="measure">
      <el-input disabled v-model="formData.measure" placeholder="请输入" />
    </el-form-item> -->
    <!-- <el-form-item label="流程模型" prop="bpmModelId">
      <el-select v-model="formData.bpmModelId" placeholder="请选择" clearable class="!w-240px">
        <el-option v-for="ite in modelList" :key="ite.id" :label="ite.name" :value="ite.id" />
      </el-select>
    </el-form-item> -->
    <el-form-item class="upload-wrap" prop="attachment" label="附件">
      <!-- v-model="attachment" -->
      <!-- @success="handleUploadSuccess"
      @remove="handleRemove" -->
      <UploadFileChunk
        disabled
        class="min-w-80px"
        v-model="formData.attachment"
        :accept="['*']"
        :limit="10"
        :file-size="30"
      />
    </el-form-item>
  </el-form>
</template>
<script setup>
import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/FileTable.vue'
// import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/UploadModal.vue'
import * as SampleApi from '@/api/sample'
import * as InspectionItemApi from '@/api/inspectionItem'
import * as ItemApi from '@/api/itemManage'
// import * as TaskApi from '@/api/task'

const defaultProps = {
  children: 'children',
  label: 'materialName'
}

const defaultProps2 = {
  children: 'children',
  label: 'projectName'
}

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const matertiralList = ref([]) // 树形结构
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const projectList = ref([])
const itemList = ref([])

const materialTypeId = ref('')
const formData = ref({
  id: undefined,
  projectId: undefined,
  examineProjectId: undefined,
  materialId: '',
  examineName: '',
  // measure: '',
  attachment: ''
})
const formRules = reactive({
  projectId: [{ required: true, message: '工程名称不能为空', trigger: 'blur' }],
  materialId: [{ required: true, message: '材料类型不能为空', trigger: 'blur' }],
  examineName: [{ required: true, message: '物探指标不能为空', trigger: 'change' }],
  // measure: [{ required: true, message: '物探指标不能为空', trigger: 'blur' }],
  attachment: [{ required: true, message: '附件不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

const wtDetail = ref({})

const props = defineProps({
  processInstanceId: {
    type: String,
    default() {
      return ''
    }
  },
  sampleId: {
    type: String,
    default() {
      return ''
    }
  },
  processInstance: {
    type: Object,
    default() {
      return {}
    }
  },
  runningTasks: {
    type: Array,
    default() {
      return []
    }
  }
})

const fetchWtFillInfo = async () => {
  const data = await SampleApi.getWtFillDetail({ processInstanceId: props.processInstanceId })
  try {
    // 确保附件数据格式正确
    if (typeof data.attachment === 'string') {
      data.attachment = JSON.parse(data.attachment)
    }
    // 如果是单个文件，转换为数组格式
    if (data.attachment && !Array.isArray(data.attachment)) {
      data.attachment = [data.attachment]
    }
    // // 确保每个文件对象都有必要的属性
    // data.attachment = (data.attachment || []).map(file => ({
    //   name: file.name || file.fileName,
    //   url: file.url,
    //   size: file.size
    // }))
  } catch (e) {
    console.error('附件数据解析失败:', e)
    data.attachment = []
  }
  formData.value = data
}

const getProjectTree = async () => {
  const data = await ItemApi.getItemList()
  projectList.value = data
}

const getTree = async () => {
  const resData = await InspectionItemApi.getMaterialTree({ businessType: 2 })
  matertiralList.value = resData
}

const fetchItemList = async (data) => {
  const res = await InspectionItemApi.getExamineProjectWtList()
  itemList.value = res

  // handleProjectChange(formData.value.examineProjectId)
}

onMounted(() => {
  fetchWtFillInfo()
  getProjectTree()
  getTree()
  fetchItemList()
})
</script>
<style lang="scss" scoped></style>
