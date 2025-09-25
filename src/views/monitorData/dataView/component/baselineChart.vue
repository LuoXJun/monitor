<template>
    <div>
        <baseForm
            v-model="form"
            :form-item-list="[{ filed: 'date', type: 'datetimerange', label: '观测日期' }]"
        >
            <template #footer>
                <div style="text-align: left">
                    <el-button class="confirmBtn" @click="getPage">查询</el-button>
                </div>
            </template>
        </baseForm>
        <el-select
            style="width: 200px; position: absolute; top: 50px; left: 12px; z-index: 2"
            v-model="currentType"
            v-if="multiple && currentParam && currentParam.length > 0"
            @change="initChart"
        >
            <el-option
                v-for="item in currentParam"
                :key="item.label"
                :label="item.label"
                :value="item.value"
            />
        </el-select>

        <div class="baseline-chart" :style="{ width: width + 'px', height: height + 'px' }"></div>
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { baseLineOption } from './chartsConfig';
import baseForm from '@/components/base-form/baseForm.vue';
import { getMultiListApi, getSingleListApi } from '@/api/monitor/instrumentData';
import { getDetailApi } from '@/api/monitor/monitorInstrument';
const props = defineProps({
    width: {
        type: Number,
        default: () => 200
    },
    height: {
        type: Number,
        default: 200
    },
    id: {
        type: String,
        default: ''
    },
    multiple: {
        type: Boolean,
        default: () => true
    },
    title: {
        type: String,
        default: () => ''
    }
});

const form = ref({ date: '' });
let myChart: echarts.ECharts | undefined;

// 当前展示字段
const currentType = ref('');
const currentParam = ref<Record<string, any>[]>([]);

const currentData = reactive<Record<string, any>>({
    data: [],
    singleData: {}
});
const getPage = async () => {
    const date = form.value.date;
    currentParam.value = [];
    currentType.value = '';
    if (!date || date.length !== 2) return ElMessage.warning('请先选择查询时间范围');

    currentData.data = [];
    currentData.singleData = {};

    const obj = { instrumentId: props.id, startTime: date[0], endTime: date[1] };

    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)'
    });

    try {
        const data = await getDetailApi({ id: props.id });
        if (!data) return ElMessage.error('未查询到数据');

        // 多点
        if (props.multiple) {
            // currentData.data.push({
            //     id: data.id,
            //     instrumentNo: data.instrumentNo,
            //     param: JSON.parse(data.instrumentType.dataTemplate),
            //     list: []
            // });
            data.children.forEach((item) => {
                const param = JSON.parse(item.instrumentType.dataTemplate ?? {});
                currentData.data.push({
                    id: item.id,
                    instrumentNo: item.instrumentNo,
                    param,
                    list: []
                });
            });

            const res = await getMultiListApi(obj);
            for (const key in res) {
                for (const item of res[key]) {
                    for (const v of currentData.data) {
                        if (item.instrumentId === v.id) {
                            v.list.push(item);
                        }
                    }
                }
            }

            currentParam.value = currentData.data[0].param.map((v) => {
                return { label: v.unit ? v.name + `(${v.unit})` : v.name, value: v.mapping };
            });
            currentType.value = currentParam.value[0].value;
        } else {
            // 单点
            const param = JSON.parse(data?.instrumentType?.dataTemplate) ?? [];
            currentData.singleData.param = param;
            currentData.singleData.instrumentNo = data.instrumentNo;

            const res = await getSingleListApi(obj);

            currentData.singleData.list = res;
        }
    } finally {
        loading.close();
    }

    initChart();
    console.log(currentData);
};

const initChart = () => {
    if (myChart) myChart.dispose();
    myChart = undefined;

    baseLineOption.title.text = props.title;

    // 构建echarts数据结构
    if (props.multiple) {
        baseLineOption.legend.data = currentData.data.map((v) => v.instrumentNo);
        const series: any[] = [];
        currentData.data.forEach((v, i) => {
            series.push({
                name: v.instrumentNo,
                type: 'line',
                data: v.list.map((d) => [new Date(d.createTime).getTime(), d[currentType.value]])
            });
        });

        baseLineOption.series = series;
    }

    if (props.multiple === false) {
        const series: any[] = [];
        currentData.singleData.param.forEach((v) => {
            series.push({
                name: v.unit ? v.name + `(${v.unit})` : v.name,
                type: 'line',
                data: currentData.singleData.list.map((item) => {
                    return [new Date(item.createTime).getTime(), item[v.mapping]];
                })
            });
        });
        baseLineOption.series = series;
        baseLineOption.legend.data = currentData.singleData.param.map((v) =>
            v.unit ? v.name + `(${v.unit})` : v.name
        );
    }

    myChart = echarts.init(document.querySelector('.baseline-chart') as HTMLElement);

    myChart.setOption(baseLineOption);
};

watch(
    () => props.id,
    () => {
        if (myChart) myChart.dispose();
        currentParam.value = [];
    },
    { immediate: true }
);
</script>

<style scoped lang="scss"></style>
