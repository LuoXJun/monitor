<template>
    <div class="base-circle-chart">
        <div ref="baseCircleRef" :style="{ width: width + 'px', height: height + 'px' }"></div>
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { baseCircleOption } from './chartConfig';
const baseCircleRef = ref();
const props = defineProps({
    width: {
        type: Number,
        default: () => 200
    },
    height: {
        type: Number,
        default: 200
    },
    bgColor: {
        type: String,
        default: () => 'red'
    }
});

let myChart: echarts.ECharts | undefined;

const initChart = () => {
    if (myChart) myChart.dispose();
    myChart = undefined;

    baseCircleOption.series[0].data[1].itemStyle.borderColor = props.bgColor;

    myChart = echarts.init(baseCircleRef.value);

    myChart.setOption(baseCircleOption);
};

onMounted(() => {
    initChart();
});
</script>

<style scoped lang="scss"></style>
