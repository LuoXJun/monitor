<template>
  <el-form ref="formRef" :model="sheetForm" class="sheetConfigForm" label-width="auto">
    <el-form-item label="数据来源表">
      <el-select
        :disabled="props.disabled"
        v-model="sheetForm.dependSheetIndex"
        placeholder="请选择"
        clearable
        @change="onFormChange('dependSheetIndex')"
      >
        <el-option
          v-for="option in sheetsOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
          :title="option.label"
        />
      </el-select>
    </el-form-item>
    <!-- <el-form-item label="是否允许修改">
      <el-switch
        :disabled="props.disabled"
        active-text="是"
        inactive-text="否"
        v-model="sheetForm.allowEdit"
        @change="onFormChange('allowEdit')"
      />
    </el-form-item> -->
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'
import { getDefaultSheetConfigForm } from '../constants'

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
      return getDefaultSheetConfigForm()
    }
  },
  sheetsOptions: {
    type: Array,
    default() {
      return []
    }
  }
  // sheetsOptions: {
  //   type: Object,
  //   default() {
  //     return { data: [] }
  //   }
  // }
})

const emit = defineEmits(['change'])
const sheetForm = reactive(getDefaultSheetConfigForm())
const sheetsOptions = ref(props.sheetsOptions)

watch(
  () => props.data,
  (newVal) => {
    console.log('🚀 ~ newVal:data', newVal)
    // const { data } = newVal ?? {}
    sheetForm.dependSheetIndex = newVal?.dependSheetIndex
    sheetForm.allowEdit = newVal?.allowEdit ?? true
  },
  { deep: true }
)

watch(
  () => props.sheetsOptions,
  (newVal) => {
    console.log('🚀 ~ newVal:sheetsOptions', newVal)
    sheetsOptions.value = newVal
  },
  { deep: true }
)

const onFormChange = (key) => {
  emit('change', key, sheetForm[key], sheetForm)
}
</script>
<script>
export default {
  name: 'SheetConfigForm'
}
</script>

<style scoped lang="scss">
.sheetConfigForm {
  // padding: 10px;
}
</style>
