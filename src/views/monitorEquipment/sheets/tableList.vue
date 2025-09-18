<template>
    <div class="table-list">
        <div class="table-list-title">
            {{ title }}
            <p>
                <el-button class="confirmBtn" @click="operation">新增</el-button>
                <el-button class="confirmBtn">导出</el-button>
            </p>
        </div>
        <div class="table-content">
            <!-- 多点表格 -->
            <table v-if="multiple && currentData.data.length > 0">
                <tr class="thead">
                    <td>观测日期</td>
                    <template v-for="item in currentData.data" :key="item.id">
                        <td v-for="v in item.param" :key="v.id">
                            {{ v.unit ? v.name + `(${v.unit})` : v.name }}
                        </td>
                    </template>
                    <td>备注</td>
                    <td>操作</td>
                </tr>
                <tr v-for="i in currentData.data[0].list.length" :key="i">
                    <td>
                        <p>{{ currentData.data[0].list[i - 1]?.dataTime }}</p>
                    </td>
                    <template v-for="item in currentData.data" :key="item.id">
                        <td v-for="v in item.param" :key="v.id">
                            <p>{{ item.list[i - 1][v.mapping] }}</p>
                        </td>
                    </template>
                    <td>
                        <p>{{ currentData.data[0].list[i - 1]?.remark }}</p>
                    </td>
                    <td>
                        <el-button type="primary" link @click="operation(i - 1)">编辑</el-button>
                    </td>
                </tr>
            </table>
            <!-- 单点表格 -->
            <table v-if="multiple === false && currentData.singleData.list">
                <tr class="thead">
                    <td v-for="v in currentData.singleData.param" :key="v.id">
                        {{ v.unit ? v.name + `(${v.unit})` : v.name }}
                    </td>
                    <td>编辑</td>
                </tr>
                <tr v-for="i in currentData.singleData.list.length" :key="i">
                    <td v-for="v in currentData.singleData.param" :key="v.id">
                        <p>{{ currentData.singleData.list[i - 1][v.mapping] }}</p>
                    </td>
                    <td>
                        <el-button type="primary" link @click="operation(i - 1)">编辑</el-button>
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
import dayjs from 'dayjs';
import { getDetailApi } from '@/api/monitor/monitorInstrument';
import {
    updateBatchApi,
    addBatchApi,
    getSinglePageApi,
    getMultiPageApi
} from '@/api/monitor/instrumentData';

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
const isEdit = ref(false);

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
        currentData.singleData.instrumentNo = data.instrumentNo;

        const res = await getSinglePageApi(
            { pageNum: pageInfo.pageNum, pageSize: pageInfo.pageSize },
            { instrumentId: props.id }
        );

        // @ts-ignore
        pageInfo.total = res.total;

        currentData.singleData.list = res.data;
    }

    console.log(currentData);
};

// 当前行数据
const operation = (index: number | undefined) => {
    baseDialogVisible.value = true;
    diaForm.value = {};
    formConfig.value = {};

    isEdit.value = typeof index === 'number';

    baseDialogTitle.value = isEdit.value ? '编辑' : '新增';
    let row = {};

    // 单点
    if (props.multiple === false) {
        if (isEdit.value) row = { ...currentData.singleData.list[index as number] };
        diaForm.value[props.id] = {
            instrumentNo: currentData.singleData.instrumentNo,
            instrumentId: props.id,
            ...row
        };

        formConfig.value[props.id] = currentData.singleData.param.map((v) => {
            return {
                filed: v.mapping,
                label: v.unit ? v.name + `(${v.unit})` : v.name,
                type: v.name.includes('日期') ? 'datetime' : 'input',
                placeholder: '请输入'
            };
        });
    }

    // 多点
    if (props.multiple === true) {
        currentData.data.forEach((item) => {
            if (isEdit.value) row = { ...item.list[index as number] };
            diaForm.value[item.id] = {
                instrumentNo: item.instrumentNo,
                instrumentId: item.id,
                //
                dataTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                ...row
            };
            formConfig.value[item.id] = item.param.map((v) => {
                return {
                    filed: v.mapping,
                    label: v.unit ? v.name + `(${v.unit})` : v.name,
                    type: v.name.includes('日期') ? 'datetime' : 'input'
                };
            });
            // 插入时间
            formConfig.value[item.id].unshift({
                filed: 'dataTime',
                label: '观测日期',
                type: 'datetime'
            });
            // 插入备注
            formConfig.value[item.id].push({
                filed: 'remark',
                label: '备注',
                labelWidth: '40px',
                type: 'textarea',
                placeholder: '请输入'
            });
        });
    }
};

const onSave = async () => {
    console.log(diaForm.value);
    const subData: any[] = [];
    for (const key in diaForm.value) {
        const a = { ...diaForm.value[key] };
        delete a.instrumentNo;
        subData.push(a);
    }

    const data = isEdit.value ? await updateBatchApi(subData) : await addBatchApi(subData);

    if (data.code == 200) {
        ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
        diaForm.value = {};
        getPage();
        baseDialogVisible.value = false;
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
            max-width: 100%;
            min-width: 100%;

            td {
                border: 1px solid #000;
                text-align: center;
                min-width: 100px;
                padding: 2px 4px;
                box-sizing: border-box;
                font-size: 14px;
                height: 42px;
                > P {
                    max-height: 42px;
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
