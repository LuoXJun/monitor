<template>
  <!-- width="1150px" -->
  <Dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    align-center
    width="80vw"
    class="custom-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
    :fullscreen="false"
  >
    <div class="dialog-content">
      <!-- 审批信息 -->
      <div v-if="false">
        <template v-for="(item, index) in runningTasks" :key="index">
          <!-- v-for="(item, index) in runningTasks"
        :key="index" -->
          <el-card
            v-if="!judgeIsFillTask(item.taskDefinitionKey)"
            v-loading="processInstanceLoading"
            class="box-card"
          >
            <template #header>
              <span class="el-icon-picture-outline">审批任务【{{ item.name }}】</span>
            </template>
            <el-col :offset="6" :span="16">
              <el-form
                :ref="'form' + index"
                :model="auditForms[index]"
                :rules="auditRule"
                label-width="100px"
              >
                <el-form-item v-if="processInstance && processInstance.name" label="流程名">
                  {{ processInstance.name }}
                </el-form-item>
                <el-form-item
                  v-if="processInstance && processInstance.startUser"
                  label="流程发起人"
                >
                  {{ processInstance?.startUser.nickname }}
                  <el-tag size="small" type="info">{{
                    processInstance?.startUser.deptName
                  }}</el-tag>
                </el-form-item>
                <div v-if="runningTasks[index].formId > 0" style="transform: translateX(-26px)">
                  <form-create
                    v-model="approveForms[index].value"
                    v-model:api="approveFormFApis[index]"
                    :option="approveForms[index].option"
                    :rule="approveForms[index].rule"
                  />
                </div>
                <!-- <el-card v-if="runningTasks[index].formId > 0" class="mb-15px !-mt-10px">
                <template #header>
                  <span class="el-icon-picture-outline">
                    填写表单【{{ runningTasks[index]?.formName }}】
                  </span>
                </template>
                <form-create
                  v-model="approveForms[index].value"
                  v-model:api="approveFormFApis[index]"
                  :option="approveForms[index].option"
                  :rule="approveForms[index].rule"
                />
              </el-card> -->
                <el-form-item label="审批建议" prop="reason">
                  <el-input
                    v-model="auditForms[index].reason"
                    placeholder="请输入审批建议"
                    type="textarea"
                    maxlength="500"
                  />
                </el-form-item>

                <!-- <el-form-item label="抄送人" prop="copyUserIds">
              <el-select
                v-model="auditForms[index].copyUserIds"
                multiple
                placeholder="请选择抄送人"
              >
                <el-option
                  v-for="itemx in userOptions"
                  :key="itemx.id"
                  :label="itemx.nickname"
                  :value="itemx.id"
                />
              </el-select>
            </el-form-item> -->
              </el-form>
              <div style="margin-bottom: 20px; margin-left: 10%; font-size: 14px">
                <el-button type="success" @click="handleFillingAudit(item, true)">
                  <Icon icon="ep:select" />
                  通过
                </el-button>
                <el-button type="danger" @click="handleFillingAudit(item, false)">
                  <Icon icon="ep:close" />
                  不通过
                </el-button>
                <!-- <el-button type="primary" @click="openTaskUpdateAssigneeForm(item.id)">
              <Icon icon="ep:edit" />
              转办
            </el-button>
            <el-button type="primary" @click="handleDelegate(item)">
              <Icon icon="ep:position" />
              委派
            </el-button>
            <el-button type="primary" @click="handleSign(item)">
              <Icon icon="ep:plus" />
              加签
            </el-button>
            <el-button type="warning" @click="handleBack(item)">
              <Icon icon="ep:back" />
              回退
            </el-button> -->
              </div>
            </el-col>
          </el-card>
        </template>
      </div>

      <el-tabs v-model="activeName" @tab-click="handleTabClick" tab-position="left">
        <!-- 这个的加入，在提交审批刷新页面时，excel页会有问题。最新更新，目前excel通过设置vw宽度解决 -->
        <el-tab-pane
          v-if="showApprovePane"
          :label="PROCESS_TABS_MAP.approval.name"
          :name="PROCESS_TABS_MAP.approval.key"
        >
          <div class="card-wrap">
            <template v-for="(item, index) in runningTasks" :key="index">
              <el-card
                v-if="!judgeIsFillTask(item.taskDefinitionKey)"
                v-loading="processInstanceLoading"
                class="empty-box-card"
              >
                <template #header>
                  <span class="el-icon-picture-outline">审批任务【{{ item.name }}】</span>
                </template>
                <el-col :offset="6" :span="16">
                  <el-form
                    :ref="'form' + index"
                    :model="auditForms[index]"
                    :rules="auditRule"
                    label-width="100px"
                  >
                    <el-form-item v-if="processInstance && processInstance.name" label="流程名">
                      {{ processInstance.name }}
                    </el-form-item>
                    <el-form-item
                      v-if="processInstance && processInstance.startUser"
                      label="流程发起人"
                    >
                      {{ processInstance?.startUser.nickname }}
                      <el-tag size="small" type="info">{{
                        processInstance?.startUser.deptName
                      }}</el-tag>
                    </el-form-item>
                    <!-- <el-form-item v-if="runningTasks[index].formId > 0" label="附件">
                      <UploadFileChunk
                        v-model="approveForms[index].value"
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
                      />
                    </el-form-item> -->
                    <div v-if="runningTasks[index].formId > 0" style="transform: translateX(-26px)">
                      <form-create
                        v-model="approveForms[index].value"
                        v-model:api="approveFormFApis[index]"
                        :option="approveForms[index].option"
                        :rule="approveForms[index].rule"
                      />
                    </div>
                    <!-- <el-card v-if="runningTasks[index].formId > 0" class="mb-15px !-mt-10px">
                <template #header>
                  <span class="el-icon-picture-outline">
                    填写表单【{{ runningTasks[index]?.formName }}】
                  </span>
                </template>
                <form-create
                  v-model="approveForms[index].value"
                  v-model:api="approveFormFApis[index]"
                  :option="approveForms[index].option"
                  :rule="approveForms[index].rule"
                />
              </el-card> -->
                    <el-form-item label="审批建议" prop="reason">
                      <el-input
                        v-model="auditForms[index].reason"
                        placeholder="请输入审批建议"
                        type="textarea"
                        maxlength="500"
                      />
                    </el-form-item>

                    <!-- <el-form-item label="抄送人" prop="copyUserIds">
              <el-select
                v-model="auditForms[index].copyUserIds"
                multiple
                placeholder="请选择抄送人"
              >
                <el-option
                  v-for="itemx in userOptions"
                  :key="itemx.id"
                  :label="itemx.nickname"
                  :value="itemx.id"
                />
              </el-select>
            </el-form-item> -->
                  </el-form>
                  <div style="margin-bottom: 20px; margin-left: 10%; font-size: 14px">
                    <el-button type="success" @click="handleFillingAudit(item, true)">
                      <Icon icon="ep:select" />
                      通过
                    </el-button>
                    <el-button type="danger" @click="handleFillingAudit(item, false)">
                      <Icon icon="ep:close" />
                      不通过
                    </el-button>
                    <!-- <el-button type="primary" @click="openTaskUpdateAssigneeForm(item.id)">
              <Icon icon="ep:edit" />
              转办
            </el-button>
            <el-button type="primary" @click="handleDelegate(item)">
              <Icon icon="ep:position" />
              委派
            </el-button>
            <el-button type="primary" @click="handleSign(item)">
              <Icon icon="ep:plus" />
              加签
            </el-button>
            <el-button type="warning" @click="handleBack(item)">
              <Icon icon="ep:back" />
              回退
            </el-button> -->
                  </div>
                </el-col>
              </el-card>
            </template>
          </div>
        </el-tab-pane>
        <!-- 填报信息 -->
        <el-tab-pane label="试验信息" :name="PROCESS_TABS_MAP.detail.key" lazy>
          <div class="card-wrap">
            <el-card v-loading="processInstanceLoading" class="empty-box-card">
              <!-- 提交/暂存 -->
              <FillingView
                :processInstanceId="id"
                :sampleId="sampleId"
                :process-instance="processInstance"
                :running-tasks="runningTasks"
                :uploadKey="uploadKey"
                @success="handleFillSuccess"
              />
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="PROCESS_TABS_MAP.taskList.name" :name="PROCESS_TABS_MAP.taskList.key">
          <div class="card-wrap">
            <ProcessInstanceTaskList
              :showHeader="false"
              :loading="tasksLoad"
              :process-instance="processInstance"
              :tasks="tasks"
              @refresh="getTaskList"
            />
            <ProcessInstanceBpmnViewer
              v-if="id"
              :id="id"
              ref="bpmnViewerRef"
              :showHeader="false"
              :bpmn-xml="bpmnXml"
              :loading="processInstanceLoading"
              :process-instance="processInstance"
              :tasks="tasks"
            />
          </div>
        </el-tab-pane>
        <!-- <el-tab-pane :label="PROCESS_TABS_MAP.bpmView.name" :name="PROCESS_TABS_MAP.bpmView.key">
        <ProcessInstanceBpmnViewer
          :id="id"
          ref="bpmnViewerRef"
          :showHeader="false"
          :bpmn-xml="bpmnXml"
          :loading="processInstanceLoading"
          :process-instance="processInstance"
          :tasks="tasks"
        />
      </el-tab-pane> -->
      </el-tabs>

      <!-- <el-card v-loading="processInstanceLoading" class="box-card">
      <FillingView
        :sampleId="sampleId"
        :process-instance="processInstance"
        :running-tasks="runningTasks"
        @success="getDetail"
      />
    </el-card> -->

      <!-- TODO: 申请信息: 这里不要打开 -->
      <el-card v-if="false" v-loading="processInstanceLoading" class="box-card">
        <template #header>
          <span class="el-icon-document">申请信息【{{ processInstance.name }}】</span>
        </template>
        <!-- 情况一：流程表单 -->
        <el-col v-if="processInstance?.processDefinition?.formType === 10" :offset="6" :span="16">
          <form-create
            v-model="detailForm.value"
            v-model:api="fApi"
            :option="detailForm.option"
            :rule="detailForm.rule"
          />
        </el-col>
        <!-- 情况二：业务表单 -->
        <div v-if="processInstance?.processDefinition?.formType === 20">
          <BusinessFormComponent :id="processInstance.businessKey" />
        </div>
      </el-card>

      <div style="display: flex" v-if="false">
        <!-- 审批记录 -->
        <!-- <ProcessInstanceTaskList
        :loading="tasksLoad"
        :process-instance="processInstance"
        :tasks="tasks"
        @refresh="getTaskList"
      /> -->

        <!-- 高亮流程图 -->
        <!-- <ProcessInstanceBpmnViewer
        :id="id"
        :bpmn-xml="bpmnXml"
        :loading="processInstanceLoading"
        :process-instance="processInstance"
        :tasks="tasks"
      /> -->
      </div>

      <!-- 弹窗：转派审批人 -->
      <TaskTransferForm ref="taskTransferFormRef" @success="getDetail" />
      <!-- 弹窗：回退节点 -->
      <TaskReturnForm ref="taskReturnFormRef" @success="getDetail" />
      <!-- 弹窗：委派，将任务委派给别人处理，处理完成后，会重新回到原审批人手中-->
      <TaskDelegateForm ref="taskDelegateForm" @success="getDetail" />
      <!-- 弹窗：加签，当前任务审批人为A，向前加签选了一个C，则需要C先审批，然后再是A审批，向后加签B，A审批完，需要B再审批完，才算完成这个任务节点 -->
      <TaskSignCreateForm ref="taskSignCreateFormRef" @success="getDetail" />

      <!-- 如果有需要填写下一节点处理人则显示此框 -->
      <el-dialog width="20%" v-model="showNext" center>
        <div style="width: 100%; text-align: center">
          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
            <el-form-item label="下一节点处理人" prop="nextMen">
              <el-select v-model="formData.nextMen" placeholder="请选择" clearable filterable>
                <el-option
                  v-for="dict in userList"
                  :key="dict.id"
                  :label="dict.nickname"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showNext = false">取 消</el-button>
            <el-button type="primary" @click="handleNextMen">确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </Dialog>
