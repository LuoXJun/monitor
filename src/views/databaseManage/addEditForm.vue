<template>
  <Dialog
    v-model="dialogVisible"
    width="1300px"
    :title="dialogTitle"
    align-center
    class="custom-add-edit-form"
  >
    <template #title>
      <div class="dialog-header">
        <span
          ><img v-if="dialogTitle === '新增'" src="@/assets/imgs/myUpdate/path2svg.svg" />
          <img v-else-if="dialogTitle === '编辑'" src="@/assets/imgs/myUpdate/editPath.svg" />
          <img v-else src="@/assets/imgs/myUpdate/detailPath.svg" />
          {{ dialogTitle }}</span
        >
      </div>
    </template>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="表名称" prop="tableName">
            <!-- :disabled="formType !== 'create'" -->
            <el-input
              :disabled="judgeIsDisabled(formType)"
              v-model="formData.tableName"
              placeholder="请输入"
              maxlength="180"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="表注释" prop="tableDesc">
            <!-- :disabled="formType !== 'create'" -->
            <el-input
              :disabled="judgeIsDisabled(formType)"
              v-model="formData.tableDesc"
              placeholder="请输入"
              maxlength="180"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="formType !== 'view'">
        <el-col :span="12">
          <el-form-item label="历史表" prop="historyTableName">
            <el-select
              @change="handleTableChange"
              v-model="historyTableName"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="dict in tableList"
                :key="dict.tableName"
                :label="dict.tableDesc"
                :value="dict.tableName"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="选择继承字段" prop="historyField">
            <el-select
              multiple
              @change="handleFieldName"
              :disabled="formType === 'view'"
              v-model="historyField"
              placeholder="请选择"
            >
              <el-option
                v-for="dict in remarkList"
                :key="dict.fieldName"
                :label="dict.fieldRemark"
                :value="dict.fieldName"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="字段信息" prop="tableFields">
        <div class="table-container">
          <div class="table-header">
            <table class="el-table header-table">
              <thead>
                <tr class="dflex">
                  <th
                    v-if="formType !== 'view'"
                    class="el-table__cell is-center"
                    style="width: 50px"
                  ></th>
                  <th class="el-table__cell is-center flex1">字段注释</th>
                  <th class="el-table__cell is-center flex1">字段名称</th>
                  <th class="el-table__cell is-center flex1">字段类型</th>
                  <th class="el-table__cell is-center flex1">长度</th>
                  <th class="el-table__cell is-center flex1">是否允许为空</th>
                  <th class="el-table__cell is-center" style="width: 180px">数据分类</th>
                  <!-- <th class="el-table__cell is-center " style="width: 180px;">计算公式</th> -->

                  <!-- <th class="el-table__cell is-center" v-if="formData.tableType === 1">必选字段</th> -->
                </tr>
              </thead>
            </table>
          </div>
          <div class="table-body">
            <table class="el-table">
              <draggable
                v-model="formData.tableFields"
                :disabled="formType === 'view'"
                item-key="fieldName"
                tag="tbody"
                :component-data="{
                  type: 'transition-group',
                  name: !drag ? 'flip-list' : null
                }"
                v-bind="dragOptions"
                @start="drag = true"
                @end="drag = false"
              >
                <template #item="{ element: row, index: $index }">
                  <div v-if="row.displayMark != 3">
                    <tr
                      v-show="!(formType !== 'view' && row.isCommonField === 1)"
                      :class="{ 'sortable-drag': true }"
                      class="dflex"
                      :key="row.fieldName"
                      :ref="
                        (el) => {
                          if (row.isNewInEdit) newRowRef = el
                        }
                      "
                    >
                      <td
                        v-if="formType !== 'view'"
                        class="el-table__cell is-center"
                        style="width: 50px"
                      >
                        <div
                          v-if="row.isCommonField !== 1 && formType !== 'view'"
                          @click="deleteRow($index, row.fieldName)"
                          :class="['add reduce', { 'is-disabled': row.cannotDel }]"
                          >-</div
                        >
                        <div v-else></div>
                      </td>
                      <td class="el-table__cell is-center flex1">
                        <el-input
                          :ref="
                            (el) => {
                              if (el) inputRefs[`${row.id}_fieldRemark`] = el
                            }
                          "
                          :disabled="row.isCommonField === 1 || formType === 'view'"
                          placeholder="请输入"
                          maxlength="180"
                          v-model="row.fieldRemark"
                          @input="(e) => handleFieldRemark(e, row, $index)"
                        />
                      </td>
                      <td class="el-table__cell is-center flex1">
                        <el-input
                          :ref="
                            (el) => {
                              if (el) inputRefs[`${row.id}_fieldName`] = el
                            }
                          "
                          @change="(val) => handleBlurName(val, $index, row.id)"
                          :disabled="judgeIsDisabled(formType, row)"
                          placeholder="请输入"
                          maxlength="180"
                          v-model="row.fieldName"
                        />
                      </td>
                      <td class="el-table__cell is-center flex1">
                        <el-select
                          :disabled="judgeIsDisabled(formType, row)"
                          v-model="row.fieldType"
                          placeholder="请选择"
                          clearable
                        >
                          <el-option
                            v-for="dict in fieldTypeOptions"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                          >
                            <span class="field-type-label">
                              <span>{{ dict.label }}</span>
                              <span
                                class="select-tip"
                                v-if="dict.value?.toLocaleLowerCase() === 'longtext'"
                              >
                                <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  content="该字段类型用于插入图片"
                                  placement="right"
                                >
                                  <Icon icon="ep:warning" />
                                </el-tooltip>
                              </span>
                            </span>
                          </el-option>
                        </el-select>
                      </td>
                      <td class="el-table__cell is-center flex1">
                        <el-input-number
                          :disabled="judgeIsDisabled(formType, row)"
                          v-model="row.maxLength"
                          :max="99"
                        />
                      </td>
                      <td class="el-table__cell is-center flex1">
                        <el-radio-group
                          :disabled="judgeIsDisabled(formType, row)"
                          v-model="row.enableNull"
                        >
                          <el-radio :value="0">否</el-radio>
                          <el-radio :value="1">是</el-radio>
                        </el-radio-group>
                      </td>
                      <td class="el-table__cell is-center" style="width: 174px">
                        <el-select v-model="row.displayMark" placeholder="请选择">
                          <el-option
                            v-for="dict in displayMaskOptions"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                        /></el-select>
                      </td>
                    </tr>
                  </div>
                  <div v-else>
                    <el-popover
                      placement="bottom-start"
                      :offset="40"
                      :visible="calculationFormulaVisible[$index].calculationFormula"
                      :teleported="false"
                      popper-class="popper_class"
                    >
                      <template #reference>
                        <tr
                          v-show="!(formType !== 'view' && row.isCommonField === 1)"
                          :class="{ 'sortable-drag': true }"
                          class="dflex"
                          :key="row.fieldName"
                          @click="calculationFormulaVisible[$index].calculationFormula = !calculationFormulaVisible[$index].calculationFormula"
                          :ref="
                            (el) => {
                              if (row.isNewInEdit) newRowRef = el
                            }
                          "
                        >
                          <td
                            v-if="formType !== 'view'"
                            class="el-table__cell is-center"
                            style="width: 50px"
                          >
                            <div
                              v-if="row.isCommonField !== 1 && formType !== 'view'"
                              @click="deleteRow($index, row.fieldName)"
                              :class="['add reduce', { 'is-disabled': row.cannotDel }]"
                              >-</div
                            >
                            <div v-else></div>
                          </td>
                          <td class="el-table__cell is-center flex1">
                            <el-input
                              :ref="
                                (el) => {
                                  if (el) inputRefs[`${row.id}_fieldRemark`] = el
                                }
                              "
                              :disabled="row.isCommonField === 1 || formType === 'view'"
                              placeholder="请输入"
                              maxlength="180"
                              v-model="row.fieldRemark"
                              @input="(e) => handleFieldRemark(e, row, $index)"
                            />
                          </td>
                          <td class="el-table__cell is-center flex1">
                            <el-input
                              :ref="
                                (el) => {
                                  if (el) inputRefs[`${row.id}_fieldName`] = el
                                }
                              "
                              @change="(val) => handleBlurName(val, $index, row.id)"
                              :disabled="judgeIsDisabled(formType, row)"
                              placeholder="请输入"
                              maxlength="180"
                              v-model="row.fieldName"
                            />
                          </td>
                          <td class="el-table__cell is-center flex1">
                            <el-select
                              :disabled="judgeIsDisabled(formType, row)"
                              v-model="row.fieldType"
                              placeholder="请选择"
                              clearable
                            >
                              <el-option
                                v-for="dict in fieldTypeOptions"
                                :key="dict.value"
                                :label="dict.label"
                                :value="dict.value"
                              >
                                <span class="field-type-label">
                                  <span>{{ dict.label }}</span>
                                  <span
                                    class="select-tip"
                                    v-if="dict.value?.toLocaleLowerCase() === 'longtext'"
                                  >
                                    <el-tooltip
                                      class="box-item"
                                      effect="dark"
                                      content="该字段类型用于插入图片"
                                      placement="right"
                                    >
                                      <Icon icon="ep:warning" />
                                    </el-tooltip>
                                  </span>
                                </span>
                              </el-option>
                            </el-select>
                          </td>
                          <td class="el-table__cell is-center flex1">
                            <el-input-number
                              :disabled="judgeIsDisabled(formType, row)"
                              v-model="row.maxLength"
                              :max="99"
                            />
                          </td>
                          <td class="el-table__cell is-center flex1">
                            <el-radio-group
                              :disabled="judgeIsDisabled(formType, row)"
                              v-model="row.enableNull"
                            >
                              <el-radio :value="0">否</el-radio>
                              <el-radio :value="1">是</el-radio>
                            </el-radio-group>
                          </td>
                          <td class="el-table__cell is-center" style="width: 174px">
                            <el-select v-model="row.displayMark" placeholder="请选择">
                              <el-option
                                v-for="dict in displayMaskOptions"
                                :key="dict.value"
                                :label="dict.label"
                                :value="dict.value"
                            /></el-select>
                          </td>
                        </tr>
                      </template>
                      <div class="pr-20px py-10px overflow-auto mb-20px">
                        <div>计算公式：<el-input v-model="row.formula" @blur="formulaVariables(row)" /></div>
                        <div
                          >公式字段：<el-select v-model="row.variables" multiple placeholder="请选择">
                            <el-option
                              v-for="dict in formData.tableFields"
                              :key="dict.fieldName"
                              :label="dict.fieldRemark"
                              :value="dict.fieldName" /></el-select
                        ></div>
                        <div>计算精度：<el-input v-model="row.decimal" /></div>
                      </div>
                    </el-popover>
                  </div>
                </template>
              </draggable>
            </table>
          </div>
        </div>
        <!-- 在表格下方添加按钮 -->
        <div v-if="formType !== 'view'" class="w-full flex justify-center mt-4">
          <el-button @click="add" class="w-full" color="#3F6297" plain size="large">
            <Icon icon="ep:plus" /> 添加
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <template v-if="formType !== 'view'" #footer>
      <el-button :disabled="formLoading" color="#3F6297" @click="submitForm">
        <Icon icon="ep:document-add" class="mr-1" />
        保 存
      </el-button>
      <el-button @click="dialogVisible = false">
        <Icon icon="ep:close" class="mr-1" />
        取 消
      </el-button>
    </template>
  </Dialog>
