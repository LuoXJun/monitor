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
                        <video :src="item.videoUrl" controls autoplay muted></video>
                    </el-card>
                </div>
                <basePagination
                    v-if="tableData.length > 0"
                    style="margin-right: 14px"
                    v-model="pageInfo"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import baseTree from '@/components/baseTree/index.vue';
import baseTitle from '@/components/base-title/index.vue';
import { Delete } from '@element-plus/icons-vue';
import {
    getRegionsTreeApi,
    getCamerasPage2RegionApi,
    getVideoUrlApi
} from '@/api/monitor/hikvision';
import basePagination from '@/components/base-pagination/base-pagination.vue';

const treeData = ref([]);
const tableData = ref<any[]>([]);

getRegionsTreeApi({}).then((data) => {
    treeData.value = data || [];
});

const pageInfo = ref({
    pageSize: 9,
    pageNo: 1,
    total: 0
});

const onNodeClick = async (data) => {
    console.log(data);

    if (data.indexCode) {
        const res = await getCamerasPage2RegionApi(
            { pageSize: pageInfo.value.pageSize, pageNo: pageInfo.value.pageNo },
            data.indexCode
        );

        if (res) {
            pageInfo.value.total = res.total;
            tableData.value = [...res.list];

            tableData.value.forEach((v) => {
                getVideoUrlApi(v.cameraIndexCode, 1).then((data) => {
                    v.videoUrl = data.url;
                });
            });
        }

        if (res) tableData.value = res.list || [];
    }
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
