<template>
    <div class="data-statistics">
        <div class="data-statistics-left">
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
        <div class="data-statistics-right">
            <!-- top -->
            <div style="padding: 15px 10px">
                <baseForm v-model="form" :formItemList="formConfig">
                    <template #footer>
                        <div style="display: flex; align-items: center">
                            <el-button class="confirmBtn" @click="getData">
                                <el-icon><Search /></el-icon>
                                &nbsp; 查询
                            </el-button>
                            <el-button class="cancelBtn" @click="form = {}">
                                <el-icon><RefreshRight /></el-icon>
                                &nbsp; 重置
                            </el-button>
                        </div>
                    </template>
                </baseForm>
            </div>
            <!-- main -->
            <div v-if="currentData.id" v-loading="loading">
                <div style="display: flex; align-items: center; justify-content: space-between">
                    <baseTitile :title="currentData.name" />
                    <div>
                        <el-button class="disabledBtn" @click="getDataWithTime(7)">
                            近一周
                        </el-button>
                        <el-button class="disabledBtn" @click="getDataWithTime(30)">
                            近一月
                        </el-button>
                        <el-button class="disabledBtn" @click="getDataWithTime(90)">
                            近三月
                        </el-button>
                    </div>
                </div>
                <tableStatistics :data="currentData.data" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import baseTree from '@/components/baseTree/index.vue';
import baseForm from '@/components/base-form/baseForm.vue';
import { getCategoryTreeApi } from '@/api/monitor/monitorInstrument';
import baseTitile from '@/components/base-title/index.vue';
import tableStatistics from './component/tableStatistics.vue';
import { formConfig } from './config';
import { Search, RefreshRight } from '@element-plus/icons-vue';
import { getReportDataApi } from '@/api/monitor/instrumentData';
import dayjs from 'dayjs';

const loading = ref(false);

const treeData = ref([]);
const currentData = reactive({
    data: {},
    id: '',
    name: ''
});
const form = ref<any>({});

getCategoryTreeApi({ hasInstrument: false }).then((data) => {
    if (data) treeData.value = data;
});

const getData = async () => {
    if (!currentData.id) return ElMessage.warning('请至少选择一个仪器设备再查询');

    loading.value = true;
    const date = form.value.date || [];
    let startTime;
    let endTime;
    if (date) {
        startTime = date[0];
        endTime = date[1];
    }

    try {
        const res = await getReportDataApi({
            partId: currentData.id,
            startTime,
            endTime
        });

        currentData.data = res;
    } finally {
        loading.value = false;
    }
};

const getDataWithTime = (time) => {
    const d = new Date().getTime();

    const lastTime = d - time * 24 * 60 * 60 * 1000;

    form.value.date = [
        dayjs(lastTime).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(d).format('YYYY-MM-DD HH:mm:ss')
    ];

    getData();
};

const onNodeClick = (data: any) => {
    if (data.id && (!data.children || data.children.length === 0)) {
        currentData.data = {};

        currentData.id = data.id;
        currentData.name = data.name;
        getData();
    }
};
</script>

<style lang="scss">
.data-statistics {
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
            height: calc(100% - 72px);
            overflow: auto;
        }

        > div {
            padding: 0 10px;
        }
    }
}
</style>
