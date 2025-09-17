<template>
    <div class="table-list">
        <div class="table-list-title">
            {{ title }}
            <p>
                <el-button class="confirmBtn" @click="add">新增</el-button>
                <el-button class="confirmBtn">编辑</el-button>
            </p>
        </div>
        <div class="table-content">
            <table v-if="multiple && currentData.data.length > 0">
                <tr class="thead">
                    <td>观测日期</td>
                    <template v-for="item in currentData.data" :key="item.id">
                        <td v-for="v in item.param" :key="v.id">
                            {{ v.unit ? v.name + `(${v.unit})` : v.name }}
                        </td>
                    </template>
                    <td>备注</td>
                </tr>
                <tr v-for="i in currentData.data[0].list.length" :key="i">
                    <td>{{ currentData.data[0].list[i - 1]?.dataTime }}</td>
                    <template v-for="item in currentData.data" :key="item.id">
                        <td v-for="v in item.param" :key="v.id">
                            {{ item.list[i - 1][v.mapping] }}
                        </td>
                    </template>
                    <td>
                        <p>{{ currentData.data[0].list[i - 1]?.remark }}</p>
                    </td>
                </tr>
            </table>
            <!-- 单点表格 -->
            <table v-if="multiple === false && currentData.singleData.list">
                <tr class="thead">
                    <td v-for="v in currentData.singleData.param" :key="v.id">
                        {{ v.unit ? v.name + `(${v.unit})` : v.name }}
                    </td>
                </tr>
                <tr v-for="i in currentData.singleData.list.length" :key="i">
                    <td v-for="v in currentData.singleData.param" :key="v.id">
                        {{ currentData.singleData.list[i - 1][v.mapping] }}
                    </td>
                </tr>
            </table>
        </div>

        <basePagination v-model="pageInfo" @handle-change="getPage" />
        <baseDialog v-model="baseDialogVisible" :title="baseDialogTitle" @on-confirm="onSave">
            <template v-for="(val, key) in formConfig" :key="key">
                <base-title :title="diaForm[key]?.instrumentNo" />
                <baseForm
                    labelWidth="120px"
                    v-model="diaForm[key]"
                    :formItemList="val"
                    :layout="{
                        xl: 8,
                        lg: 8,
                        md: 8,
                        sm: 12,
                        xs: 24
                    }"
                />
            </template>
        </baseDialog>
    </div>
</template>

<script setup lang="ts">
import basePagination from '@/components/base-pagination/base-pagination.vue';
import baseDialog from '@/components/baseDialog/index.vue';
import baseForm from '@/components/base-form/baseForm.vue';
import baseTitle from '@/components/base-title/index.vue';
import {
    addBatchApi,
    getDetailApi,
    getMultiPageApi,
    getSinglePageApi
} from '@/api/monitor/monitorInstrument';

const props = defineProps({
    id: {
        type: String,
        default: () => ''
    },
    multiple: {
        type: Boolean,
        default: () => true
    },
    title: {
        type: String,
        default: '标题'
    }
});

const currentData = reactive<Record<string, any>>({
    data: [],
    singleData: {}
});

const formConfig = ref<Record<string, IformItem[]>>({});
const diaForm = ref<Record<string, any>>({});

const pageInfo = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
});

const baseDialogVisible = ref(false);
const baseDialogTitle = ref('');

const getPage = async () => {
    currentData.data = [];
    currentData.singleData = {};

    if (props.multiple) {
        const data = await getDetailApi({ id: props.id });
        if (!data) return ElMessage.error('未查询到数据');
        currentData.data.push({
            id: data.id,
            instrumentNo: data.instrumentNo,
            param: JSON.parse(data.instrumentType.dataTemplate),
            list: []
        });
        data.children.forEach((item) => {
            const param = JSON.parse(item.instrumentType.dataTemplate);
            currentData.data.push({
                id: item.id,
                instrumentNo: item.instrumentNo,
                param,
                list: []
            });
        });

        const res = await getMultiPageApi(
            { pageNum: pageInfo.pageNum, pageSize: pageInfo.pageSize },
            { instrumentId: props.id }
        );
        // @ts-ignore
        pageInfo.total = res.total;
        for (const key in res.data) {
            for (const item of res.data[key]) {
                for (const v of currentData.data) {
                    if (item.instrumentId === v.id) {
                        v.list.push(item);
                    }
                }
            }
        }
    } else {
        const data = await getDetailApi({ id: props.id });
        const param = JSON.parse(data?.instrumentType?.dataTemplate) || {};
        currentData.singleData.param = [
            { name: '观测日期', mapping: 'dataTime' },
            ...param,
            { name: '备注', mapping: 'remark' }
        ];

        const res = await getSinglePageApi(
            { pageNum: pageInfo.pageNum, pageSize: pageInfo.pageSize },
            { instrumentId: props.id }
        );

        // @ts-ignore
        pageInfo.total = res.total;

        currentData.singleData.list = res.data;
        currentData.singleData.instrumentNo = res.data.instrumentNo;
    }

    console.log(currentData);
};

const add = () => {
    baseDialogVisible.value = true;
    baseDialogTitle.value = '新增';
    if (props.multiple === false) {
        diaForm.value[props.id] = {};
        diaForm.value.instrumentNo = currentData.singleData.instrumentNo;
        formConfig.value[props.id] = currentData.singleData.param.map((v) => {
            return {
                filed: v.mapping,
                label: v.unit ? v.name + `(${v.unit})` : v.name,
                type: v.name.includes('日期') ? 'date' : 'input',
                placeholder: '请输入'
            };
        });
    }

    if (props.multiple === true) {
        currentData.data.forEach((item) => {
            diaForm.value[item.id] = { instrumentNo: item.instrumentNo };
            formConfig.value[item.id] = item.param.map((v) => {
                return {
                    filed: v.mapping,
                    label: v.unit ? v.name + `(${v.unit})` : v.name,
                    type: v.name.includes('日期') ? 'date' : 'input',
                    placeholder: '请输入'
                };
            });
        });
    }
};

const onSave = async () => {
    console.log(diaForm.value);
    if (props.multiple === false) {
        const data = await addBatchApi([
            {
                ...diaForm.value[props.id],
                instrumentId: props.id
            }
        ]);

        if (data.code == 200) {
            ElMessage.success('新增成功');
            diaForm.value = {};
            getPage();
            baseDialogVisible.value = false;
        }
    }
};

watch(
    () => props.id,
    () => {
        if (props.id) {
            pageInfo.pageNum = 1;
            getPage();
        }
    },
    { immediate: true }
);
</script>

<style scoped lang="scss">
.table-list {
    padding: 10px 0;
    height: 100%;
    width: 100%;
    overflow: auto;
    > .table-list-title {
        text-align: center;
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: bold;
        position: relative;
        > p {
            position: absolute;
            right: 20px;
            top: 0;
        }
    }

    .table-content {
        width: 1410px;
        height: 520px;
        overflow: auto;
        table {
            table-layout: fixed;
            border-collapse: collapse;
            width: 100%;

            td {
                border: 1px solid #000;
                text-align: center;
                max-width: 120px;
                padding: 2px 4px;
                box-sizing: border-box;
                font-size: 14px;
                > P {
                    height: 42px;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
            }
            .thead {
                font-weight: bold;
            }
        }
    }
}
</style>
