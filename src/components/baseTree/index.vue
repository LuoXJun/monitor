<template>
    <div class="base-tree">
        <div class="base-tree-title">
            <img src="@/assets/imgs/myUpdate/path.svg" />
            <span>{{ title }}</span>
        </div>
        <div class="base-tree-content">
            <el-input
                v-model="input"
                class="responsive-input"
                placeholder="请输入"
                :suffix-icon="Search"
                @input="onChange"
            />
            <div class="base-tree-tip">
                <slot name="btn-line"></slot>
            </div>
            <el-tree
                ref="treeRef"
                :data="data"
                :expand-on-click-node="false"
                :props="defaultProps"
                :filter-node-method="filterNode"
            >
                <template #default="{ node, data: val }">
                    <div class="custom-tree-node">
                        <el-input
                            v-if="node.isShow && isShowing"
                            v-model="val[defaultProps.label || 'label']"
                        />
                        <el-tooltip
                            v-else
                            effect="dark"
                            :content="val[defaultProps.label || 'label']"
                            placement="right"
                        >
                            <span @click="onNodeClick(val)">
                                {{ val[defaultProps.label || 'label'] }}
                            </span>
                        </el-tooltip>
                        <div>
                            <el-icon v-if="showEdit" @click="onEdit(node)">
                                <EditPen />
                            </el-icon>
                            <el-icon v-if="showDelete" @click="emits('onRemove', val.id)">
                                <Delete />
                            </el-icon>
                            <slot name="sub-icon"></slot>
                        </div>
                    </div>
                </template>
            </el-tree>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, EditPen, Delete } from '@element-plus/icons-vue';
const data = defineModel<any[]>({ default: [] });
const emits = defineEmits(['onNodeClick', 'onEdit', 'onRemove']);
const props = defineProps({
    title: {
        type: String,
        default: '标题'
    },
    defaultProps: {
        type: Object,
        default: () => {
            return { label: 'label' };
        }
    },
    showEdit: {
        type: Boolean,
        default: () => true
    },
    showDelete: {
        type: Boolean,
        default: true
    }
});

const input = ref();
const treeRef = ref();

const filterNode = (value: string, data: any) => {
    if (!value) return true;
    return data[props.defaultProps.label].includes(value);
};

const onChange = (val) => {
    treeRef.value && treeRef.value!.filter(val);
};

const currentLabel = ref();
// 控制当前只能有一个输入框正在输入
const isShowing = ref(false);
const onEdit = (node) => {
    if (!node.isShow && isShowing.value) return;
    node.isShow = isShowing.value = !node.isShow;

    if (node.isShow) currentLabel.value = node.label;
    if (!node.isShow && currentLabel.value !== node.label) {
        emits('onEdit', { id: node.data.id, value: node.label });
    }
};

const onNodeClick = (data) => {
    emits('onNodeClick', data);
};
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

        > span {
            font-weight: bold;
            color: #fff;
            margin-left: 10px;
        }
    }

    .base-tree-content {
        padding: 0 5px;

        > .el-input {
            margin: 10px 0;
        }

        .base-tree-tip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;

            > span {
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
                align-items: center;
                width: 100%;
                > div {
                    position: absolute;
                    right: 0;
                    background: #fff;
                    padding-left: 10px;
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
