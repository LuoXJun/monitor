<template>
  <div class="baseTag">
    <el-tag type="primary" v-if="cellForm.isBaseData">该字段仅作展示</el-tag>
  </div>
  <el-form ref="formRef" :model="cellForm" class="cellConfigForm" label-width="auto">
    <el-form-item label="扩展方向">
      <el-select
        :disabled="props.disabled"
        v-model="cellForm.cellExtend"
        placeholder="请选择"
        @change="onFormChange('cellExtend')"
      >
        <el-option
          v-for="option in extendOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    <!-- <el-form-item label="扩展至" :required="cellForm.cellExtend !== CELL_EXTEND_MAP.noExtend"> -->
    <el-form-item
      label="扩展至"
      v-if="cellForm.cellExtend !== CELL_EXTEND_MAP.noExtend"
      :required="cellForm.cellExtend !== CELL_EXTEND_MAP.noExtend"
    >
      <el-input
        :disabled="props.disabled"
        v-model="cellForm.extendRowOrColumn"
        placeholder="请输入行数，如：16"
        @input="onFormChange('extendRowOrColumn')"
      />
    </el-form-item>
    <!-- 聚合暂时默认向下，所以隐藏 -->
    <el-form-item label="聚合方式" v-if="false">
      <el-select
        :disabled="props.disabled"
        v-model="cellForm.aggregateType"
        placeholder="请选择"
        @change="onFormChange('aggregateType')"
      >
        <el-option
          v-for="option in aggregateTypeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="值类型">
      <el-select
        :disabled="props.disabled"
        v-model="cellForm.valueType"
        placeholder="请选择"
        @change="onFormChange('valueType')"
      >
        <el-option
          v-for="option in VALUE_TYPE_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="格式" v-if="cellForm.valueType === VALUE_TYPE_MAP.get('date').key">
      <el-select
        :disabled="props.disabled"
        v-model="cellForm.dateFormat"
        placeholder="请选择"
        @change="onFormChange('dateFormat')"
      >
        <el-option
          v-for="option in DATA_FORMAT_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="数据源" v-if="cellForm.valueType === VALUE_TYPE_MAP.get('select').key">
      <el-select
        :disabled="props.disabled"
        v-model="cellForm.dataSourceId"
        placeholder="请选择"
        @change="onFormChange('dataSourceId')"
      >
        <el-option
          v-for="option in dataSourceOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="数据源" v-if="cellForm.valueType === VALUE_TYPE_MAP.get('tree').key">
      <el-select
        :disabled="props.disabled"
        v-model="cellForm.dataSourceId"
        placeholder="请选择"
        @change="onFormChange('dataSourceId')"
      >
        <el-option
          v-for="option in treeDataSourceOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="是否允许修改">
      <el-switch
        :disabled="props.disabled"
        active-text="是"
        inactive-text="否"
        v-model="cellForm.allowEdit"
        @change="onFormChange('allowEdit')"
      />
    </el-form-item>
    <!-- <el-divider border-style="dashed" /> -->
    <div v-if="false">
      <div class="block-title">
        循环块
        <el-button type="primary" :disabled="props.disabled" @click="handleToggleBlockDialog"
          >添加</el-button
        >
      </div>
      <div class="block-list">
        <el-collapse v-if="sheetBlockData?.length > 0">
          <el-collapse-item v-for="(bData, index) in sheetBlockData" :key="index">
            <template #title>
              循环块{{ index + 1 }}
              <div class="block-action">
                <el-button
                  title="编辑"
                  type="primary"
                  :icon="Edit"
                  circle
                  :disabled="props.disabled"
                  size="small"
                  @click.stop="handleEditBlock(bData, index)"
                />
                <el-button
                  type="danger"
                  title="删除"
                  :icon="Delete"
                  circle
                  :disabled="props.disabled"
                  size="small"
                  @click.stop="handleDeleteBlock(bData, index)"
                />
              </div>
            </template>
            <div>
              <el-tag size="large" class="detail-tag">
                循环块范围：{{ bData.startCell }}:{{ bData.endCell }}
              </el-tag>
              <el-tag size="large" class="detail-tag">循环次数：{{ bData.loopCount }}</el-tag>
              <!-- <el-tag size="large">聚合方式：列表</el-tag> -->
            </div>
          </el-collapse-item>
        </el-collapse>
        <el-empty v-else description="暂无数据" :image-size="40" />
      </div>
      <!-- <div>
        <div v-for="(bData, index) in sheetBlockData" :key="index">
          <span>循环块{{ index + 1 }}</span>
          <span @click="handleEditBlock(bData, index)">编辑</span>
          <span @click="handleDeleteBlock(bData, index)">删除</span>
        </div>
      </div> -->
    </div>
    <!-- <el-form-item label="是否预警">
      <el-switch v-model="cellForm.warning" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
    </el-form-item> -->
  </el-form>
  <el-dialog v-model="blockDialogVisible" title="循环块" width="500" draggable>
    <el-form
      ref="blockFormRef"
      class="addLoopBlockForm"
      :rules="blockRules"
      :model="blockForm"
      label-width="auto"
    >
      <el-form-item label="起始单元格" prop="startCell" required>
        <el-input v-model="blockForm.startCell" placeholder="请输入起始单元格，例如：A1" />
      </el-form-item>
      <el-form-item label="结束单元格" prop="endCell" required>
        <el-input v-model="blockForm.endCell" placeholder="请输入结束单元格，例如：E20" />
      </el-form-item>
      <el-form-item label="循环次数" prop="loopCount" required>
        <el-input-number
          :min="1"
          v-model="blockForm.loopCount"
          placeholder="请输入循环次数"
          :style="{ width: '50%' }"
        />
      </el-form-item>
      <!-- <el-form-item label="聚合方式" prop="aggregateType" key="aggregateType">
        <el-select placeholder="聚合方式" size="small" v-model="blockForm.aggregateType">
          <el-option label="列表" value="list"></el-option>
          <el-option label="分组" value="group"></el-option>
        </el-select>
      </el-form-item> -->
    </el-form>
    <el-alert type="warning" :closable="false">
      <template #title>
        <div>
          <div>提示：为便于定位单元格坐标，请将鼠标移至弹框标题并拖动弹框。</div>
          <div>说明：</div>
          <div>起始单元格：为循环块的左上角坐标，例如：A1</div>
          <div>结束单元格：为循环块的右下角坐标，例如：E20</div>
          <div>则循环块范围为A1:E20</div>
        </div>
      </template>
    </el-alert>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeBlockDialog">取消</el-button>
        <el-button type="primary" @click="confirmAddBlock">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'
