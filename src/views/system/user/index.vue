<template>
  <el-row :gutter="20">
    <!-- 左侧部门树 -->
    <el-col :span="4" :xs="24">
      <ContentWrap>
        <DeptTree @node-click="handleDeptNodeClick" />
      </ContentWrap>
    </el-col>
    <el-col :span="20" :xs="24">
      <!-- 搜索 -->
      <ContentWrap>
        <el-form
          class="-mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="登录名" prop="username">
            <el-input
              v-model="queryParams.username"
              placeholder="请输入登录名"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input
              v-model="queryParams.mobile"
              placeholder="请输入手机号码"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="用户状态"
              clearable
              class="!w-240px"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              :default-time="defaultTimeFormat"
              v-model="queryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button color="#2559ec" dark @click="handleQuery"
              ><Icon icon="ep:search" />搜索</el-button
            >
            <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
            <el-button
              type="primary"
              plain
              @click="openForm('create')"
              v-hasPermi="['system:user:create']"
            >
              <Icon icon="ep:plus" /> 新增
            </el-button>
            <el-button
              type="warning"
              plain
              @click="handleImport"
              v-hasPermi="['system:user:import']"
            >
              <Icon icon="ep:upload" /> 导入
            </el-button>
            <el-button
              type="success"
              plain
              @click="handleExport"
              :loading="exportLoading"
              v-hasPermi="['system:user:export']"
            >
              <Icon icon="ep:download" />导出
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
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
          <el-table-column label="序号" width="60px" type="index" align="center" />
          <el-table-column
            label="登录名"
            align="center"
            prop="username"
            sortable="custom"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="用户编号" align="center" key="id" prop="id" sortable="custom" />

          <el-table-column
            label="用户昵称"
            align="center"
            prop="nickname"
            sortable="custom"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="部门"
            align="center"
            key="deptName"
            prop="deptName"
            sortable="custom"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="手机号码"
            align="center"
            prop="mobile"
            width="120"
            sortable="custom"
          />
          <el-table-column label="状态" key="status">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="0"
                :inactive-value="1"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            sortable="custom"
            :formatter="dateFormatter"
            width="180"
          />
          <el-table-column label="操作" align="center" width="160">
            <template #default="scope">
              <div class="flex items-center justify-center">
                <el-button
                  type="primary"
                  plain
                  size="small"
                  @click="openForm('update', scope.row.id)"
                  v-hasPermi="['system:user:update']"
                  >修改
                </el-button>
                <el-dropdown
                  @command="(command) => handleCommand(command, scope.row)"
                  v-hasPermi="[
                    'system:user:delete',
                    'system:user:update-password',
                    'system:permission:assign-user-role'
                  ]"
                >
                  <el-button type="primary" class="ml-5px" link> 更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        command="handleDelete"
                        v-if="checkPermi(['system:user:delete'])"
                      >
                        <Icon icon="ep:delete" />删除
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleResetPwd"
                        v-if="checkPermi(['system:user:update-password'])"
                      >
                        <Icon icon="ep:key" />重置密码
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleRole"
                        v-if="checkPermi(['system:permission:assign-user-role'])"
                      >
                        <Icon icon="ep:circle-check" />分配角色
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          :total="total"
          v-model:page="queryParams.pageNo"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </ContentWrap>
    </el-col>
  </el-row>

  <!-- 添加或修改用户对话框 -->
  <UserForm ref="formRef" @success="getList" />
  <!-- 用户导入对话框 -->
  <UserImportForm ref="importFormRef" @success="getList" />
  <!-- 分配角色 -->
  <UserAssignRoleForm ref="assignRoleFormRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import UserForm from './UserForm.vue'
import UserImportForm from './UserImportForm.vue'
import UserAssignRoleForm from './UserAssignRoleForm.vue'
import DeptTree from './DeptTree.vue'
import { validatePassword } from '@/utils/validate'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { camelToUnderscore } from '@/utils/commonMethods'

