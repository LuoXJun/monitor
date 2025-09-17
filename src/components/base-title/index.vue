<template>
  <div class="base-title">
    {{ title }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '标题'
  },
  bgColor: {
    type: String,
    default: () => "#138fb6"
  }
})

const color = props.bgColor
</script>

<style lang="scss">
.base-title {
  padding-left: 8px;
  box-sizing: border-box;
  position: relative;
  color: #131414;
  font-family: 'PingFang SC';
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  height: 48px;
  line-height: 48px;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 16px;
    width: 3px;
    border-radius: 0 2px 2px 0;
    background: v-bind(color);
  }
}
</style>
