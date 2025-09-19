<template>
    <div class="monitorData-dataView">
        <div class="monitorData-dataView-left">
            <baseTree
                v-model="treeData"
                title="项目工程树"
                :defaultProps="{ label: 'name' }"
                @on-node-click="onNodeClick"
                :showEdit="false"
                :showDelete="false"
            >
                <template #btn-line></template>
            </baseTree>
        </div>
        <div class="monitorData-dataView-right">
            <div></div>
            <!-- top -->
            <!-- main -->
            <div v-if="currentData.eqId">
                <baseTitle v-if="currentData.currentTitle" :title="currentData.currentTitle" />
                <el-tabs v-model="activeName" class="demo-tabs">
                    <el-tab-pane label="基本信息" name="baseInfo">
                        <multInfo
                            v-if="currentData.multiple"
                            :data="currentData.eqData || []"
                            :title="currentData.tableTitle"
                        />
                        <singleInfo
                            v-else
                            :data="currentData.eqData || {}"
                            :title="currentData.tableTitle"
                        />
                    </el-tab-pane>
                    <el-tab-pane label="数据内容" name="data">
                        <tableList
                            :id="currentData.eqId"
                            :multiple="currentData.multiple"
                            :title="currentData.tableTitle"
                        />
                    </el-tab-pane>
                    <el-tab-pane label="曲线图" name="map">
                        <baselineChart
                            :multiple="currentData.multiple"
                            :id="currentData.eqId"
                            :width="1400"
                            :height="570"
                            :title="currentData.tableTitle"
                        />
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import baseTree from '@/components/baseTree/index.vue';
import baseTitle from '@/components/base-title/index.vue';
import multInfo from '@/views/monitorEquipment/sheets/multInfo.vue';
import singleInfo from '@/views/monitorEquipment/sheets/singleInfo.vue';
import tableList from '@/views/monitorEquipment/sheets/tableList.vue';
import baselineChart from './component/baselineChart.vue';
import { getCategoryTreeApi, getDetailApi } from '@/api/monitor/monitorInstrument';
import { getEigenvalueDataListApi } from '@/api/monitor/instrumentData';
const activeName = ref('baseInfo');

const currentData = reactive<Record<string, any>>({
    currentTitle: '',
    eqData: '',
    tableTitle: '',
    multiple: true,
    eqId: ''
});

const treeData = ref([]);

getCategoryTreeApi({ hasInstrument: true }).then((data) => {
    if (data) treeData.value = data;
});

getEigenvalueDataListApi({
    partId: '1bef0336f68473ab0713d40090369f7a',
    startTime: '2025-01-01 00:00:00'
});
const onNodeClick = async (data) => {
    if (data.children && data.children.length > 0) return;

    if (data.id) {
        const loading = ElLoading.service({
            lock: true,
            text: 'Loading',
            background: 'rgba(0, 0, 0, 0.7)'
        });
        try {
            const res = await getDetailApi({ id: data.id });
            if (!res) return;
            currentData.currentTitle = res.instrumentNo;
            currentData.multiple = res.multiple;
            currentData.eqId = res.id;
            currentData.tableTitle = res.instrumentType.name;
            if (currentData.multiple) {
                currentData.eqData = res.children || [];
            } else {
                currentData.eqData = res || {};
            }
        } finally {
            loading.close();
        }
    }
};
</script>

<style lang="scss">
.monitorData-dataView {
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

            .el-form {
                height: 100%;
                line-height: 60px;

                .el-form-item {
                    margin: 0;
                }
            }

            .el-row {
                align-items: center;
            }
        }

        > div:nth-child(2) {
            background: #fff;
            margin-top: 10px;
            height: calc(100% - 10px);
            overflow: auto;
        }

        > div {
            padding: 0 10px;
        }
    }
}
</style>
