<template>
  <Dialog v-model="dialogVisible" width="1000px" :title="dialogTitle">
    <div class="container">
      <el-form ref="formRef" inline v-loading="formLoading" :model="formData" :rules="formRules">
        <el-form-item label="表名称" prop="tableName">
          <el-input
            v-model="formData.tableName"
            placeholder="请输入"
            clearable
            @keydown.enter="handleQuery"
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button color="#2559ec" dark @click="handleQuery">
            <Icon icon="ep:search" />搜索
          </el-button>
          <el-button @click="resetQuery"> <Icon icon="ep:refresh" />重置 </el-button>
          <el-button color="#2559ec" plain @click="handleEdit(OPERATE_TYPE_MAP.create.key)">
            <Icon icon="ep:plus" />新增
          </el-button>
        </el-form-item>
      </el-form>
      <div class="wrap">
        <div class="table-wrap">
          <vxe-table
            ref="tableRef"
            border
            stripe
            show-overflow="tooltip"
            height="528"
            :loading="loading"
            :data="list"
            :checkbox-config="checkboxConfig"
            :rowConfig="{ keyField: 'id' }"
            @checkbox-all="handleSelectionAllChange"
            @checkbox-change="handleSelectionChange"
          >
            <vxe-column type="checkbox" title="" width="50" align="center" />
            <vxe-column type="seq" title="序号" width="80" align="center" show-overflow-tooltip />
            <vxe-column field="tableName" title="表名称" align="center" show-overflow-tooltip />
            <vxe-column field="tableDesc" title="表注释" align="center" show-overflow-tooltip />
            <vxe-column title="操作" width="140">
              <template #default="{ row }">
                <span class="operate-group">
                  <el-button
                    type="primary"
                    size="small"
                    plain
                    v-hasPermi="['sql:db:edit']"
                    @click="handleEdit(OPERATE_TYPE_MAP.edit.key, row.tableName)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    size="small"
                    plain
                    type="danger"
                    v-hasPermi="['sql:db:delete']"
                    @click="handleDelete(row)"
                    :disabled="row.tableType === 1"
                  >
                    删除
                  </el-button>
                </span>
              </template>
            </vxe-column>
          </vxe-table>
          <Pagination
            :total="total"
            v-model:page="formData.pageNo"
            v-model:limit="formData.pageSize"
            @pagination="getList"
          />
        </div>
        <div class="selected-wrap">
          <div class="selected-header">
            <span>已选（{{ multipleSelection.length }}）</span>
          </div>
          <div class="selected-content">
            <div class="selected-item" v-for="item in multipleSelection" :key="item.id">
              <div class="selected-item-content">
                <div class="selected-item-content-block">
                  <div class="selected-item-label">表名称：</div>
                  <div class="selected-item-content-value" :title="item.tableName">
                    {{ item.tableName }}
                  </div>
                </div>
                <div class="selected-item-content-block">
                  <div class="selected-item-label">表注释：</div>
                  <div class="selected-item-content-value" :title="item.tableDesc">
                    {{ item.tableDesc }}
                  </div>
                </div>
              </div>
              <Icon class="close-icon" icon="ep:close" @click="handleRemoveSelected(item)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
  <AddEditDataBaseModal ref="addEditDataBaseModalRef" @success="handleEditTableSuccess" />
</template>
<script setup>
import * as R from 'ramda'
import * as SqlApi from '@/api/sql'
import { addExamineTable } from '@/api/inspectionItem'
import { TZ_BASE_TABLE_NAME } from '@/components/luckysheet/constants/index'
import { getSheetsHasConfigFields } from '@/components/luckysheet/utils/util'
import AddEditDataBaseModal from '@/views/databaseManage/addEditForm.vue'
import { OPERATE_TYPE_MAP } from '@/constants/databaseManage'

defineOptions({ name: 'AddTableForm' })

const props = defineProps({
  examineId: {
    type: String,
    default() {
      return ''
    }
  },
  selectedTable: {
    type: Array,
    default() {
      return []
    }
  }
})

const checkboxConfig = reactive({
  reserve: true,
  checkRowKeys: [],
  checkMethod: ({ row }) => {
    return row.tableName !== TZ_BASE_TABLE_NAME
  }
})

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('新增业务表') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const loading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  tableName: undefined,
  pageNo: 1,
  pageSize: 20
})
const formRules = reactive({})
const formRef = ref() // 表单 Ref
const list = ref([]) // 列表
const total = ref(0) // 列表总数
const tableRef = ref()
const multipleSelection = ref([])
const existTableList = ref([])

/** 提交表单 */
const emit = defineEmits(['success', 'delete:table']) // 定义 success 事件，用于操作成功后的回调

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SqlApi.getDbPage(formData.value)
    list.value = data.list
    total.value = data.total

    // 为了刷新选中状态
    tableRef.value.reloadData(list.value)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = async () => {
  formData.value.pageNo = 1
  await getList()
}

/** 重置按钮操作 */
const resetQuery = async () => {
  // TODO: 这里会重置选中的行，具体要不要重置，看业务需求
  // resetCheckRowKeysOnResetQuery()
  formRef.value?.resetFields()
  await handleQuery()
}

const addEditDataBaseModalRef = ref(null)

const openEditTableForm = (operateType, tableName) => {
  let sheetsFields = []

  if (operateType === OPERATE_TYPE_MAP.edit.key) {
    sheetsFields = getSheetsHasConfigFields()
  }
  addEditDataBaseModalRef.value.open(operateType, tableName, sheetsFields)
}

