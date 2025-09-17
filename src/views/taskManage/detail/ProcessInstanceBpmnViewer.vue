<template>
  <el-card v-loading="loading" class="box-card">
    <template #header v-if="showHeader">
      <span class="el-icon-picture-outline">流程图</span>
    </template>
    <MyProcessViewer
      ref="processViewer"
      key="designer"
      class="custom-process-designer"
      :activityData="activityList"
      :prefix="bpmnControlForm.prefix"
      :processInstanceData="processInstance"
      :taskData="tasks"
      :value="bpmnXml"
      v-bind="bpmnControlForm"
    />
  </el-card>
</template>
<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import { MyProcessViewer } from '@/components/bpmnProcessDesigner/package'
import * as ActivityApi from '@/api/bpm/activity'

defineOptions({ name: 'BpmProcessInstanceBpmnViewer' })

const props = defineProps({
  showHeader: propTypes.bool.def(true), // 是否展示title
  loading: propTypes.bool, // 是否加载中
  id: propTypes.string, // 流程实例的编号
  processInstance: propTypes.any, // 流程实例的信息
  tasks: propTypes.array, // 流程任务的数组
  bpmnXml: propTypes.string // BPMN XML
})

const bpmnControlForm = ref({
  prefix: 'flowable'
})
const activityList = ref([]) // 任务列表
const processViewer = ref<any>(null)

/** 只有 loading 完成时，才去加载流程列表 */
watch(
  () => props.loading,
  async (value) => {
    if (!value && props.id) {
      activityList.value = await ActivityApi.getActivityList({
        processInstanceId: props.id
      })
    }
  }
)

const renderBpm = () => {
  processViewer.value.renderBpm()
}

defineExpose({ renderBpm })
</script>
<style>
.box-card {
  width: 100%;
  margin-bottom: 20px;
  border: none !important;
  box-shadow: none !important;

  :deep(.el-card__body) {
    padding: 0 !important;
  }
}

.custom-process-designer {
  height: 370px !important;
}
</style>
