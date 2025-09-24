<template>
    <div class="cesium-containar">
        <div id="cesium-containar"></div>
        <div class="content">
            <div class="left-box">
                <div
                    class="expand"
                    :class="{ inExpand: expandData.leftPanel }"
                    @click="expandData.leftPanel = !expandData.leftPanel"
                >
                    <el-icon><DArrowRight /></el-icon>
                </div>
                <div class="left" :class="{ inExpand: !expandData.leftPanel }">
                    <div class="title-panel">
                        <baseTitle title="设备数量" style="font-weight: bold" />
                        <div class="eq-list-total">
                            <p>
                                <img src="@/assets/imgs/shebeishuliang.png" alt="" />
                            </p>
                            <div>
                                <p>设备总数（台）</p>
                                <p>{{ eqNum[1] + eqNum[2] }}</p>
                            </div>
                        </div>
                        <div class="eq-list-length">
                            <div>
                                <p>
                                    <img src="@/assets/imgs/onlineEq.png" style="width: 100%" />
                                </p>
                                <div>
                                    <p>{{ eqNum[1] }}</p>
                                    <p>在线设备（台）</p>
                                </div>
                            </div>
                            <div>
                                <p>
                                    <img src="@/assets/imgs/inLineEq.png" style="width: 100%" />
                                </p>
                                <div>
                                    <p>{{ eqNum[2] }}</p>
                                    <p>离线设备（台）</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <baseTitle title="分项工作仪器查看" style="font-weight: bold" />
                        <basePie :width="334" :height="140" />
                    </div>
                    <div>
                        <baseTitle title="当月数据记录（条）" style="font-weight: bold" />
                        <baseBar :width="334" :height="180" />
                    </div>
                </div>
            </div>
            <div class="right-box">
                <div
                    class="expand"
                    :class="{ inExpand: expandData.rightPanel }"
                    @click="expandData.rightPanel = !expandData.rightPanel"
                >
                    <el-icon><DArrowRight /></el-icon>
                </div>
                <div class="right" :class="{ inExpand: !expandData.rightPanel }">
                    <div>
                        <baseTitle title="有效性检查结果" style="font-weight: bold" />
                        <div class="check-result">
                            <!-- 测点总数 -->
                            <div>
                                <p>测点总数</p>
                                <p>
                                    <span>5461</span>
                                    <span>
                                        <img src="@/assets/imgs/up.png" alt="" />
                                        12%
                                    </span>
                                </p>
                                <img src="@/assets/imgs/area.png" />
                            </div>
                            <div>
                                <div>
                                    <p>
                                        <span>有效检查</span>
                                        <span>422.61</span>
                                    </p>
                                    <div>
                                        <baseCircle
                                            :width="80"
                                            :height="80"
                                            bgColor="rgba(22, 93, 255, 1)"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p>
                                        <span>有效检查</span>
                                        <span>422.61</span>
                                    </p>
                                    <div>
                                        <baseCircle
                                            :width="80"
                                            :height="80"
                                            bgColor="rgba(20, 201, 201, 1)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <baseTitle title="视频监控检查结果" style="font-weight: bold" />
                        <basePieCircle :width="334" :height="120" />
                    </div>
                    <div>
                        <baseTitle title="异常识别结果" style="font-weight: bold" />
                        <baseRowBar
                            v-for="i in [
                                'rgba(85, 108, 149, 1)',
                                'rgba(85, 108, 149, 1)',
                                'rgba(199, 166, 165, 1)',
                                'rgba(200, 200, 200, 1)'
                            ]"
                            :key="i"
                            :bgColor="i"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="footer-baseNavigator">
            <baseNavigator />
        </div>
    </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium';
import ViewerOptions from './ViewerOptions';
import basePie from './component/basePie.vue';
import baseBar from './component/baseBar.vue';
import baseCircle from './component/baseCircle.vue';
import baseTitle from '@/components/base-title/index.vue';
import basePieCircle from './component/basePieCircle.vue';
import baseRowBar from './component/baseRowBar.vue';
import { DArrowRight } from '@element-plus/icons-vue';
import baseNavigator from './component/baseNavigator.vue';
import { createBillboard } from './createBillboard';
import { getCounterByStatusApi } from '@/api/monitor/monitorInstrument';
let viewer: Cesium.Viewer;

const expandData = reactive({
    leftPanel: true,
    rightPanel: true
});

const eqNum = ref<Record<string, any>>({});

getCounterByStatusApi().then((data) => {
    eqNum.value = data ?? {};
});

onMounted(() => {
    // viewer = new Cesium.Viewer('cesium-containar', ViewerOptions);
    // createBillboard(viewer);
});
</script>

