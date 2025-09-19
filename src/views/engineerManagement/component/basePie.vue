<template>
    <div class="base-pie-chart" :style="{ width: width + 'px', height: height + 'px' }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { basePieOption } from './chartConfig';
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

const initChart = () => {
    if (myChart) myChart.dispose();
    myChart = undefined;

    myChart = echarts.init(document.querySelector('.base-pie-chart') as HTMLElement);

    myChart.setOption(basePieOption);
};
</script>

<style scoped lang="scss"></style>