</template>
<script lang="ts" setup>
// import UploadFileChunk from '@/components/UploadFile/UploadFileChunk/UploadModal.vue'
import { useUserStore } from '@/store/modules/user'
import { setConfAndFields2 } from '@/utils/formCreate'
import type { ApiAttrs } from '@form-create/element-ui/types/config'
import * as DefinitionApi from '@/api/bpm/definition'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import * as TaskApi from '@/api/bpm/task'
import * as SampleTaskApi from '@/api/task'
import ProcessInstanceBpmnViewer from './ProcessInstanceBpmnViewer.vue'
import ProcessInstanceTaskList from './ProcessInstanceTaskList.vue'
import TaskReturnForm from './dialog/TaskReturnForm.vue'
import TaskDelegateForm from './dialog/TaskDelegateForm.vue'
import TaskTransferForm from './dialog/TaskTransferForm.vue'
import TaskSignCreateForm from './dialog/TaskSignCreateForm.vue'
import { registerComponent } from '@/utils/routerHelper'
import { isEmpty } from '@/utils/is'
import * as UserApi from '@/api/system/user'
import FillingView from './FillingView.vue'
import { judgeIsFillTask } from '@/utils/sampleTask'
import { PROCESS_TABS_MAP } from '@/constants/index'
import { useLuckySheetTool } from '@/components/luckysheet/hook/useLuckySheetTool.js'
import * as SampleApi from '@/api/sample'