<style>
.cesium-widget-credits {
    display: none !important;
}
</style>
<style lang="scss" scoped>
.cesium-containar {
    overflow: hidden;
    background-color: #000;
    height: calc(100vh - 136px);

    #cesium-containar {
        height: 100%;
    }
    .footer-baseNavigator {
        position: absolute;
        top: 0px;
        right: 380px;
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
        .left-box {
            position: relative;
            display: flex;
            justify-content: space-between;
            .left {
                .title-panel {
                    > .eq-list-total {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        > p {
                            flex: 100px 0 0;
                            height: 100px;
                            > img {
                                width: 100%;
                                transform: scale(1.2);
                            }
                        }
                        > div {
                            overflow-x: auto;
                            overflow-y: hidden;
                            margin-left: 37px;

                            > p {
                                color: rgba(57, 61, 68, 1);
                                font-family: 'PingFang SC';
                                font-size: 14px;
                                font-weight: 500;
                                line-height: 20px;
                                letter-spacing: 0px;
                            }
                            > p:nth-child(2) {
                                background: linear-gradient(
                                    360deg,
                                    rgb(106 107 120),
                                    rgb(0 109 255) 100%
                                );
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                                text-fill-color: transparent;
                                font-family: YouSheBiaoTiHei;
                                font-size: 28px;
                                font-weight: 400;
                                line-height: 36px;
                                letter-spacing: 0px;
                                text-align: left;
                            }
                        }
                    }
                    > .eq-list-length {
                        display: flex;
                        align-items: center;
                        padding: 18px 0;
                        > div {
                            display: flex;
                            align-items: center;
                            flex: 50% 0 0;
                            overflow-x: auto;
                            overflow-y: hidden;
                            > p {
                                flex: 40px 0 0;
                                height: 40px;
                                margin-right: 10px;
                                > img {
                                    transform: scale(1.8);
                                }
                            }
                            > div {
                                > p:first-child {
                                    background: linear-gradient(
                                        360deg,
                                        rgb(106 107 120),
                                        rgb(0 109 255) 100%
                                    );
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                    text-fill-color: transparent;
                                    font-family: PingFang SC;
                                    font-size: 18px;
                                    font-weight: 500;
                                    line-height: 25px;
                                    letter-spacing: 0px;
                                    text-align: left;
                                }
                                > p {
                                    color: rgba(57, 61, 68, 1);

                                    font-family: PingFang SC;
                                    font-size: 14px;
                                    font-weight: 400;
                                    line-height: 20px;
                                    letter-spacing: 0px;
                                    text-align: left;
                                }
                            }
                        }
                    }
                }
            }
            .expand {
                position: absolute;
                top: 50%;
                right: 0;
                transform: translate(100%, -50%) rotate(0deg);
                color: #fff;
                pointer-events: all;
                cursor: pointer;
                animation: all 0.2s ease-in;
                &.inExpand {
                    transform: translate(100%, -50%) rotate(180deg);
                }
            }
        }
        .right-box {
            position: relative;
            display: flex;
            justify-content: space-between;
            .right {
                > div:first-child {
                    background: rgba(247, 247, 247, 1);
                }
                .check-result {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    height: calc(100% - 48px);
                    padding-bottom: 10px;
                    > div {
                        flex: 160px 0 0;
                        height: 100%;
                        padding: 14px;
                        box-sizing: border-box;
                    }
                    > div:first-child {
                        margin-right: 10px;
                        box-sizing: border-box;
                        background: #fff;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;

                        img {
                            width: 100%;
                        }
                        > p {
                            font-family: PingFang SC;
                            font-size: 14px;
                        }
                        > p:nth-child(2) {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            > span {
                                color: rgba(29, 33, 41, 1);
                                font-size: 20px;
                            }
                            > span:nth-child(2) {
                                display: flex;
                                align-items: center;
                                padding: 0 10px;
                                color: rgba(0, 180, 42, 1);
                                border-radius: 10px;
                                background-color: rgba(232, 255, 234, 1);
                                font-size: 12px;
                                height: 20px;
                                line-height: 20px;
                                img {
                                    width: 10px;
                                    margin-right: 5px;
                                }
                            }
                        }
                    }
                    > div:nth-child(2) {
                        display: flex;
                        flex-direction: column;
                        background-color: #fff;
                        justify-content: space-between;
                        > div:nth-child(2) {
                            border-top: 1px solid #c6c6c6;
                            box-sizing: border-box;
                        }
                        > div {
                            display: flex;
                            align-items: center;
                            > p {
                                > span {
                                    color: rgba(78, 89, 105, 1);
                                    font-family: PingFang SC;
                                    font-size: 14px;
                                }
                                > span:nth-child(2) {
                                    font-size: 20px;
                                    color: rgba(29, 33, 41, 1);
                                }
                            }
                        }
                    }
                }
            }
            .expand {
                position: absolute;
                top: 50%;
                left: 0;
                transform: translate(-100%, -50%) rotate(180deg);
                color: #fff;
                pointer-events: all;
                cursor: pointer;
                animation: all 0.2s ease-in-out;
                &.inExpand {
                    transform: translate(-100%, -50%) rotate(0deg);
                }
            }
        }

        .left,
        .right {
            pointer-events: all;
            width: 360px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 7px;
            margin: 10px;
            box-sizing: border-box;
            background-color: rgba(255, 255, 255, 0.75);
            transition: all 0.2s ease-in-out;
            overflow: hidden;
            &.inExpand {
                width: 0;
                padding: 0;
            }

            > div {
                background-color: rgb(255, 255, 255);
                width: 100%;
                padding: 0 10px;
                box-sizing: border-box;
                overflow-y: auto;
                overflow-x: hidden;
            }
            > div:nth-child(1) {
                height: 230px;
            }
            > div:nth-child(2) {
                height: 260px;
            }
            > div:nth-child(3) {
                height: 230px;
            }
        }
    }
}
</style>
