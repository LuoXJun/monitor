<template>
    <div class="base-pie-chart">
        <div
            ref="basePieRef"
            class="pie-chart"
            :style="{ width: width + 'px', height: height + 'px' }"
        ></div>
        <div class="lend-text">
            <div v-for="(v, index) in dataSet" :key="v.partName">
                <p :style="{ backgroundColor: colorList[index] }"></p>
                <span>{{ v.partName }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { basePieOption, colorList } from './chartConfig';
import { getPartNumApi } from '@/api/monitor/monitorInstrument';

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
const basePieRef = ref();

const dataSet = ref<any[]>([]);
getPartNumApi().then((data) => {
    dataSet.value = data;
    basePieOption.series[0].data = data.map((v) => {
        return {
            value: v.count ?? 10,
            name: v.partName
        };
    });
    initChart();
});

const initChart = () => {
    if (myChart) myChart.dispose();
    myChart = undefined;

    myChart = echarts.init(basePieRef.value);

    myChart.setOption(basePieOption);
};
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
                margin-left: 5px;
                font-size: 14px;
            }
        }
    }
}
</style>
