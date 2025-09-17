<template>
  <doc-alert title="流程设计器（BPMN）" url="https://doc.iocoder.cn/bpm/model-designer-dingding/" />
  <doc-alert
    title="流程设计器（钉钉、飞书）"
    url="https://doc.iocoder.cn/bpm/model-designer-bpmn/"
  />
  <doc-alert title="选择审批人、发起人自选" url="https://doc.iocoder.cn/bpm/assignee/" />
  <doc-alert title="会签、或签、依次审批" url="https://doc.iocoder.cn/bpm/multi-instance/" />

  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="流程标识" prop="key">
        <el-input
          v-model="queryParams.key"
          placeholder="请输入流程标识"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="流程名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入流程名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="流程分类" prop="category">
        <el-select
          v-model="queryParams.category"
          placeholder="请选择流程分类"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="category in categoryList"
            :key="category.code"
            :label="category.name"
            :value="category.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button color="#2559ec" dark @click="handleQuery"
          ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button
        >
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['bpm:model:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新建流程
        </el-button>
        <el-button type="success" plain @click="openImportForm" v-hasPermi="['bpm:model:import']">
          <Icon icon="ep:upload" class="mr-5px" /> 导入流程
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :height="tableHeight"
      border
      stripe
      ref="tableRef"
      @sort-change="handleSortChange"
    >
      <el-table-column label="序号" width="70px" type="index" align="center" />
      <el-table-column label="流程标识" align="center" prop="key" width="200" sortable="custom" />
      <el-table-column label="流程名称" align="center" prop="name" width="200" sortable="custom">
        <template #default="scope">
          <el-button type="primary" link @click="handleBpmnDetail(scope.row)">
            <span>{{ scope.row.name }}</span>
          </el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column label="流程图标" align="center" prop="icon" width="100">
        <template #default="scope">
          <el-image :src="scope.row.icon" class="w-32px h-32px" />
        </template>
      </el-table-column> -->
      <el-table-column
        label="流程分类"
        align="center"
        prop="categoryName"
        width="120"
        sortable="custom"
      />
      <el-table-column label="表单信息" align="center" prop="formType" width="200">
        <template #default="scope">
          <el-button
            v-if="scope.row.formType === 10"
            type="primary"
            link
            @click="handleFormDetail(scope.row)"
          >
            <span>{{ scope.row.formName }}</span>
          </el-button>
          <el-button
            v-else-if="scope.row.formType === 20"
            type="primary"
            link
            @click="handleFormDetail(scope.row)"
          >
            <span>{{ scope.row.formCustomCreatePath }}</span>
          </el-button>
          <label v-else>暂无表单</label>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        sortable="custom"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="最新部署的流程定义" align="center">
        <el-table-column
          label="流程版本"
          align="center"
          prop="processDefinition.version"
          sortable="custom"
          width="120"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.processDefinition">
              v{{ scope.row.processDefinition.version }}
            </el-tag>
            <el-tag v-else type="warning">未部署</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="激活状态"
          align="center"
          prop="processDefinition.version"
          width="85"
        >
          <template #default="scope">
            <el-switch
              v-if="scope.row.processDefinition"
              v-model="scope.row.processDefinition.suspensionState"
              :active-value="1"
              :inactive-value="2"
              @change="handleChangeState(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="部署时间"
          align="center"
          prop="deploymentTime"
          width="180"
          sortable="custom"
        >
          <template #default="scope">
            <span v-if="scope.row.processDefinition">
              {{ formatDate(scope.row.processDefinition.deploymentTime) }}
            </span>
          </template>
        </el-table-column>
      </el-table-column>
      <!-- min-width=240 -->
      <el-table-column label="操作" align="center" min-width="160" fixed="right">
        <template #default="scope">
          <el-button
            plain
            size="small"
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:model:update']"
          >
            修改
          </el-button>
          <el-dropdown
            @command="(command) => handleCommand(command, scope.row)"
            v-hasPermi="[
              'bpm:model:update',
              'bpm:model:deploy',
              'bpm:model:query',
              'bpm:model:delete'
            ]"
          >
            <el-button type="primary" class="ml-5px pos-relative top-3px" link>更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="handleDesign" v-if="checkPermi(['bpm:model:update'])">
                  <Icon icon="ep:magic-stick" />设计
                </el-dropdown-item>
                <el-dropdown-item command="handleDeploy" v-if="checkPermi(['bpm:model:deploy'])">
                  <Icon icon="ep:position" />发布
                </el-dropdown-item>
                <el-dropdown-item
                  command="handleDefinitionList"
                  v-if="checkPermi(['bpm:model:query'])"
                >
                  <Icon icon="ep:discount" />定义
                </el-dropdown-item>
                <el-dropdown-item command="handleDelete" v-if="checkPermi(['bpm:model:delete'])">
                  <Icon icon="ep:delete" />删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <!-- <el-button
            link
            type="primary"
            @click="handleSimpleDesign(scope.row.id)"
            v-hasPermi="['bpm:model:update']"
          >
            仿钉钉设计流程
          </el-button> -->
          <!-- <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:model:update']"
          >
            修改
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleDesign(scope.row)"
            v-hasPermi="['bpm:model:update']"
          >
            设计
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleDeploy(scope.row)"
            v-hasPermi="['bpm:model:deploy']"
          >
            发布
          </el-button>
          <el-button
            link
            type="primary"
            v-hasPermi="['bpm:process-definition:query']"
            @click="handleDefinitionList(scope.row)"
          >
            定义
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['bpm:model:delete']"
          >
            删除
          </el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改流程 -->
  <ModelForm ref="formRef" @success="getList" />

  <!-- 表单弹窗：导入流程 -->
  <ModelImportForm ref="importFormRef" @success="getList" />

  <!-- 弹窗：表单详情 -->
  <Dialog title="表单详情" v-model="formDetailVisible" width="800">
    <form-create :rule="formDetailPreview.rule" :option="formDetailPreview.option" />
  </Dialog>

  <!-- 弹窗：流程模型图的预览 -->
  <Dialog title="流程图" v-model="bpmnDetailVisible" width="800">
    <MyProcessViewer
      key="designer"
      v-model="bpmnXML"
      :value="bpmnXML as any"
      v-bind="bpmnControlForm"
      :prefix="bpmnControlForm.prefix"
    />
  </Dialog>
