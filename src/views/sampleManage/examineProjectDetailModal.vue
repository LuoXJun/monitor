<template>
  <Dialog
    v-model="dialogVisible"
    title="指标配置"
    width="600px"
    destroy-on-close
  >
    <el-descriptions 
      v-if="examineProjectList.length > 0" 
      :column="1" 
      border
      class="custom-descriptions"
    >
      <el-descriptions-item 
        v-for="(item, index) in examineProjectList" 
        :key="index"
        label-align="center"
        align="center"
        :label="item.propertyName"
      >
        {{ item.propertyValue }} 
      </el-descriptions-item>
    </el-descriptions>
    
    <el-empty v-else description="暂无指标数据" />

    <template #footer>
      <el-button type="info" plain @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'

const dialogVisible = ref(false)
const examineProjectList = ref([])

const open = (list) => {
  const filteredList = list.filter(item => {
    const excludedNames = ['检验项目', '委托单位', '施工单位', '工程名称', '样品名称', '样品编号'];
    return !excludedNames.includes(item.propertyName) && item.isMust !== 1;
  });
  examineProjectList.value = filteredList;
  dialogVisible.value = true;
}

defineExpose({ open })
</script>
<style scoped>
.custom-descriptions {
  width: 100%;
}
.custom-descriptions :deep(.el-descriptions__label) {
  width: 200px;
  text-align: center;
}
.custom-descriptions :deep(.el-descriptions-item__cell) {
  width: 400px;
  text-align: center;
}
</style>
