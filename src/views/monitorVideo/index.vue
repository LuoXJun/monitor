<template>
    <div class="monitorVideo">
        <div class="monitorVideo-left">
            <baseTree
                v-model="treeData"
                title="项目工程树"
                :defaultProps="{ label: 'name' }"
                @on-node-click="onNodeClick"
                :showEdit="false"
                :showDelete="false"
            >
                <template #btn-line></template>
                <template #sub-icon>
                    <el-icon>
                        <Delete />
                    </el-icon>
                </template>
            </baseTree>
        </div>
        <div class="monitorVideo-right">
            <div></div>
            <!-- top -->
            <!-- main -->
            <div>
                <baseTitle title="监控列表" />
                <div class="monitorVideo-list">
                    <el-card v-for="(item, index) in tableData" :key="index">
                        <video src=""></video>
                    </el-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import baseTree from '@/components/baseTree/index.vue';
import baseTitle from '@/components/base-title/index.vue';
import { Delete } from '@element-plus/icons-vue';
import { getRegionsTreeApi } from '@/api/monitor/hikvision';

const treeData = ref([
    {
        name: 123
    }
]);
const tableData = ref([1, 11, , 1, 1, 1, 1, 1]);

getRegionsTreeApi({ pageSize: 10, pageNo: 1 });

const onNodeClick = async (data) => {
    if (data.children && data.children.length > 0) return;
};
</script>

<style lang="scss">
.monitorVideo {
    height: 740px;
    display: flex;

    &-left {
        width: 250px;
        background: #fff;

        .el-tree {
            max-height: 600px;
            overflow: auto;
        }
    }

    &-right {
        flex: 1;
        margin-left: 10px;

        > div:nth-child(1) {
            background: #fff;
        }

        > div:nth-child(2) {
            background: #fff;
            margin-top: 10px;
            height: calc(100% - 10px);
            overflow: auto;
            > div {
                margin-left: 10px;
            }
            .monitorVideo-list {
                display: flex;
                flex-wrap: wrap;
                .el-card {
                    flex: 30% 0 0;
                    margin-right: 3%;
                    margin-bottom: 10px;
                }
            }
        }
    }
}
</style>