const { exitLuckySheet } = useLuckySheetTool()

defineOptions({ name: 'BpmProcessInstanceDetail' })

const emit = defineEmits(['success'])

const props = defineProps({
  title: {
    type: String,
    default: '任务详情'
  }
})

const { query } = useRoute() // 查询参数
const message = useMessage() // 消息弹窗
const { proxy } = getCurrentInstance() as any

const userId = useUserStore().getUser.id // 当前登录的编号

const dialogVisible = ref(false)
const dialogTitle = props.title
// 改成弹框后这里注释
// const id = query.id as unknown as string // 流程实例的编号
const id = ref('')
const sampleId = query.sampleId as unknown as string // 样品的编号

const processInstanceLoading = ref(false) // 流程实例的加载中
const processInstance = ref<any>({}) // 流程实例
const bpmnXml = ref('') // BPMN XML
const tasksLoad = ref(true) // 任务的加载中
const tasks = ref<any[]>([]) // 任务列表
// ========== 审批信息 ==========
const runningTasks = ref<any[]>([]) // 运行中的任务
const auditForms = ref<any[]>([]) // 审批任务的表单
const auditRule = reactive({
  reason: [{ required: true, message: '审批建议不能为空', trigger: 'blur' }]
})
const approveForms = ref<any[]>([]) // 审批通过时，额外的补充信息
const approveFormFApis = ref<ApiAttrs[]>([]) // approveForms 的 fAPi

