<template>
    <div class="base-dialog">
        <el-dialog
            :draggable="true"
            v-model="dialogVisible"
            :close-on-click-modal="false"
            :title="title"
            :style="{ height, width }"
        >
            <div class="base-dialog-header">
                <p>
                    <el-icon>
                        <InfoFilled />
                    </el-icon>
                    {{ title }}
                </p>
                <el-icon style="cursor: pointer" @click="onCancel">
                    <Close />
                </el-icon>
            </div>
            <div class="base-dialog-content">
                <slot></slot>
            </div>
            <div class="base-dialog-footer">
                <slot name="footer">
                    <el-button style="background: #e5e7eb" @click="dialogVisible = false">
                        取消
                    </el-button>
                    <el-button class="confirmBtn" @click="onSave">保存</el-button>
                </slot>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { InfoFilled, Close } from '@element-plus/icons-vue';
const dialogVisible = defineModel({ default: false });

const emits = defineEmits(['onConfirm', 'onCancel']);

defineProps({
    title: {
        type: String,
        default: () => '标题'
    },
    width: {
        type: String,
        default: () => '1104px'
    },
    height: {
        type: String,
        default: () => '650px'
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
.base-dialog {
    .el-overlay {
        background-color: rgba(0, 0, 0, 0.4);

        .el-dialog {
            padding: 0;
            margin: 0;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-sizing: border-box;
            border-radius: 8px;
            overflow: hidden;

            .el-dialog__header {
                display: none;
            }

            .el-dialog__body {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
        }
    }

    .base-dialog-header {
        height: 48px;
        background: rgb(45, 77, 126);
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

        > p {
            display: flex;
            align-items: center;
            font-size: 14px;

            > .el-icon {
                margin-right: 6px;
            }
        }

        /* 144.444% */
        > img {
            cursor: pointer;
        }
    }

    .base-dialog-content {
        height: calc(100% - 128px);
        padding: 40px 32px;
        box-sizing: border-box;
        overflow: auto;
    }

    .base-dialog-footer {
        height: 32px;
        padding: 24px 32px;
        width: 100%;
        text-align: right;
        box-sizing: border-box;
        border-top: 1px solid #e5e7eb;
    }
}
</style>
