<template>
    <div class="base-bar-chart">
        <div ref="baseBarRef" :style="{ width: width + 'px', height: height + 'px' }"></div>
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { baseBarOption, colorList } from './chartConfig';
import { getEqDataNumApi } from '@/api/monitor/instrumentData';
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

getEqDataNumApi({}).then((data) => {
    baseBarOption.xAxis.data = data.map((v) => v.partName);
    baseBarOption.series[0].data = data.map((v, index) => {
        return {
            value: v.count ?? 10,
            itemStyle: {
                color: colorList[index]
            }
        };
    });
    initChart();
});

const initChart = () => {
    if (myChart) myChart.dispose();
    myChart = undefined;

    myChart = echarts.init(baseBarRef.value);

    myChart.setOption(baseBarOption);
};
</script>

<style scoped lang="scss"></style>
