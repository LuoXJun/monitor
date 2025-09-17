<template>
  <div
    class="popup-container"
    :style="{ bottom: position.bottom, left: position.left, position: 'fixed' }"
    v-if="displayBool"
  >
    <div>
      <div class="head">
        <span>{{ title }}</span>
      </div>
      <div class="body">
        <el-card>
          <template #default>
            <el-table :data="tableData">
              <el-table-column prop="检测总数" label="检测总数" width="auto" />
              <el-table-column prop="未通过次数" label="未通过次数" width="auto" />
              <el-table-column prop="通过次数" label="通过次数" width="auto" />
              <el-table-column prop="正在检测次数" label="正在检测次数" width="auto" />
            </el-table>
          </template>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
const props = defineProps({
  customOptions: Array,
  position: Object,
  tableData: Array || Object,
  chatData: Array,
  displayBool: Boolean,
  pageSize: Number,
  title: String,
  siteType: String
})
const colorList = ['#FF69B4', '#696969', '#FFCE56', '#E7E9ED', '#A9CCE3', '#EDE7F6']

onMounted(() => {
  nextTick(() => {})
})
onBeforeUnmount(() => {})
</script>

<style scoped>
.popup-container {
  display: flex;
  width: 460px;
  height: 100px;
  padding: 1px;
  pointer-events: all;
  opacity: 0.8;
  flex-direction: column;
}

.head {
  background-color: #fff;
  border: 2px solid;
  border-image: linear-gradient(0deg, #5f7fe6, #e4effc) 2 2;
  border-radius: 4px;

  span {
    position: relative;
    left: 34px;

    /* font-family: YouSheBiaoTiHei; */

    /* font-weight: 400; */
    font-size: 20px;
    font-style: italic;
    color: #393d44;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  padding: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

:deep(.el-card__body) {
  height: 200px;
  padding: 10px;
  padding-top: 0;
}

:deep(th) {
  font-family: 'Source Han Sans SC VF';

  /* font-weight: 400; */

  /* font-size: 20px; */
  color: #393d44;

  /* font-style: italic; */
}

:deep(.el-table__row) {
  .cell {
    padding: 3px;
    background: rgb(232 237 250 / 80%);
  }
}

:deep(.el-divider--horizontal) {
  padding-bottom: 0;
  margin-bottom: 8px;
}

.list-box::-webkit-scrollbar {
  width: 1px;
}
</style>
