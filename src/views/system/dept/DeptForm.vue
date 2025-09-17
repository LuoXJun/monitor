<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="上级企业" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="deptTree"
          :props="defaultProps"
          check-strictly
          default-expand-all
          placeholder="请选择上级企业"
          value-key="deptId"
        />
      </el-form-item>
      <el-form-item label="企业名称" prop="name">
        <el-input v-model="formData.name" maxlength="180" placeholder="请输入企业名称" />
      </el-form-item>
      <el-form-item label="企业类型" prop="deptType">
        <el-select
          multiple
          @blur="handleBlur"
          v-model="formData.deptType"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.DEPT_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关联项目" prop="projectIdList">
        <el-select
          @blur="handleBlur"
          v-model="formData.projectIdList"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="dict in projectList"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
      </el-form-item>
      <el-form-item label="负责人" prop="leaderUserId">
        <el-select v-model="formData.leaderUserId" clearable placeholder="请输入负责人" @change="val => !val && handleLeaderChange(null)">
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
            @click="handleLeaderChange(item)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" maxlength="11" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" maxlength="50" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" clearable placeholder="请选择状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import * as ItemApi from '@/api/itemManage'
import { CommonStatusEnum } from '@/utils/constants'
import { FormRules } from 'element-plus'
import { isNil } from 'ramda'

defineOptions({ name: 'SystemDeptForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const deptData = ref([])
const formData = ref({
  id: undefined,
  title: '',
  parentId: undefined,
  name: undefined,
  sort: undefined,
  leaderUserId: undefined,
  phone: undefined,
  email: undefined,
  deptType: [],
  projectIdList: undefined,
  status: CommonStatusEnum.ENABLE
})
const formRules = reactive<FormRules>({
  parentId: [{ required: true, message: '上级企业不能为空', trigger: 'change' }],
  name: [{ required: true, message: '企业名称不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '显示排序不能为空', trigger: 'change' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
  phone: [
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  deptType: [{ required: true, message: '企业类型不能为空', trigger: 'change' }]
  // projectIdList: [{ required: true, message: '关联项目不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref
const deptTree = ref() // 树形结构
const userList = ref<UserApi.UserVO[]>([]) // 用户列表
const projectList = ref()

const handleBlur = () => {
  console.log('触发了')
}
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
      const data = await DeptApi.getDept(id)
      data.deptType = data?.deptType ? (data?.deptType as any).split(',') : []
      data.projectIdList = data?.projectIdList?.[0]
      formData.value = data
    } finally {
      formLoading.value = false
    }
  }
  // 获得用户列表
  userList.value = await UserApi.getSimpleUserList()
  // 获得企业树
  await getTree()
  await getProjectList()
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  if (Array.isArray(formData.value.deptType) && formData.value.deptType.length > 0) {
    formData.value.deptType = formData.value.deptType.join(',') // 将数组转换为逗号分隔的字符串
  }

  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true

  try {
    const data = { ...(formData.value as unknown as DeptApi.DeptVO) }
    data.projectIdList = !isNil(data.projectIdList) ? [data.projectIdList] : []
    if (formType.value === 'create') {
      await DeptApi.createDept(data)
      message.success(t('common.createSuccess'))
    } else {
      await DeptApi.updateDept(data)
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
    title: '',
    parentId: undefined,
    name: undefined,
    sort: undefined,
    leaderUserId: undefined,
    phone: undefined,
    email: undefined,
    deptType: [],
    projectIdList: undefined,
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}

/** 获得企业树 */
const getTree = async () => {
  deptTree.value = []
  const data = await DeptApi.getSimpleDeptList()
  let dept: Tree = { id: 0, name: '顶级企业', children: [] }
  dept.children = handleTree(data)
  deptTree.value.push(dept)
}

/** 查询列表 */
const getProjectList = async () => {
  try {
    const data = await ItemApi.getItemList({ projectType: 0 })
    const arr = data.map((item) => {
      return {
        label: item.projectName,
        value: item.id
      }
    })
    projectList.value = arr
  } finally {
  }
}

const handleLeaderChange = (item) => {
  if (item) {
    formData.value.phone = item.mobile
    formData.value.email = item.email
  } else {
    formData.value.phone = undefined
    formData.value.email = undefined
  }
}
</script>