import {
  CELL_EXTEND_MAP,
  AGGREGATE_TYPE_MAP,
  VALUE_TYPE_MAP,
  VALUE_TYPE_OPTIONS,
  DATA_FORMAT_MAP,
  DATA_FORMAT_OPTIONS,
  BLOCK_AGGREGATE_TYPE_MAP,
  getDefaultCellForm,
  getDefaultBlockForm
} from '../constants'

const props = defineProps({
  disabled: {
    type: Boolean,
    default() {
      return false
    }
  },
  data: {
    type: Object,
    default() {
      return { data: getDefaultCellForm() }
    }
  },
  // blockForm: {
  //   type: Object,
  //   default() {
  //     return { data: getDefaultBlockForm() }
  //   }
  // },
  sheetBlockData: {
    type: Array,
    default() {
      return []
    }
  },
  selectDataSourceOptions: {
    type: Object,
    default() {
      return { data: [] }
    }
  },
  treeDataSourceOptions: {
    type: Object,
    default() {
      return { data: [] }
    }
  }
})

const blockFormRef = ref()
const blockRules = reactive({
  startCell: [{ required: true, message: '请输入起始单元格', trigger: 'blur' }],
  endCell: [{ required: true, message: '请输入结束单元格', trigger: 'blur' }],
  loopCount: [{ required: true, message: '请输入循环次数', trigger: 'blur' }]
})

