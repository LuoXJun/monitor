<template>
    <div class="cesium-containar">
        <div id="cesium-containar"></div>
        <div class="content">
            <div class="left">
                <div></div>
                <div style="height: 330px">
                    <baseTitle title="分项工作仪器查看" />
                    <basePie :width="334" :height="200" />
                </div>
                <div></div>
            </div>
            <div class="right">
                <div v-for="i in 3" :key="i"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import ViewerOptions from './ViewerOptions';
import basePie from './component/basePie.vue';
import baseTitle from '@/components/base-title/index.vue';
let viewer;
onMounted(() => {
    viewer = new Cesium.Viewer('cesium-containar', ViewerOptions);
});
</script>

<style lang="scss">
.cesium-containar {
    overflow: hidden;
    background-color: #000;
    height: calc(100vh - 136px);

    #cesium-containar {
        height: 100%;
    }

    > .content {
        width: 100vw;
        height: 100%;
        display: flex;
        justify-content: space-between;
        position: absolute;
        left: 0;
        top: 0;
        pointer-events: none;

        > .left,
        > .right {
            pointer-events: all;
            width: 334px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            > div {
                background-color: rgb(255, 255, 255);
                width: 100%;
                padding: 0 10px;
                box-sizing: border-box;
            }
        }
    }

    .cesium-widget-credits {
        display: none;
    }
}
</style>
