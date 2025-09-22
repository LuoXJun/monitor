<template>
    <div class="base-pie-chart">
        <div class="pie-chart" :style="{ width: width + 'px', height: height + 'px' }"></div>
        <div class="lend-text">
            <div v-for="v in colorList" :key="v">
                <p :style="{ backgroundColor: v }"></p>
                <span>123</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { basePieOption, colorList } from './chartConfig';
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

let myChart: echarts.ECharts | undefined;

const initChart = () => {
    if (myChart) myChart.dispose();
    myChart = undefined;

    myChart = echarts.init(document.querySelector('.pie-chart') as HTMLElement);

    myChart.setOption(basePieOption);
};

onMounted(() => {
    initChart();
});
</script>

<style scoped lang="scss">
.base-pie-chart {
    .lend-text {
        color: #000;
        display: flex;
        flex-wrap: wrap;
        > div {
            flex: 50% 0 0;
            display: flex;
            align-items: center;
            > p {
                height: 10px;
                width: 10px;
            }
            > span {
            }
        }
    }
}
</style>