const { tableHeight } = useTableHeight({
  extraHeight: 25
})
defineOptions({ name: 'SystemUser' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: [],
  orderColumn: undefined,
  orderAsc: undefined
})
const queryFormRef = ref() // 搜索的表单
const lastClickedNode = ref('') // 上次点击的节点
const tableRef = ref(null)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserApi.getUserPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
const defaultTimeFormat = computed(() => {
  const [start, end] = ['00:00:00', '23:59:59'].map((time) => {
    const [hour, minute, second] = time.split(':').map(Number)
    return new Date(0, 0, 0, hour, minute, second)
  })
  const dateRange: [Date, Date] = [start, end]
  return dateRange
})

const handleSortChange = async (row) => {
  queryParams.orderColumn = camelToUnderscore(row.prop)
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

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.orderColumn = undefined
  queryParams.orderAsc = undefined
  tableRef.value?.clearSort()
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 处理部门被点击 */
const handleDeptNodeClick = async (row) => {
  if (lastClickedNode.value === row.id) {
    queryParams.deptId = undefined // 如果一致，重置 materialType
    lastClickedNode.value = '' // 更新上次点击的节点
  } else {
    queryParams.deptId = row.id
    lastClickedNode.value = row.id // 更新上次点击的节点
  }

  await getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 用户导入 */
const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}

/** 修改用户状态 */
const handleStatusChange = async (row: UserApi.UserVO) => {
  try {
    // 修改状态的二次确认
    const text = row.status === CommonStatusEnum.ENABLE ? '启用' : '停用'
    await message.confirm('确认要"' + text + '""' + row.username + '"用户吗?')
    // 发起修改状态
    await UserApi.updateUserStatus(row.id, row.status)
    // 刷新列表
    await getList()
  } catch {
    // 取消后，进行恢复按钮
    row.status =
      row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }
}

/** 导出按钮操作 */
const exportLoading = ref(false)
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserApi.exportUser(queryParams)
    download.excel(data, '用户数据.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 操作分发 */
const handleCommand = (command: string, row: UserApi.UserVO) => {
  switch (command) {
    case 'handleDelete':
      handleDelete(row.id)
      break
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleRole':
      handleRole(row)
      break
    default:
      break
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserApi.deleteUser(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 重置密码 */
const handleResetPwd = async (row: UserApi.UserVO) => {
  let password = ''
  let showPassword = true // 控制密码显示状态

  while (true) {
    try {
      const { value: inputPassword } = await ElMessageBox.prompt('', {
        title: '请输入"' + row.username + '"的新密码',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: password,
        inputType: showPassword ? 'text' : 'password', // 根据状态切换输入框类型
        inputPlaceholder: '请输入新密码',
        inputPattern: undefined,
        customClass: 'custom-message-box',
        message: h('div', {}, [
          h(
            'div',
            { class: 'text-orange-500 text-sm mb-10px' },
            '密码长度8-20位，必须包含数字、字母和特殊符号，且不能使用键盘序列、重复字符等'
          ),
          h('div', { class: 'flex items-center' }, [
            h('el-switch', {
              modelValue: showPassword,
              'onUpdate:modelValue': (val) => {
                showPassword = val
                // 重新打开对话框以更新输入框类型
                ElMessageBox.close()
                setTimeout(() => handleResetPwd(row), 0)
              }
            })
          ])
        ]),
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            try {
              await new Promise((resolve, reject) => {
                validatePassword(instance.inputValue, row.username, (error) => {
                  if (error) {
                    reject(error)
                  } else {
                    resolve(true)
                  }
                })
              })
              done()
            } catch (error: any) {
              ElMessage.error(error?.message)
              return false
            }
          } else {
            done()
          }
        }
      })

      if (!inputPassword) {
        return
      }

      password = inputPassword
      await UserApi.resetUserPwd(row.id, password)
      message.success('修改成功，新密码是：' + password)
      break
    } catch (error: any) {
      if (error === 'cancel') {
        return
      }
      message.error(error?.message)
      continue
    }
  }
}

/** 分配角色 */
const assignRoleFormRef = ref()
const handleRole = (row: UserApi.UserVO) => {
  assignRoleFormRef.value.open(row)
}

/** 初始化 */
onMounted(async () => {
  getList()
})
</script>
