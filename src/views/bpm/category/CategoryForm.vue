<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-form-item label="分类名" prop="name">
        <el-input v-model="formData.name" maxlength="180" placeholder="请输入分类名" />
      </el-form-item>
      <el-form-item label="分类标志key" prop="code">
        <el-input v-model="formData.code" maxlength="180" placeholder="请输入分类标志key" />
      </el-form-item>
      <el-form-item label="流程业务标识" prop="bizTag">
        <el-select v-model="formData.bizTag" placeholder="请选择业务标识">
          <el-option
            v-for="item in bizTag_LIST"
            :key="item.key"
            :label="item.name"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="绑定部门" prop="deptIds">
        <el-tree-select
          multiple
          v-model="formData.deptIds"
          :data="deptList"
          :props="defaultProps"
          check-strictly
          node-key="id"
          placeholder="请选择绑定部门"
        />
      </el-form-item> -->
      <el-form-item label="分类状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分类排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          placeholder="请输入分类排序"
          class="!w-1/1"
          :precision="0"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'
import { CategoryApi, CategoryVO } from '@/api/bpm/category'
import * as DeptApi from '@/api/system/dept'
import { DEPARTMENT_BUSINESS_MAP } from '@/constants/business'

const bizTag_LIST = [
  {
    key: DEPARTMENT_BUSINESS_MAP.jc.key,
    name: DEPARTMENT_BUSINESS_MAP.jc.name
  },
  {
    key: DEPARTMENT_BUSINESS_MAP.wt.key,
    name: DEPARTMENT_BUSINESS_MAP.wt.name
  },
  {
    key: DEPARTMENT_BUSINESS_MAP.cl.key,
    name: DEPARTMENT_BUSINESS_MAP.cl.name
  }
]

/** BPM 流程分类 表单 */
defineOptions({ name: 'CategoryForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  code: undefined,
  bizTag: undefined,
  deptIds: undefined,
  status: undefined,
  sort: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '分类名不能为空', trigger: 'change' }],
  code: [{ required: true, message: '分类标志key不能为空', trigger: 'change' }],
  bizTag: [{ required: true, message: '流程业务标识不能为空', trigger: 'change' }],
  // deptIds: [{ required: true, message: '绑定部门不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '分类状态不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '分类排序不能为空', trigger: ['change','blur'] }]
})
const formRef = ref() // 表单 Ref
const deptList = ref<Tree[]>([]) // 树形结构

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await CategoryApi.getCategory(id)
      formData.value = {
        ...data,
        deptIds: data?.deptIds?.split?.(',').map((item) => +item)
      }
    } finally {
      formLoading.value = false
    }
  }

  // 加载部门树
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = {
      ...(formData.value as unknown as CategoryVO),
      // @ts-ignore
      deptIds: formData.value?.deptIds?.join?.(',')
    }

    if (formType.value === 'create') {
      await CategoryApi.createCategory(data)
      message.success(t('common.createSuccess'))
    } else {
      await CategoryApi.updateCategory(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    code: undefined,
    status: undefined,
    sort: undefined
  }
  formRef.value?.resetFields()
}
</script>
