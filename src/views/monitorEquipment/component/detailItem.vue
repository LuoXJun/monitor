<template>
  <div class="detail-item">
    <div>
      <baseTitle :title="title" bgColor="rgb(0, 82, 217)" />
      <el-switch v-model="value1" />
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import baseTitle from '@/components/base-title/index.vue'
const value1 = ref(true)

defineProps(['title'])

</script>

<style lang="scss">
.detail-item {

  >div:first-child {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    >div {

      padding-right: 20px;
    }
  }

  >div:nth-child(2) {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    font-size: 14px;
    color: #000000b4;
  }
}
</style>