const userList = ref([])
const nextMen = ref() //下一个节点处理人
// ========== 申请信息 ==========
const fApi = ref<ApiAttrs>() //
const detailForm = ref({
  rule: [],
  option: {},
  value: {}
}) // 流程实例的表单详情

const bpmnViewerRef = ref<any>(null)
const activeName = ref(PROCESS_TABS_MAP.approval.key)
const showApprovePane = ref(false)
const formRules = reactive({
  nextMen: [{ required: true, message: '下一节点处理人不能为空', trigger: 'change' }]
})
const formData = ref({
  nextMen: ''
})
const open = (_id) => {
  console.log('🚀 ~ open ~ id:', _id)
  dialogVisible.value = true
  id.value = _id

  getDetail()
  getUserList()
}

defineExpose({ open })

/** 监听 approveFormFApis，实现它对应的 form-create 初始化后，隐藏掉对应的表单提交按钮 */
watch(
  () => approveFormFApis.value,
  (value) => {
    value?.forEach((api) => {
      api.btn.show(false)
      api.resetBtn.show(false)
    })
  },
  {
    deep: true
  }
)

const handleTabClick = (tab: any) => {
  exitLuckySheet()
  if (tab?.props?.name === PROCESS_TABS_MAP.taskList.key) {
    bpmnViewerRef.value?.renderBpm?.()
  }
}

/** 处理审批通过和不通过的操作 */
const handleAudit = async (task, pass) => {
  // 1.1 获得对应表单
  const index = runningTasks.value.indexOf(task)
  const auditFormRef = proxy.$refs['form' + index][0]
  // 1.2 校验表单
  const elForm = unref(auditFormRef)
  if (!elForm) return
  const valid = await elForm.validate()
  if (!valid) return

  // 2.1 提交审批
  const data = {
    id: task.id,
    reason: auditForms.value[index].reason,
    copyUserIds: auditForms.value[index].copyUserIds
  }
  if (pass) {
    // 审批通过，并且有额外的 approveForm 表单，需要校验 + 拼接到 data 表单里提交
    const formCreateApi = approveFormFApis.value[index]
    if (formCreateApi) {
      await formCreateApi.validate()
      data.variables = approveForms.value[index].value
    }
    await TaskApi.approveTask(data)
    message.success('审批通过成功')
  } else {
    await TaskApi.rejectTask(data)
    message.success('审批不通过成功')
  }
  // 2.2 加载最新数据
  getDetail()
}

