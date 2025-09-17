<template>
  <div class="base-drawer">
    <el-drawer v-model="dialogVisible" :close-on-click-modal="false" :title="title">
      <div class="base-drawer-header">
        <p>{{ title }}</p>
        <el-icon style="cursor: pointer;" @click="onCancel">
          <Close />
        </el-icon>
      </div>
      <div class="base-drawer-content">
        <slot></slot>
      </div>
      <div class="base-drawer-footer">
        <slot name="footer">
          <el-button style="background: #e5e7eb" @click="dialogVisible = false">
            取消
          </el-button>
          <el-button class="confirmBtn" @click="onSave">保存</el-button>
        </slot>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
const dialogVisible = defineModel({ default: false });

const emits = defineEmits(['onConfirm', 'onCancel']);

const props = defineProps({
  title: {
    type: String,
    default: () => '标题'
  },
  width: {
    type: String,
    default: () => '1228px'
  }
});

const onCancel = () => {
  dialogVisible.value = false;
  emits('onCancel');
};

const onSave = () => {
  emits('onConfirm');
};
</script>

<style lang="scss">
.base-drawer {
  .el-overlay {
    background-color: rgba(0, 0, 0, 0.4);

    .el-drawer {
      box-sizing: border-box;
      overflow: hidden;
      width: v-bind('props.width') !important;

      .el-drawer__header {
        display: none;
      }

      .el-drawer__body {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0;
      }
    }
  }

  .base-drawer-header {
    background: rgb(45, 77, 126);
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    box-sizing: border-box;

    color: #fff;

    font-family: 'PingFang SC';
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: 26px;

    /* 144.444% */
    >img {
      cursor: pointer;
    }
  }

  .base-drawer-content {
    height: calc(100% - 128px);
    border-bottom: 1px solid #e5e7eb;
    padding: 16px;
    box-sizing: border-box;
  }

  .base-drawer-footer {
    height: 32px;
    padding: 24px 32px;
    width: 100%;
    text-align: right;
    box-sizing: border-box;
  }
}
</style>
