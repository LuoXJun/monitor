<!--
 * @Author: Lihongjian binj1219@163.com
 * @Date: 2024-12-03 10:46:41
 * @LastEditors: Lihongjian binj1219@163.com
 * @LastEditTime: 2024-12-05 17:21:02
 * @FilePath: \web-geyizhene:\workspace\抽蓄课题项目\BD-ui\src\views\deviceManage\verificationHistory.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <Dialog v-model="dialogVisible" title="检定历史">
    <el-table v-loading="loading" :data="list">
      <el-table-column
        label="检定时间"
        align="center"
        prop="examineDate"
        width="150px"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="检定记录"
        :show-overflow-tooltip="true"
        align="center"
        key="id"
        prop="attachment"
      >
        <template #default="scope">

          <div v-for="(item, index) in JSON.parse(scope.row.attachment)" :key="index">
            <span style="margin-right: 10px">{{ item?.name || item?.originFileName }}</span>
            <el-button @click="downloadFile(item)" type="primary" link> 下载 </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="120px">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <el-button link type="danger" @click="handleDelete(scope.row.id)"> 删除 </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as DeviceApi from '@/api/device.js'
import download from '@/utils/download'
defineOptions({ name: 'SystemRoleForm' })
const list = ref([])
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const loading = ref(false)
const { t } = useI18n() // 国际化
const queryParams = reactive({
  equipmentId: undefined
})
/** 打开弹窗 */
const open = async (id) => {
  dialogVisible.value = true
  queryParams.equipmentId = id
  getList()

  // 修改时，设置数据
}

const getList = async () => {
  const res = await DeviceApi.getExamineHistoryPage(queryParams)
  list.value = res
}
const handleDelete = async (id) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await DeviceApi.deleteExamineHistory(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

const downloadFile = async (file) => {
  const fileName = (file.name || file.originFileName) ?? ''
  const lastDotIndex = fileName.lastIndexOf('.')
  const fileExtension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : ''
  if (fileExtension === 'txt') {
    const response = await fetch(file.url)
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName // 设置下载文件的名称
    link.click()
    window.URL.revokeObjectURL(link.href) // 释放内存
    return
  }
  window.open(file.url)
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