// 如果选择叻择下一节点处理人需要暂存选择的数据
const stashData = ref({})
const showNext = ref(false)

/** 处理审批通过和不通过的操作 */
const handleFillingAudit = async (task, pass) => {
  // 1.1 获得对应表单
  const index = runningTasks.value.indexOf(task)
  const auditFormRef = proxy.$refs['form' + index][0]
  // 1.2 校验表单
  const elForm = unref(auditFormRef)
  if (!elForm) return
  const valid = await elForm.validate()
  if (!valid) return

  // 2.1 提交审批
  const data = {
    id: task.id,
    reason: auditForms.value[index].reason,
    variables: {}
    // NOTE: 新的没有抄送人
    // copyUserIds: auditForms.value[index].copyUserIds
  }

  // 原来的
  if (pass) {
    console.log('🚀 ~ checkIsNeedNext ~ pass:', checkIsNeedNext())
    if (checkIsNeedNext()) {
      formData.value.nextMen = ''
      stashData.value = { itemData: data, indexData: index }
      showNext.value = true
    } else {
      // 审批通过，并且有额外的 approveForm 表单，需要校验 + 拼接到 data 表单里提交
      const formCreateApi = approveFormFApis.value[index]
      if (formCreateApi) {
        await formCreateApi.validate()
        data.variables = approveForms.value[index].value
      }
      // let field = approveForms.value[index].rule[0].field
      // data.variables[field] = approveForms.value[index].value
      // await TaskApi.approveTask(data)
      await SampleTaskApi.approveTask(data)
      message.success('审批通过成功')
      // 关闭弹框
      handleSuccess()
    }
  } else {
    const formCreateApi = approveFormFApis.value[index]
    if (formCreateApi) {
      await formCreateApi.validate()
      data.variables = approveForms.value[index].value
    }
    // await TaskApi.rejectTask(data)
    await SampleTaskApi.rejectTask(data)
    message.success('审批不通过成功')
    // 关闭弹框
    handleSuccess()
  }

  // 新改的
  // if (pass) {
  //   await SampleTaskApi.approveTask(data)
  //   message.success('审批通过成功')
  // } else {
  //   await SampleTaskApi.rejectTask(data)
  //   message.success('审批不通过成功')
  // }

  // 2.2 加载最新数据
  // getDetail()
}

//检查是否需要填写下一个处理人
const checkIsNeedNext = () => {
  // console.log('nodeUserSelectTasks.value:', nodeUserSelectTasks.value)
  let result = false
  nodeUserSelectTasks.value.forEach((item, index) => {
    // console.log('item:', item, tasks.value[0])
    // 排查当前在哪一节点
    if (item.id == tasks.value[0].taskDefinitionKey) {
      // console.log('item.id:', tasks.value[0].taskDefinitionKey)
      // console.log('index:', index, nodeUserSelectTasks.value.length-1)
      //不是最后一个值，可能需要填写下一步
      if (index !== nodeUserSelectTasks.value.length - 1) {
        if (nodeUserSelectTasks.value[index + 1].isSelectUser) {
          nextKey.value = nodeUserSelectTasks.value[index + 1].id
          result = true
        }
      }
    }
  })
  return result
}

//  下一步处理人阶段选择弹框
const handleNextMen = async () => {
  // 检验表格formRef
  const formRef = proxy.$refs['formRef']
  const elForm = unref(formRef)
  if (!elForm) return
  const valid = await elForm.validate()
  if (!valid) return
  if (formData.value.nextMen) {
    const formCreateApi = approveFormFApis.value[stashData.value.indexData]

    if (formCreateApi) {
      await formCreateApi.validate()
      stashData.value.itemData.variables = approveForms.value[stashData.value.indexData].value
      stashData.value.itemData.userVariables = { [nextKey.value]: [formData.value.nextMen] }
    } else {
      // 有点问题
      // 最后一阶段：我不知道为什么，但是他就跑通了
      stashData.value.itemData.userVariables = { [nextKey.value]: [formData.value.nextMen] }
    }
    await SampleTaskApi.approveTask(stashData.value.itemData)
    showNext.value = false
    message.success('审批通过成功')
    //TODO: 记得恢复
    handleSuccess()
  } else {
    message.error('请选择下一步处理人')
  }
}
const getUserList = async () => {
  const res = await SampleApi.getUserListNoPage()
  userList.value = res
}

