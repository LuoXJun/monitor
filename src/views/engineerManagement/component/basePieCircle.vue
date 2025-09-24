<template>
    <div class="base-pieCircle-chart">
        <div ref="basePieCircleRef" :style="{ width: width + 'px', height: height + 'px' }"></div>
        <div class="base-pieCircle-chart-text">
            <div v-for="(img, i) in imgs" :key="i">
                <div>
                    <p>
                        <img :src="img" />
                    </p>
                    入侵预警
                </div>
                <p>16次</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { basePieCircle } from './chartConfig';
import { getImg } from '@/utils/getAssets';
const basePieCircleRef = ref();
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

const imgs = [
    getImg('ruqin.png'),
    getImg('dianziweilan.png'),
    getImg('anquanmao.png'),
    getImg('buanquan.png'),
    getImg('yanwu.png')
];

let myChart: echarts.ECharts | undefined;

const initChart = () => {
    if (myChart) myChart.dispose();
    myChart = undefined;

    myChart = echarts.init(basePieCircleRef.value);

    myChart.setOption(basePieCircle);
};

onMounted(() => {
    initChart();
});
</script>

<style scoped lang="scss">
.base-pieCircle-chart {
    &-text {
        padding-top: 10px;
        display: flex;
        flex-wrap: wrap;
        > div {
            flex: 50% 0 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-right: 10px;
            box-sizing: border-box;
            font-size: 12px;
            color: rgba(29, 33, 41, 1);
            margin-bottom: 5px;
            > div {
                display: flex;
                align-items: center;
                > p {
                    width: 16px;
                    height: 16px;
                    margin-right: 5px;

                    > img {
                        width: 100%;
                    }
                }
            }
        }
    }
}
</style>
