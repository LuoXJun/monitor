<template>
    <div class="monitorEquipment" v-loading="isLoading">
        <div class="monitorEquipment-left">
            <baseTree
                v-model="treeData"
                title="项目工程树"
                :defaultProps="{ label: 'name' }"
                @on-node-click="onNodeClick"
                @on-edit="onTreeEdit"
                @on-remove="onTreeRemove"
            >
                <template #btn-line>
                    <el-button @click="onAddPart">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        新增
                    </el-button>
                </template>
            </baseTree>
        </div>
        <div class="monitorEquipment-right">
            <!-- top -->
            <div>
                <baseForm
                    v-model="form"
                    :layout="{
                        xl: 6,
                        lg: 6,
                        md: 6,
                        sm: 12,
                        xs: 24
                    }"
                    :formItemList="formConfig"
                >
                    <template #footer>
                        <el-button
                            class="confirmBtn"
                            @click="
                                pageInfo.pageNum = 1;
                                getPage();
                            "
                        >
                            <el-icon>
                                <Search />
                            </el-icon>
                            &nbsp; 查询
                        </el-button>
                        <el-button class="cancelBtn" @click="form = {}">
                            <el-icon>
                                <RefreshRight />
                            </el-icon>
                            &nbsp;重置
                        </el-button>
                    </template>
                </baseForm>
            </div>
            <!-- main -->
            <div>
                <baseTitle title="设备管理" />
                <baseTable
                    v-model="tableData"
                    index
                    :tableColumn="tableColumnConfig"
                    :pageInfo="pageInfo"
                    :options="{
                        border: false,
                        height: '580px'
                    }"
                >
                    <template #status="{ scope }">
                        <el-switch v-model="scope.row.status" active-value="1" />
                    </template>
                    <template #operation="{ scope }">
                        <el-button link class="primaryText" @click="view(scope.row)">
                            详情
                        </el-button>
                        <el-button link class="primaryText" @click="operation">
                            有效性配置
                        </el-button>
                        <el-button link class="dangerText" @click="operation">异常性配置</el-button>
                    </template>
                </baseTable>
                <basePagination v-model="pageInfo" size="small" @handle-change="getPage" />
            </div>
        </div>
        <baseDialog v-model="baseDialogVisible" @on-confirm="onSubmit">
            <baseForm
                v-if="!currentData.isView"
                v-model="partForm"
                labelWidth="80px"
                :layout="{
                    xl: 12,
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 24
                }"
                :formItemList="addPartformConfig"
            />
            <singleInfo v-else :data="currentData.data" />
            <template v-if="currentData.isView" #footer>
                <el-button @click="baseDialogVisible = false">关闭</el-button>
            </template>
        </baseDialog>
        <baseDrawer v-model="drawerVisible">
            <baseInfo />
            <detailItem title="物理意义" style="margin-bottom: 20px">
                <div class="detail-item-content">
                    <p>取值上限</p>
                    <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
                </div>
                <div class="detail-item-content">
                    <p>取值下限</p>
                    <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
                </div>
            </detailItem>
            <detailItem title="量程限制" style="margin-bottom: 20px">
                <div class="detail-item-content">
                    <p>取值上限</p>
                    <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
                </div>
                <div class="detail-item-content">
                    <p>取值下限</p>
                    <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
                </div>
                <div class="detail-item-content">
                    <p>超载倍数</p>
                    <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
                </div>
            </detailItem>
            <detailItem title="包络域" style="margin-bottom: 20px">
                <div class="detail-item-content" style="flex: 1">
                    <p>自动获取历史数据</p>
                    <div class="history-data">
                        <div>
                            <el-radio label="" value="date" />
                            <el-date-picker
                                v-model="input1"
                                type="daterange"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                            />
                        </div>
                        <div>
                            <el-radio label="近" value="date" />
                            <el-input
                                v-model="input1"
                                class="responsive-input"
                                placeholder="Pick a date"
                            />
                            <el-select v-model="input1" placeholder="Select" style="width: 240px">
                                <el-option v-for="i in 20" :key="i" :label="i + '年'" :value="i" />
                            </el-select>
                        </div>
                        <div>
                            <el-button type="primary" plain>确认</el-button>
                        </div>
                    </div>
                </div>
                <div class="detail-item-content">
                    <p>取值上限</p>
                    <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
                </div>
                <div class="detail-item-content">
                    <p>取值下限</p>
                    <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
                </div>
                <div class="detail-item-content">
                    <p>超载倍数</p>
                    <el-input v-model="input1" class="responsive-input" placeholder="Pick a date" />
                </div>
            </detailItem>
        </baseDrawer>
    </div>