/** 转派审批人 */
const taskTransferFormRef = ref()
const openTaskUpdateAssigneeForm = (id: string) => {
  taskTransferFormRef.value.open(id)
}

/** 处理审批退回的操作 */
const taskDelegateForm = ref()
const handleDelegate = async (task) => {
  taskDelegateForm.value.open(task.id)
}

/** 处理审批退回的操作 */
const taskReturnFormRef = ref()
const handleBack = async (task: any) => {
  taskReturnFormRef.value.open(task.id)
}

/** 处理审批加签的操作 */
const taskSignCreateFormRef = ref()
const handleSign = async (task: any) => {
  taskSignCreateFormRef.value.open(task.id)
}

/** 获得详情 */
const getDetail = () => {
  // 1. 获得流程实例相关
  getProcessInstance().then(() => {
    // 2. 获得流程任务列表（审批记录）
    getTaskList()
  })
}

/** 加载流程实例 */
const BusinessFormComponent = ref(null) // 异步组件
const nextKey = ref('')
const nodeUserSelectTasks = ref([])

const getProcessInstance = async () => {
  try {
    processInstanceLoading.value = true
    // 原
    // const data = await ProcessInstanceApi.getProcessInstance(id)

    // NOTE: 改成弹框后，赋值有变化
    const data = await SampleTaskApi.getTaskProcessInstance({ id: id.value })

    if (!data) {
      message.error('查询不到流程信息！')
      return
    }
    processInstance.value = data

    // 设置表单信息
    const processDefinition = data.processDefinition
    if (processDefinition.formType === 10) {
      setConfAndFields2(
        detailForm,
        processDefinition.formConf,
        processDefinition.formFields,
        data.formVariables
      )
      nextTick().then(() => {
        fApi.value?.btn.show(false)
        fApi.value?.resetBtn.show(false)
        fApi.value?.disabled(true)
      })
    } else {
      // 注意：data.processDefinition.formCustomViewPath 是组件的全路径，例如说：/crm/contract/detail/index.vue
      BusinessFormComponent.value = registerComponent(data.processDefinition.formCustomViewPath)
    }

    //TODO
    // 加载流程图
    const res = await DefinitionApi.getProcessDefinition(processDefinition.id as number)
    //  console.log('DefinitionApi.getProcessDefinition',res)
    bpmnXml.value = res?.bpmnXml
    nodeUserSelectTasks.value = res?.nodeUserSelectTasks
  } finally {
    processInstanceLoading.value = false
  }
}

/** 加载任务列表 */
const getTaskList = async () => {
  runningTasks.value = []
  auditForms.value = []
  approveForms.value = []
  approveFormFApis.value = []
  try {
    // 获得未取消的任务
    tasksLoad.value = true
    //TODO
    // 改成弹框后赋值有变化
    //默认取第一个值，此接口
    const data = await TaskApi.getTaskListByProcessInstanceId(id.value)
    console.log('checkMine______________', data[0].taskDefinitionKey)
    checkMine(data[0].taskDefinitionKey)
    tasks.value = []
    // 1.1 移除已取消的审批
    data.forEach((task) => {
      if (task.status !== 4) {
        tasks.value.push(task)
      }
    })
    // 1.2 排序，将未完成的排在前面，已完成的排在后面；
    tasks.value.sort((a, b) => {
      // 有已完成的情况，按照完成时间倒序
      if (a.endTime && b.endTime) {
        return b.endTime - a.endTime
      } else if (a.endTime) {
        return 1
      } else if (b.endTime) {
        return -1
        // 都是未完成，按照创建时间倒序
      } else {
        return b.createTime - a.createTime
      }
    })

    // 获得需要自己审批的任务
    loadRunningTask(tasks.value)
  } finally {
    tasksLoad.value = false
  }
}

/**
 * 设置 runningTasks 中的任务
 */