</template>
<script setup>
import * as R from 'ramda'
import { defineComponent } from 'vue'
import draggable from 'vuedraggable'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as RoleApi from '@/api/system/role'
import * as SqlApi from '@/api/sql'
import { OPERATE_TYPE_MAP } from '@/constants/databaseManage'
import { formatDBPrevCnKeyName } from '@/utils/formatter'
import { usehasPermi } from '@/hooks/web/usehasPermi'
import { generateUUID } from '@/utils'

const compareByIsCommonField = (a, b) => {
  if (a.isCommonField === b.isCommonField) {
    return 0
  }
  return a.isCommonField === 1 ? 1 : -1
}

const { checkHasPermi } = usehasPermi()

// 添加拖拽相关的响应式变量
const drag = ref(false)
const dragOptions = computed(() => {
  return {
    animation: 200,
    group: 'description',
    disabled: formType.value === 'view',
    ghostClass: 'ghost'
  }
})
const inputRefs = ref([])

const calculationFormulaVisible = ref([])

const displayMaskOptions = ref([
  {
    label: '普通',
    value: 0
  },
  {
    label: '自填',
    value: 1
  },
  {
    label: '设备',
    value: 2
  },
  {
    label: '计算',
    value: 3
  }
])

/**
 * 判断是否编辑
 * @param row
 * @param formType
 */
