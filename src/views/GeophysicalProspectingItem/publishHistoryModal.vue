<template>
  <Dialog v-model="dialogVisible" width="900px" class="publish-history-modal" title="发布历史">
    <PublishHistory :examineProjectId="examineProjectId" />
    <!-- <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template> -->
  </Dialog>
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as RoleApi from '@/api/system/role'
import * as InspectionItemApi from '@/api/inspectionItem'
import * as ModelApi from '@/api/bpm/model'
import PublishHistory from '@/views/publishHistory/index.vue'

defineOptions({ name: 'PublishHistoryModal' })

const defaultProps = {
  children: 'children',
  label: 'materialName'
}
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const examineProjectId = ref('') // 检测指标id

/** 打开弹窗 */
const open = async (id) => {
  examineProjectId.value = id
  dialogVisible.value = true
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  dialogVisible.value = false
}
</script>
<style lang="scss">
.publish-history-modal {
  height: 500px;
}
</style>
