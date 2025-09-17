<template>
  <div class="base-tree">
    <div class="base-tree-title">
      <img src="@/assets/imgs/myUpdate/path.svg" />
      <span>{{ title }}</span>
    </div>
    <div class="base-tree-content">
      <el-input v-model="input" class="responsive-input" placeholder="请输入" :suffix-icon="Search" />
      <div class="base-tree-tip">
        <span>请选择分享工程</span>
        <el-button>
          <el-icon>
            <Plus />
          </el-icon>
          新增</el-button>
      </div>
      <el-tree :data="data" :expand-on-click-node="false" :props="defaultProps">
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <el-input v-focus @blur="node.isShow = false" v-if="node.isShow" v-model="node.label" />
            <el-tooltip v-else effect="dark" :content="data[defaultProps.label || 'label']" placement="left">
              <span @click="onNodeClick(data)">{{ data[defaultProps.label || 'label'] }}</span>
            </el-tooltip>
            <div>
              <el-icon @click="onEdit(node)">
                <EditPen />
              </el-icon>
              <el-icon @click="() => { console.log('delete') }">
                <Delete />
              </el-icon>
            </div>
          </div>
        </template>
      </el-tree>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Plus, EditPen, Delete } from '@element-plus/icons-vue'
const data = defineModel<any[]>({ default: [] })
const emits = defineEmits(['onNodeClick'])
defineProps({
  title: {
    type: String,
    default: '标题'
  },
  defaultProps: {
    type: Object,
    default: () => {
      return { label: 'label' }
    }
  }
})

const vFocus = {
  mounted: (el) => el.focus()
}

const input = ref()
const currentData = ref()



const onEdit = (node) => {
  currentData.value = node
  node.isShow = !node.isShow;
}

const onNodeClick = (data) => {
  emits('onNodeClick', data)

}

</script>

<style lang="scss">
.base-tree {
  width: 100%;

  .base-tree-title {
    display: flex;
    align-items: center;
    height: 40px;
    background: $bgColor;
    padding-left: 20px;

    >span {
      font-weight: bold;
      color: #fff;
      margin-left: 10px;
    }
  }

  .base-tree-content {
    padding: 0 5px;

    >.el-input {
      margin: 10px 0;
    }

    .base-tree-tip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      >span {
        color: #6f6f6f;
        font-size: 14px;
      }

      .el-icon {
        margin-right: 5px;
      }

      .el-button {
        padding: 5px 6px;
        height: fit-content;
        font-size: 14px;
      }
    }

    .el-tree {
      background: transparent;

      .el-tree-node.is-current {
        .el-tree-node__content {
          background: #f2f3ff;
          color: #0052d9 !important;
        }
      }

      .custom-tree-node {
        display: flex;
        justify-content: space-between;
        width: 100%;

        >span {
          max-width: 120px;
          overflow: hidden;
        }

        .el-input {
          height: 24px;
        }

        .el-icon {
          margin-right: 10px;
        }
      }
    }
  }


}
</style>
