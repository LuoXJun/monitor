<template>
    <div class="base-bar-chart">
        <div ref="baseBarRef" :style="{ width: width + 'px', height: height + 'px' }"></div>
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { baseBarOption } from './chartConfig';
defineProps({
    width: {
        type: Number,
        default: () => 200
    },
    height: {
        type: Number,
        default: 200
    }
});

let myChart: echarts.ECharts | undefined;
const baseBarRef = ref();

const initChart = () => {
    if (myChart) myChart.dispose();
    myChart = undefined;

    myChart = echarts.init(baseBarRef.value);

    myChart.setOption(baseBarOption);
};

onMounted(() => {
    initChart();
});
</script>

<style scoped lang="scss"></style>