const loadRunningTask = (tasks) => {
  tasks.forEach((task) => {
    if (!isEmpty(task.children)) {
      loadRunningTask(task.children)
    }
    // 2.1 只有待处理才需要
    if (task.status !== 1 && task.status !== 6) {
      setTabsActive()
      return
    }
    // 2.2 自己不是处理人
    if (!task.assigneeUser || task.assigneeUser.id !== userId) {
      setTabsActive()
      return
    }
    // 2.3 添加到处理任务
    runningTasks.value.push({ ...task })
    auditForms.value.push({
      reason: '',
      copyUserIds: []
    })

    // 2.4 处理 approve 表单
    if (task.formId && task.formConf) {
      const approveForm = {}
      setConfAndFields2(approveForm, task.formConf, task.formFields, task.formVariables)
      approveForms.value.push(approveForm)
    } else {
      approveForms.value.push({}) // 占位，避免为空
    }
  })

  setTabsActive()
}

const setTabsActive = () => {
  const hasFillTask = runningTasks.value?.find?.((task) => judgeIsFillTask(task.taskDefinitionKey))
  // console.log('🚀 ~ setTabsActive ~ hasFillTask:', runningTasks.value, hasFillTask)
  if (!runningTasks.value?.length) {
    activeName.value = PROCESS_TABS_MAP.detail.key
    showApprovePane.value = false
  } else {
    if (!hasFillTask) {
      activeName.value = PROCESS_TABS_MAP.approval.key
      showApprovePane.value = true
    } else {
      activeName.value = PROCESS_TABS_MAP.detail.key
      showApprovePane.value = false
    }
  }
}

const handleFillSuccess = () => {
  handleSuccess()
}

const handleSuccess = () => {
  dialogVisible.value = false
  emit('success')
}

/** 初始化 */
const userOptions = ref<UserApi.UserVO[]>([]) // 用户列表

/**
 * 
检查是否是否是自选节点，是否需要显示"下一节点处理人"
*/
let uploadKey = ref()
const checkMine = function (key) {
  nodeUserSelectTasks.value.forEach((item, index) => {
    console.log('item.id---index', item.id, index, key)
    let indexState
    // 第一次审批时候，默认取第一个。否则取index+1,最后一个不加这个值
    if (item.id == key) {
      if (index == 0) {
        indexState = 1
      } else {
        indexState = index + 1
      }
      // 最后一个不传这个值
      if (nodeUserSelectTasks.value[indexState]) {
        uploadKey.value = nodeUserSelectTasks.value[indexState].id
      }
    }
  })
}

const handleClose = () => {
  exitLuckySheet()
}

onMounted(async () => {
  // 改成弹窗后这里就注释掉
  // getDetail()
  // 获得用户列表
  // userOptions.value = await UserApi.getSimpleUserList()
})
</script>
<style lang="scss" scoped>
.fill-audit-wrap {
  width: 60%;
  margin: 20px auto;
}

.card-wrap {
  // width: 76vw;
  // width: calc(1150px - var(--el-dialog-padding-primary) * 2 - 15px * 2 - 10px);
  // width: calc(99vw - var(--el-dialog-padding-primary) * 2 - 15px * 2 - 80px - 10px);
  width: calc(80vw - var(--el-dialog-padding-primary) * 2 - 15px * 2 - 80px - 10px);
  margin: 0 auto;
}

.dialog-content {
  height: calc(100vh - var(--el-dialog-padding-primary) * 2 - 45px);

  :deep(.el-tabs__content) {
    // height: calc(100vh - var(--el-dialog-padding-primary) * 2 - 24px - 15px * 2 - 40px);
    height: calc(100vh - var(--el-dialog-padding-primary) * 2 - 55px);
    overflow-y: auto;
  }

  :deep(.el-tabs__content)::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  :deep(.el-tabs__content)::-webkit-scrollbar-track {
    background: rgb(255 255 255 / 100%);
    border-radius: 2px;
  }

  :deep(.el-tabs__content)::-webkit-scrollbar-thumb {
    background: rgb(236 245 255 / 100%);
    border-radius: 10px;
  }

  :deep(.el-tabs__content)::-webkit-scrollbar-thumb:hover {
    background: rgb(64 158 255 / 40%);
  }

  :deep(.el-tabs__content)::-webkit-scrollbar-corner {
    background: rgb(236 245 255 / 100%);
  }
}

.empty-box-card {
  border: none !important;
  box-shadow: none !important;

  :deep(.el-card__body) {
    padding: 0 !important;
  }
}
</style>
<style lang="scss">
.custom-dialog {
  height: 100vh !important;

  .el-dialog__body {
    padding: 0 !important;
  }
}

// .el-card__body {
//   padding: 0 !important;
// }
</style>
