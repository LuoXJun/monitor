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
            <baseNavigator :list="list" />
        </div>

        <baseDialog v-model="baseDialogVisible" title="详情" height="850px">
            <el-tabs v-model="activeName">
                <el-tab-pane label="基本信息" name="baseInfo">
                    <multInfo
                        v-if="currentData.multiple"
                        :data="currentData.eqData || []"
                        :title="currentData.tableTitle"
                    />
                    <singleInfo
                        v-else
                        :data="currentData.eqData || {}"
                        :title="currentData.tableTitle"
                    />
                </el-tab-pane>
                <el-tab-pane label="数据内容" name="data">
                    <tableList
                        :id="currentData.eqId"
                        :multiple="currentData.multiple"
                        :title="currentData.tableTitle"
                    />
                </el-tab-pane>
                <el-tab-pane label="曲线图" name="map">
                    <baselineChart
                        :multiple="currentData.multiple"
                        :id="currentData.eqId"
                        :width="1100"
                        :height="520"
                        :title="currentData.tableTitle"
                    />
                </el-tab-pane>
            </el-tabs>

            <template #footer>
                <el-button class="confirmBtn" @click="baseDialogVisible = false">关闭</el-button>
            </template>
        </baseDialog>
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
import { getCounterByStatusApi, getDetailApi, geteqListApi } from '@/api/monitor/monitorInstrument';
import { getImg } from '@/utils/getAssets';
import baseDialog from '@/components/baseDialog/index.vue';
import multInfo from '../monitorEquipment/sheets/multInfo.vue';
import singleInfo from '../monitorEquipment/sheets/singleInfo.vue';
import baselineChart from '../monitorData/dataView/component/baselineChart.vue';
import tableList from '../monitorEquipment/sheets/tableList.vue';
let viewer: Cesium.Viewer;

const baseDialogVisible = ref(false);
const activeName = ref('baseInfo');
const currentData = reactive({
    multiple: true,
    eqData: undefined,
    tableTitle: '',
    eqId: ''
});

const expandData = reactive({
    leftPanel: true,
    rightPanel: true
});

const eqNum = ref<Record<string, any>>({});

getCounterByStatusApi().then((data) => {
    eqNum.value = data ?? {};
});

let areaImagery;
let areaTerrain;
let tileSet;
const points: Cesium.Entity[] = [];
// 区域影像
const setareaImagery = (flag: boolean) => {
    if (flag && !areaImagery) {
        areaImagery = new Cesium.ImageryLayer(
            new Cesium.UrlTemplateImageryProvider({
                url: '/testCes/quyuImgCut/{z}/{x}/{y}.png'
            })
        );
        viewer.imageryLayers.add(areaImagery);
    }

    if (!flag && areaImagery) {
        viewer.imageryLayers.remove(areaImagery);
        areaImagery = null;
    }
};

// 区域地形
const setAreaTerrain = (flag: boolean) => {
    if (flag && !areaTerrain) {
        areaTerrain = new Cesium.CesiumTerrainProvider({
            url: '/testCes/quyuTerrainCut',
            requestWaterMask: true, // 如果需要水掩膜
            requestVertexNormals: true // 如果需要顶点法线
        });
        viewer.terrainProvider = areaTerrain;
    }
    if (!flag && areaTerrain) {
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        areaTerrain = null;
    }
};

// 设置监控设备可见性
const setMonitorVisible = (flag: boolean) => {
    points.forEach((entity) => (entity.show = flag));
};

// 深度测试
const setDeptTest = (flag: boolean) => {
    viewer.scene.globe.depthTestAgainstTerrain = flag;
};

// 倾斜摄影
const loadTileSet = (flag: boolean) => {
    if (flag && !tileSet) {
        tileSet = new Cesium.Cesium3DTileset({
            url: '/testCes/osgbCut/tileset.json',
            maximumMemoryUsage: 512,
            maximumScreenSpaceError: 16
        });
        viewer.scene.primitives.add(tileSet);
    }

    if (!flag && tileSet) {
        viewer.scene.primitives.remove(tileSet);
        tileSet = null;
    }
};

const flyHome = () => {
    const rectangle = new Cesium.Rectangle(
        Cesium.Math.toRadians(107.191286087036),
        Cesium.Math.toRadians(26.4676952362061),
        Cesium.Math.toRadians(107.541990280151),
        Cesium.Math.toRadians(26.7313671112061)
    );

    viewer.camera.setView({
        destination: rectangle
    });
};

const init = () => {
    setareaImagery(true);
    setAreaTerrain(true);
    setMonitorVisible(true);
    setDeptTest(true);
};

const list = reactive<IBaseNavigatorMenu[]>([
    {
        label: '图层管理',
        multible: true,
        selected: ['区域影像', '区域地形', '监测设备'],
        img: getImg('tuceng.png'),
        change(selected) {
            // 区域影像
            setareaImagery(selected.includes('区域影像'));

            // 区域地形
            setAreaTerrain(selected.includes('区域地形'));

            // 倾斜摄影
            loadTileSet(selected.includes('倾斜摄影'));

            // 监测设备
            setMonitorVisible(selected.includes('监测设备'));
        },
        children: [
            {
                label: '区域地形'
            },
            {
                label: '区域影像'
            },
            {
                label: '倾斜摄影'
            },
            {
                label: '监测设备'
            }
        ]
    },
    // { label: '底图切换', multible: true, selected: [], img: getImg('dituqiehuan.png') },
    {
        label: '工具箱',
        img: getImg('gongjuxiang.png'),
        multible: true,
        selected: ['深度测试'],
        change(selected) {
            setDeptTest(selected.includes('深度测试'));
        },
        children: [
            {
                label: '深度测试'
            }
        ]
    },
    // { label: '2D', img: getImg('2Dto3D.png') },
    // { label: '截图', img: getImg('jietu.png') },
    {
        label: '复位',
        selected: [],
        change() {
            flyHome();
        },
        img: getImg('fuwei.png')
    }
]);

const getData = async (id: string) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        const res = await getDetailApi({ id });
        if (!res) return;
        currentData.multiple = res.multiple;
        currentData.tableTitle = res.instrumentType.name;
        currentData.eqId = res.id;
        if (currentData.multiple) {
            currentData.eqData = res.children || [];
        } else {
            currentData.eqData = res || {};
        }

        baseDialogVisible.value = true;
    } finally {
        loading.close();
    }
};

onMounted(() => {
    viewer = new Cesium.Viewer('cesium-containar', ViewerOptions);
    geteqListApi().then((data) => {
        data.forEach((v) => {
            if (v.buryX && v.buryY && v.buryZ) {
                createBillboard(viewer, v, points);
            }
        });

        // init();
    });

    // 点击设备获取详细信息
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e) => {
        const pick = viewer.scene.pick(e.position);

        if (Cesium.defined(pick)) {
            if (pick.id) {
                getData(pick.id.userData.id);
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