const handleEdit = (operateType, tableName) => {
  openEditTableForm(operateType, tableName)
}

const handleDelete = async (row) => {
  console.log('🚀 ~ handleDelete ~ row:', row)
  const tableName = row.tableName

  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await SqlApi.deleteDb(tableName)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()

    existTableList.value = existTableList.value.filter((item) => item.id !== row.id)
    multipleSelection.value = multipleSelection.value.filter((item) => item.id !== row.id)
    checkboxConfig.checkRowKeys = checkboxConfig.checkRowKeys.filter((id) => id !== row.id)

    emit('delete:table', row)
  } catch {}
}

const handleEditTableSuccess = () => {
  getList()
  emit('success')
}

const handleSelectionAllChange = (val) => {
  console.log('🚀 ~ handleSelectionAllChange ~ val:', val)
  const { checked, records } = { ...val }
  if (checked) {
    records?.forEach?.((record) => {
      const { id } = record
      const isNew = !multipleSelection.value?.find?.((selected) => selected.id === id)
      if (isNew) {
        multipleSelection.value?.push?.(R.clone(record))
        checkboxConfig.checkRowKeys.push(id)
      }
    })
  } else {
    multipleSelection.value?.forEach?.((selected) => {
      const existRow = list.value?.find?.((data) => data.id === selected.id)
      if (existRow) {
        multipleSelection.value = multipleSelection.value?.filter?.(
          (selected) => selected.id !== existRow.id
        )
        checkboxConfig.checkRowKeys = checkboxConfig.checkRowKeys?.filter?.(
          (key) => key !== existRow.id
        )
      }
    })
  }
}

const handleSelectionChange = (val) => {
  const { checked, row } = { ...val }
  const { id } = row

  if (checked) {
    multipleSelection.value?.push?.(row)
    checkboxConfig.checkRowKeys.push(id)
  } else {
    multipleSelection.value = multipleSelection.value?.filter?.((selected) => selected.id !== id)
    checkboxConfig.checkRowKeys = checkboxConfig.checkRowKeys?.filter?.((_id) => _id !== id)
  }
}

const handleRemoveSelected = (selectedRow) => {
  // console.log('🚀 ~ handleRemoveSelected ~ selectedRow:', selectedRow)
  // 1. 删除 multipleSelection 中的数据
  multipleSelection.value = multipleSelection.value.filter((item) => item.id !== selectedRow.id)

  // 目前是当前页的
  const selectedRows = tableRef.value.getCheckboxRecords(false)
  const removeRow = selectedRows.find?.((row) => row.id === selectedRow.id)

  // 2. 删除 tableRef 中的选中状态
  // 2个都行，任选一个
  // removeRow && tableRef.value.setCheckboxRow(removeRow, false)
  removeRow && tableRef.value.setCheckboxRowKey(removeRow.id, false)

  // 3. 删除checkboxConfig.checkRowKeys
  checkboxConfig.checkRowKeys = checkboxConfig.checkRowKeys.filter((id) => id !== selectedRow.id)
}

/** 打开弹窗 */
const open = async (selectedTable = []) => {
  console.log('🚀 ~ open ~ selectedTable:', selectedTable)
  dialogVisible.value = true

  resetForm()

  const selectedList = selectedTable?.map?.((table) => ({
    id: table.id,
    tableName: table.value,
    tableDesc: table.label
  }))

  existTableList.value = R.clone(selectedList)
  multipleSelection.value = selectedList
  checkboxConfig.checkRowKeys = selectedList.map((item) => item.id)

  await getList()

  formLoading.value = false
}

const resetCheckRowKeysOnResetQuery = () => {
  multipleSelection.value = R.clone(existTableList.value)
  checkboxConfig.checkRowKeys = existTableList.value?.map?.((item) => item.id)
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    tableName: undefined,
    pageNo: 1,
    pageSize: 10
  }

  existTableList.value = []
  multipleSelection.value = []
  checkboxConfig.checkRowKeys = []

  formRef.value?.resetFields()
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const submitForm = async () => {
  // 校验表单
  if (!formRef) return

  const valid = await formRef.value.validate()

  if (!valid) return
  // 提交请求
  formLoading.value = true
  console.log('🚀 ~ submitForm ~ multipleSelection.value:', multipleSelection.value)

  // TODO: 暂时注释，记得打开
  try {
    const tableIds = multipleSelection.value.map((item) => item.id)
    await addExamineTable({ tableIds, examineId: props.examineId })

    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
<style lang="scss" scoped>
.container {
  height: 618px;
}

.wrap {
  display: flex;
  flex-direction: row;

  .table-wrap {
    // width: 600px;
    width: 70%;
  }

  .selected-wrap {
    padding: 10px;
    flex: 1;

    .selected-header {
      padding: 3px 0;
    }

    .selected-content {
      height: 488px;
      padding: 10px 0;
      overflow-y: auto;
      flex: 1;
    }
  }
}

.selected-item {
  display: flex;
  padding: 6px;
  margin-bottom: 10px;
  // cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background-color: #f5f5f5;
  }
}

.selected-item:hover {
  background-color: #f5f5f5;
}

.selected-item-content {
  width: 90%;
}

.selected-item-content-block {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.selected-item-label {
  width: 58px;
}

.selected-item-content-value {
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.close-icon {
  flex: 1;
  cursor: pointer;

  &:hover {
    transform: scale(1.2);
  }
}

.operate-group {
  display: flex;
  justify-content: center;
}
</style>