const judgeIsDisabled = (formType, row) => {
  if (row?.isCommonField === 1) {
    return true
  }

  if (formType === OPERATE_TYPE_MAP.view.key) {
    return true
  }

  if (formType === OPERATE_TYPE_MAP.create.key) {
    return false
  }

  if (formType === OPERATE_TYPE_MAP.edit.key) {
    if (row?.isNewInEdit) {
      return false
    } else {
      return true
    }
  }

  return true
}

defineOptions({ name: 'SystemRoleForm' })

const list = ref([]) // 列表的数
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const tableList = ref([])
const remarkList = ref([])
const formData = ref({
  tableName: '',
  tableDesc: '',
  tableFields: []
})

const historyField = ref([])
const historyTableName = ref('')
const nextData = ref([]) // 分页的下一页数据
const formRules = reactive({
  tableName: [{ required: true, message: '表名称不能为空', trigger: ['blur', 'change'] }],
  tableDesc: [{ required: true, message: '表注释不能为空', trigger: 'blur' }],
  tableFields: [{ required: true, message: '字段信息不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const fieldTypeOptions = ref([]) // 字段类型
const sheetsHasConfigFields = ref([]) // 表格中已经配置的字段

const fetchFieldTypeOptions = async () => {
  fieldTypeOptions.value = getStrDictOptions(DICT_TYPE.FIELD_TYPE)
}

const getTableList = async () => {
  const data = await SqlApi.getDbList()
  tableList.value = data
}
/** 打开弹窗 */
const open = async (type, tableName, propSheetsHasConfigFields = []) => {
  dialogVisible.value = true
  getTableList()
  resetForm()
  fetchFieldTypeOptions()

  dialogTitle.value = t('action.' + type)
  formType.value = type
  sheetsHasConfigFields.value = propSheetsHasConfigFields
  // 修改时，设置数据
  if (tableName) {
    formLoading.value = true
    try {
      // formData.value = await SqlApi.getFieldDetail({ tableName: tableName })
      const _formData = await SqlApi.getFieldDetail({ tableName: tableName })
      const sortedArray = R.sort(compareByIsCommonField, _formData.tableFields ?? [])
      _formData.tableFields = sortedArray.map((item) => {
        const id = generateUUID()
        return { ...item, id}
      })
      calculationFormulaVisible.value = sortedArray.map((item) => {
        return { calculationFormula:false}
      })
      formData.value = _formData
      // 统计获取到的数据中 isCommonField == 1 的字段数量
      commonFieldLength.value =
        formData.value.tableFields.filter((field) => field.isCommonField === 1).length || 0
    } finally {
      formLoading.value = false
    }
  } else {
    getCommon()
  }
}

//打开\关闭弹窗
const formulavisible = (row, index) => {
  console.log(row,index);
  
}

//填写完公式自动绑定公式字段
const formulaVariables = (row)=>{
  const regex = /[a-zA-Z]+[a-zA-Z0-9]*/g
  row.variables = row.formula.match(regex)
}

// 添加 ref 用于存储新插入的行元素
const newRowRef = ref(null)
const add = () => {
  const fieldType_varchar =
    fieldTypeOptions.value.find((item) => (item.value ?? '')?.toLocaleLowerCase() === 'varchar')
      ?.value ?? ''
  const insertIndex = formData.value.tableFields.length - commonFieldLength.value || 0
  const id = generateUUID()
  formData.value.tableFields.splice(insertIndex, 0, {
    id,
    fieldName: '',
    fieldRemark: '',
    fieldType: fieldType_varchar,
    maxLength: undefined,
    enableNull: 1,
    isMust: 0,
    displayMark: 0,
    isNewInEdit: true
  })

  // inputRefs.value.push({ id, insertIndex: insertIndex })

  // 等待 DOM 更新后滚动到新行
  nextTick(() => {
    if (newRowRef.value) {
      newRowRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

const deleteRow = async (index, fieldName) => {
  // 设置当前行的删除状态
  formData.value.tableFields[index].cannotDel = true
  try {
    if (fieldName) {
      await SqlApi.delFieldCheck({
        tableName: formData.value.tableName,
        fieldName: fieldName
      })
    }

    const hasUseInCurrentWorkbook = sheetsHasConfigFields.value.find(
      (item) => item.variableName === fieldName && item.tableName === formData.value.tableName
    )
    if (hasUseInCurrentWorkbook) {
      const msg = `字段: ${formData.value.tableName}.\${${fieldName}} 已被使用, 请先删除相关数据,否则不允许删除！`
      message.error(msg)
      throw Error(msg)
    }

    formData.value.tableFields.splice(index, 1)
    let index1 = historyField.value.findIndex((item) => item === fieldName)
    if (index1 !== -1) {
      historyField.value.splice(index1, 1)
    }
  } catch (error) {
    console.log('🚀 ~ deleteRow ~ error:', error)

    formData.value.tableFields[index].cannotDel = true
  }
}

const handleTableChange = (data) => {
  historyField.value = []
  nextData.value = []
  tableList.value.forEach((item) => {
    if (item.tableName === data) {
      remarkList.value = JSON.parse(item.tableColumns)
    }
  })
}

const handleFieldName = (data) => {
  const combinedArray = data.concat(nextData.value)
  const differentItems = combinedArray.filter((item) => {
    return !data.includes(item) || !nextData.value.includes(item)
  })
  if (nextData.value.length > data.length) {
    let index = formData.value.tableFields.findIndex(
      (item2) => item2.fieldName === differentItems[0]
    )

    formData.value.tableFields.splice(index, 1)
    nextData.value = data
  } else {
    remarkList.value.forEach((item) => {
      if (differentItems[0] === item.fieldName) {
        let index = formData.value.tableFields.findIndex(
          (item2) => item2.fieldName === differentItems[0]
        )
        if (index === -1) {
          formData.value.tableFields.unshift(item)
          nextData.value = data
        } else {
          message.warning('字段已存在')
          historyField.value = nextData.value
        }
      }
    })
  }
}

const judgeFieldIsUse = (row) => {
  const { fieldName } = row ?? {}
  const hasUseInCurrentWorkbook = sheetsHasConfigFields.value.find(
    (item) => item.variableName === fieldName && item.tableName === formData.value.tableName
  )

  return hasUseInCurrentWorkbook
}

const handleFieldRemark = (e, row, index) => {
  const { fieldRemark, fieldName } = row ?? {}
  if (formType.value === OPERATE_TYPE_MAP.view.key) {
    return
  }

  // 检查字段注释是否重复
  let tableList = [...formData.value.tableFields]
  tableList.splice(index, 1)
  const isDuplicate = tableList.some((item) => item.fieldRemark === fieldRemark)
  if (isDuplicate) {
    message.warning('字段注释已存在')
    // formData.value.tableFields[index].fieldRemark = ''
    return
  }

  // 编辑不联动
  if (formType.value === OPERATE_TYPE_MAP.edit.key && !row.isNewInEdit) {
    return
  }

  if (!(PinyinHelper && PinyinFormat)) {
    return
  }

  const prevFieldName = formData.value.tableFields?.[index]?.fieldName
  const newFieldRemark = formatDBPrevCnKeyName(fieldRemark)
  let newFieldName = PinyinHelper.convertToPinyinString(
    newFieldRemark,
    '',
    PinyinFormat.WITHOUT_TONE
  )

  const length = (prevFieldName?.length ?? 0) + (newFieldName?.length ?? 0)
  if (length > 15) {
    newFieldName = PinyinHelper.convertToPinyinString(newFieldRemark, '', PinyinFormat.FIRST_LETTER)
  }

  formData.value.tableFields[index].fieldName = newFieldName

  const id = row.id

  id && focusOnElementRef(`${id}_fieldRemark`)
  handleBlurName(newFieldName, index)
}

const handleBlurName = (value, index, id) => {
  let tableList = [...formData.value.tableFields]
  tableList.splice(index, 1)
  tableList.forEach((item) => {
    if (item.fieldName === value) {
      message.warning('字段已存在')
      formData.value.tableFields[index].fieldName = ''
    }
  })

  id && focusOnElementRef(`${id}_fieldName`)
}

const focusOnElementRef = (elementRef) => {
  const interval = setInterval(() => {
    const target = inputRefs.value[elementRef]
    if (inputRefs.value[elementRef]) {
      inputRefs.value[elementRef].focus()
    }
    clearInterval(interval)
  }, 50)
}

const commonFieldLength = ref(0)
const getCommon = async () => {
  const res = await SqlApi.getCommonField()
  formData.value.tableFields = res
  commonFieldLength.value = res.length || 0
}

/** 重置表单 */
const resetForm = () => {
  historyField.value = []
  nextData.value = []
  historyTableName.value = ''
  formData.value = {
    tableName: '',
    tableDesc: '',
    tableFields: []
  }
  sheetsHasConfigFields.value = []
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

  // 检查字段注释是否重复
  const fieldRemarks = formData.value.tableFields.map((field) => field.fieldRemark)
  const duplicateRemark = fieldRemarks.find(
    (remark, index) => fieldRemarks.indexOf(remark) !== index
  )
  if (duplicateRemark) {
    return message.warning(`字段注释"${duplicateRemark}"重复，请修改`)
  }

  // 检查必选字段是否填写完整
  for (let i = 0; i < formData.value.tableFields.length; i++) {
    const field = formData.value.tableFields[i]
    if (field.isMust && !field.fieldName) {
      return message.warning(`必选字段的第${i + 1}行字段名称不能为空`)
    }
    if (field.isMust && !field.fieldRemark) {
      return message.warning(`必选字段的第${i + 1}行字段注释不能为空`)
    }
  }

  for (let i = 0; i < formData.value.tableFields.length; i++) {
    if (formData.value.tableFields[i].fieldName === '') {
      return message.warning(`第${i + 1}行字段名称不能为空`)
    }
    if (formData.value.tableFields[i].fieldRemark === '') {
      return message.warning(`第${i + 1}行字段注释不能为空`)
    }
    if (formData.value.tableFields[i].fieldType === '') {
      return message.warning(`第${i + 1}行字段数据类型不能为空`)
    }
  }

  // 提交请求

  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await SqlApi.createDb(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await SqlApi.updateDb(formData.value)
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
.custom-add-edit-form {
  height: auto;
  min-height: 100vh;
}

.add {
  width: 25px;
  height: 25px;
  font-size: 16px;
  line-height: 25px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  background-color: #409eff;
  border-radius: 50%;
}

.reduce {
  background-color: red;
}

.field-type-label {
  display: flex;
  align-items: center;
}

.select-tip {
  display: flex;
  align-items: center;
  margin-left: 5px;
}

.sortable-drag {
  cursor: move;
  background: var(--el-fill-color-lighter);

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.ghost {
  background: var(--el-color-primary-light-9);
  opacity: 0.5;
}

.flip-list-move {
  transition: transform 0.5s;
}

.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.table-container {
  position: relative;
  width: 100%;
  height: 60vh; // 确保不会超过60vh

  .table-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--el-bg-color);
  }

  .table-body {
    height: calc(100% - 48px);
    overflow-y: auto;

    .el-table {
      display: table;
      width: 100%;
    }
  }

  .header-table {
    width: 100%;
    margin-bottom: 0;
    border-collapse: separate;
    border-spacing: 0;
  }

  .el-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;

    th,
    td {
      padding: 12px;
      border: 1px solid var(--el-border-color-lighter);
    }

    th {
      font-weight: bold;
      background-color: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color);
    }
  }
}

.table-body::-webkit-scrollbar {
  width: 6px;
}

.table-body::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-darker);
  border-radius: 3px;
}

.table-body::-webkit-scrollbar-track {
  background-color: var(--el-border-color-light);
}

.custom-form {
  margin: 20px 0px 0px 0px;
}

.custom-footer {
  margin-right: 20px;
}
</style>
<style lang="scss">
.popper_class {
  top: 10px !important;
  left: 0 !important;
  // position: absolute  !important;
  // height: 560px !important;
  position: relative !important;
  //display: block !important;
  background-color: #f2f6fc !important;
  box-shadow: none !important;
  margin-bottom: 20px !important;
  width: 100% !important;
  // .el-popper__arrow {
  //   top: 60px !important;
  //   left: -4px !important;
  // }

  // .el-popper__arrow::before {
  //   width: 14px;
  //   height: 14px;
  //   background-color: #f2f6fc !important;
  // }
}
</style>