</template>

<script lang="ts" setup>
import { checkPermi } from '@/utils/permission'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { MyProcessViewer } from '@/components/bpmnProcessDesigner/package'
import * as ModelApi from '@/api/bpm/model'
import * as FormApi from '@/api/bpm/form'
import ModelForm from './ModelForm.vue'
import ModelImportForm from '@/views/bpm/model/ModelImportForm.vue'
import { setConfAndFields2 } from '@/utils/formCreate'
import { CategoryApi } from '@/api/bpm/category'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { camelToUnderscore } from '@/utils/commonMethods'

const { tableHeight } = useTableHeight({
  extraHeight: 20
})

defineOptions({ name: 'BpmModel' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const { push } = useRouter() // 路由

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  key: undefined,
  name: undefined,
  category: undefined,
  orderAsc: undefined,
  orderColumn: undefined
})
const queryFormRef = ref() // 搜索的表单
const categoryList = ref([]) // 流程分类列表
const tableRef = ref(null)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ModelApi.getModelPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleSortChange = async (row) => {
  const prop = row.prop === 'processDefinition.version' ? 'version' : row.prop
  queryParams.orderColumn = camelToUnderscore(prop)
  if (row.order === 'ascending') {
    queryParams.orderAsc = true
  } else if (row.order === 'descending') {
    queryParams.orderAsc = false
  } else {
    queryParams.orderAsc = undefined
    queryParams.orderColumn = undefined
  }
  await getList()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 操作分发 */
const handleCommand = (command, row) => {
  switch (command) {
    case 'handleDesign':
      handleDesign(row)
      break
    case 'handleDeploy':
      handleDeploy(row)
      break
    case 'handleDefinitionList':
      handleDefinitionList(row)
      break
    case 'handleSimpleDesign':
      handleDefinitionList(row.id)
      break
    case 'handleDelete':
      handleDelete(row.id)
      break
    default:
      break
  }
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.orderAsc = undefined
  queryParams.orderColumn = undefined
  tableRef.value?.clearSort()
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 添加/修改操作 */
const importFormRef = ref()
const openImportForm = () => {
  importFormRef.value.open()
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ModelApi.deleteModel(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 更新状态操作 */
const handleChangeState = async (row) => {
  const state = row.processDefinition.suspensionState
  try {
    // 修改状态的二次确认
    const id = row.id
    const statusState = state === 1 ? '激活' : '挂起'
    const content = '是否确认' + statusState + '流程名字为"' + row.name + '"的数据项?'
    await message.confirm(content)
    // 发起修改状态
    await ModelApi.updateModelState(id, state)
    // 刷新列表
    await getList()
  } catch {
    // 取消后，进行恢复按钮
    row.processDefinition.suspensionState = state === 1 ? 2 : 1
  }
}

/** 设计流程 */
const handleDesign = (row) => {
  push({
    name: 'BpmModelEditor',
    query: {
      modelId: row.id
    }
  })
}

const handleSimpleDesign = (row) => {
  push({
    name: 'SimpleWorkflowDesignEditor',
    query: {
      modelId: row.id
    }
  })
}

/** 发布流程 */
const handleDeploy = async (row) => {
  try {
    // 删除的二次确认
    await message.confirm('是否部署该流程！！')
    // 发起部署
    await ModelApi.deployModel(row.id)
    message.success(t('部署成功'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 跳转到指定流程定义列表 */
const handleDefinitionList = (row) => {
  push({
    name: 'BpmProcessDefinition',
    query: {
      key: row.key
    }
  })
}

/** 流程表单的详情按钮操作 */
const formDetailVisible = ref(false)
const formDetailPreview = ref({
  rule: [],
  option: {}
})
const handleFormDetail = async (row) => {
  if (row.formType == 10) {
    // 设置表单
    const data = await FormApi.getForm(row.formId)
    setConfAndFields2(formDetailPreview, data.conf, data.fields)
    // 弹窗打开
    formDetailVisible.value = true
  } else {
    await push({
      path: row.formCustomCreatePath
    })
  }
}

/** 流程图的详情按钮操作 */
const bpmnDetailVisible = ref(false)
const bpmnXML = ref(null)
const bpmnControlForm = ref({
  prefix: 'flowable'
})
const handleBpmnDetail = async (row) => {
  const data = await ModelApi.getModel(row.id)
  bpmnXML.value = data.bpmnXml || ''
  bpmnDetailVisible.value = true
}

/** 初始化 */
onMounted(async () => {
  await getList()
  // 查询流程分类列表
  categoryList.value = await CategoryApi.getCategorySimpleList()
})
</script>
