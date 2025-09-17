<template>
  <el-dialog
    v-model="dialogVisible"
    title="填写内容"
    width="500"
    draggable
    @close="handleCloseEditDialog"
  >
    <el-form ref="form" :model="editForm" class="sheetConfigForm" label-width="auto">
      <el-form-item
        label="选择项"
        v-if="cellConfig.data.valueType === VALUE_TYPE_MAP.get('select').key"
      >
        <el-select v-model="editForm.cellContent" multiple placeholder="请选择" filterable>
          <el-option
            v-for="option in selectList"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="单元格内容"
        v-if="cellConfig.data.valueType === VALUE_TYPE_MAP.get('date').key"
      >
        <el-date-picker
          v-model="editForm.cellContent"
          :type="renderDateType(editForm.dateFormat)"
          placeholder="请选择"
          :value-format="renderDateValueFormat(editForm.dateFormat)"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="单元格内容"
        v-if="cellConfig.data.valueType === VALUE_TYPE_MAP.get('tree').key"
      >
        <el-tree-select
          v-model="editForm.cellContent"
          :data="treeList"
          check-strictly
          :render-after-expand="false"
          style="width: 240px"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCloseEditDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirmEdit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import {
  VALUE_TYPE_MAP,
  DATA_FORMAT_MAP,
  getDefaultCellForm,
  findFormatByValue
} from '../constants'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default() {
      return { data: {} }
    }
  },
  cellConfig: {
    type: Object,
    default() {
      return { data: getDefaultCellForm() }
    }
  },
  selectData: {
    type: Array,
    default() {
      return []
    }
  },
  treeData: {
    type: Array,
    default() {
      return []
    }
  }
})

const emit = defineEmits(['change', 'delete', 'confirm', 'cancel'])
const dialogVisible = ref(props.visible)
const editForm = reactive(props.data.data)
const cellConfig = reactive(props.cellConfig.data)
// let selectList = reactive(props.selectData)
const selectList = ref(props.selectData)
let treeList = reactive(props.treeData)

const dataSourceOptions = ref([])

watch(
  () => props.data,
  (newVal) => {
    const { data } = newVal ?? {}
    editForm.cellContent = data?.cellContent || '' || []
    editForm.dateFormat = data?.dateFormat || DATA_FORMAT_MAP.get('date_yyyyMMdd').key
    // editForm.dataSourceId = data?.dataSourceId || ''
  },
  { deep: true }
)

watch(
  () => props.visible,
  (newValue) => {
    dialogVisible.value = newValue
    if (dialogVisible.value == true) {
      if(props.cellConfig.data.valueType === VALUE_TYPE_MAP.get('select').key && editForm.cellContent.length > 0){
         editForm.cellContent = editForm.cellContent.split('、');
      }
      //newValue = false
    }
  }
)

watch(
  () => props.cellConfig,
  (newValue) => {
    cellConfig.data = newValue.data
  }
)
watch(
  () => props.selectData,
  (newValue) => {
    selectList.value = newValue
  },
  { deep: true, immediate: true }
)

watch(
  () => props.treeData,
  (newValue) => {
    treeList = newValue
  }
)

function renderDateType(format = '') {
  const [_, value] = findFormatByValue(format)
  return value?.type || 'date'
}
function renderDateValueFormat(format = '') {
  const [_, value] = findFormatByValue(format)
  return value?.format || 'YYYY-MM-DD'
}

const onFormChange = (key) => {
  emit('change', key, editForm[key], editForm)
}

function handleCloseEditDialog() {
  dialogVisible.value = false
  emit('cancel', false)
}
function handleConfirmEdit() {
  
  dialogVisible.value = false
  if(cellConfig.data.valueType === VALUE_TYPE_MAP.get('select').key){
    editForm.cellContent = editForm.cellContent.join('、')
  }
  emit('confirm', editForm, false)
}
</script>
<script>
export default {
  name: 'CellEditDialog'
}
</script>

<style scoped lang="scss">
.sheetConfigForm {
  padding: 10px;
}
</style>