const emit = defineEmits(['change', 'changeBlockForm', 'delete:blockForm'])
const cellForm = reactive(props.data.data)
let blockForm = reactive(getDefaultBlockForm())
let sheetBlockData = ref(props.sheetBlockData)
const dataSourceOptions = ref(props.selectDataSourceOptions.data)
const treeDataSourceOptions = ref(props.treeDataSourceOptions.data)

const extendOptions = ref([
  { label: '不扩展', value: CELL_EXTEND_MAP.noExtend },
  { label: '向下扩展', value: CELL_EXTEND_MAP.expandToDownward }
  // { label: '向右扩展', value: CELL_EXTEND_MAP.expandToRight }
])
const aggregateTypeOptions = ref([
  { label: '列表', value: AGGREGATE_TYPE_MAP.list }
  // { label: '分组', value: AGGREGATE_TYPE_MAP.group }
])
const blockDialogVisible = ref(false)

watch(
  () => props.data,
  (newVal) => {
    const { data } = newVal ?? {}
    cellForm.cellExtend = data?.cellExtend || CELL_EXTEND_MAP.noExtend
    cellForm.aggregateType = data?.aggregateType || AGGREGATE_TYPE_MAP.list
    cellForm.extendRowOrColumn = data?.extendRowOrColumn || ''
    cellForm.valueType = data?.valueType || VALUE_TYPE_MAP.get('text').key
    cellForm.dateFormat = data?.dateFormat || DATA_FORMAT_MAP.get('date_yyyyMMdd').key
    cellForm.dataSourceId = data?.dataSourceId || ''
    cellForm.allowEdit = data?.allowEdit ?? true
    cellForm.isBaseData = data?.isBaseData ?? false
  },
  { deep: true }
)

// watch(
//   () => props.blockForm,
//   (newVal) => {
//     const { data } = newVal ?? {}
//     blockForm.index = data?.index
//     blockForm.startCell = data?.startCell || ''
//     blockForm.endCell = data?.endCell || ''
//     blockForm.aggregateType = data?.aggregateType || BLOCK_AGGREGATE_TYPE_MAP.list
//     blockForm.groupProperty = data?.groupProperty || ''
//   },
//   { deep: true }
// )

watch(
  () => props.sheetBlockData,
  (newVal) => {
    sheetBlockData.value = newVal
  },
  { deep: true }
)

watch(
  () => props.selectDataSourceOptions,
  (newVal) => {
    dataSourceOptions.value = newVal.data
  },
  { deep: true }
)

watch(
  () => props.treeDataSourceOptions,
  (newVal) => {
    treeDataSourceOptions.value = newVal.data
  },
  { deep: true }
)

const onFormChange = (key) => {
  emit('change', key, cellForm[key], cellForm)
}

function handleToggleBlockDialog() {
  blockDialogVisible.value = true
}

function closeBlockDialog() {
  blockDialogVisible.value = false
  blockFormRef.value.resetFields()
  blockForm.index = null
}

function confirmAddBlock() {
  blockFormRef.value.validate((valid) => {
    if (!valid) {
      return
    }

    console.log('submit!')
    emit('changeBlockForm', blockForm)
    closeBlockDialog()
  })
}

function handleEditBlock(bData, index) {
  Object.assign(blockForm, { ...bData, index })
  blockDialogVisible.value = true
}
function handleDeleteBlock(bData, index) {
  emit('delete:blockForm', index, bData)
}
</script>
<script>
export default {
  name: 'CellConfigForm'
}
</script>

<style scoped lang="scss">
.baseTag {
  margin-bottom: 10px;
  text-align: center;
}

.cellConfigForm {
  // padding: 10px;
}

.block-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
}

.block-action {
  flex: 1;
  text-align: right;
}

.block-list {
  max-height: 500px;
  overflow-y: auto;
}

.detail-tag {
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 5px;
  font-size: 14px;
}
</style>