</template>

<script setup lang="ts">
import baseTree from '@/components/baseTree/index.vue';
import baseForm from '@/components/base-form/baseForm.vue';
import baseTitle from '@/components/base-title/index.vue';
import baseTable from '@/components/base-table/base-table.vue';
import basePagination from '@/components/base-pagination/base-pagination.vue';
import baseDialog from '@/components/baseDialog/index.vue';
import baseDrawer from '@/components/baseDrawer/index.vue';
import baseInfo from './component/baseInfo.vue';
import detailItem from './component/detailItem.vue';
import singleInfo from './sheets/singleInfo.vue';
import { Search, RefreshRight, Plus } from '@element-plus/icons-vue';
import { formConfig, addPartformConfig, tableColumnConfig } from './config';
import {
    getCategoryTreeApi,
    getCategoryPageApi,
    getDetailApi
} from '@/api/monitor/monitorInstrument';
import { addPartApi, deletePartApi, updatePartApi } from '@/api/monitor/part';
const isLoading = ref(false);

const input1 = ref();
const form = ref<Record<string, any>>({});
const partForm = ref({});

const tableData = ref([]);
const baseDialogVisible = ref(false);
const drawerVisible = ref(false);
const pageInfo = ref({
    pageNum: 1,
    pageSize: 10,
    total: 0
});

const treeData = ref([]);
const partId = ref('');
const currentData = reactive<any>({
    data: {},
    isView: true
});

const getTreeData = () => {
    getCategoryTreeApi({ hasInstrument: false }).then((data) => {
        if (data) {
            treeData.value = data;
            addPartformConfig.value[0].data = data;
        }
    });
};

const onSubmit = async () => {
    isLoading.value = true;
    try {
        const data = await addPartApi({ ...partForm.value });
        if (data.code == 200) {
            ElMessage.success('新增成功');
            baseDialogVisible.value = false;
            getTreeData();
        }
    } finally {
        isLoading.value = false;
    }
};

const onAddPart = () => {
    currentData.isView = false;
    baseDialogVisible.value = true;
};

const onTreeRemove = async (id) => {
    isLoading.value = true;

    try {
        const data = await deletePartApi({ ids: id });
        if (data.code == 200) {
            ElMessage.success('删除成功');
            getTreeData();
        }
    } finally {
        isLoading.value = false;
    }
};

const onTreeEdit = async ({ id, value }) => {
    isLoading.value = true;

    try {
        const data = await updatePartApi({ id, name: value });
        if (data.code == 200) {
            ElMessage.success('编辑成功');
            getTreeData();
        }
    } finally {
        isLoading.value = false;
    }
};

const view = async (row: any) => {
    baseDialogVisible.value = true;
    currentData.data = {};
    currentData.isView = true;

    if (row.id) {
        isLoading.value = true;

        try {
            const data = await getDetailApi({ id: row.id });
            currentData.data = data || {};
        } finally {
            isLoading.value = false;
        }
    }
};

const operation = () => {
    drawerVisible.value = true;
};

const getPage = async () => {
    isLoading.value = true;

    try {
        const date = form.value.createTime || [];
        const res = await getCategoryPageApi(
            { pageNum: pageInfo.value.pageNum, pageSize: pageInfo.value.pageSize },
            {
                partId: partId.value,
                startTime: date[0],
                endTime: date[1],
                instrumentNo: form.value.instrumentNo
            }
        );
        tableData.value = res.data;
        // @ts-ignore
        pageInfo.value.total = res.total;
    } finally {
        isLoading.value = false;
    }
};

const onNodeClick = (data) => {
    if (data.id) {
        partId.value = data.id;
        getPage();
    }
};

onMounted(() => {
    getTreeData();
    getPage();
});
</script>

<style lang="scss">
.monitorEquipment {
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

            .el-table {
                width: 99%;
            }

            .basePagination {
                height: 30px;
            }
        }

        > div {
            padding: 0 10px;
        }
    }

    .detail-item-content {
        flex: 33% 0 0;
        padding: 0 20px;
        box-sizing: border-box;
        margin-bottom: 30px;

        > p {
            margin-bottom: 5px;
        }

        .history-data {
            width: calc(100% + 28px);
            display: flex;
            align-items: center;

            > div {
                flex: 33%;
                display: flex;
                align-items: center;

                .el-button {
                    background: transparent;
                }

                .el-input,
                .el-select {
                    width: 150px !important;
                }

                .el-input {
                    margin: 0 9px;
                }

                .el-radio {
                    margin: 0;
                }

                .el-date-editor {
                    flex: 333px 0 0;
                }
            }
        }
    }
}
</style>
