<template>
  <div class="bg">
    <!-- <div v-if="isAdmin" class="tab-wrap">
      <div
        v-for="tab in TABS_CONFIG"
        :key="tab.key"
        :class="['d-tab', { active: activeTabKey === tab.key }]"
        @click="handleTabClick(tab.key)"
      >
        {{ tab.name }}
      </div>
      
    </div>
    <el-alert
      v-else-if="config?.data?.showNoPermission"
      :closable="false"
      message="Task distribution"
      title="您所登录的账号暂无权限查看该模块"
      type="warning"
    /> -->

    <template v-if="bimBool">
      <CesiumContainer
        @on-viewer-load="onViewerLoad"
        :isBgTransparent="false"
        :isAutoRotation="false"
      />
    </template>
    <template v-else>
      <top :dashboardConfig="config.data" />
      <div class="center">
        <centerLeft :dashboardConfig="config.data" />
        <centerRight :dashboardConfig="config.data" />
      </div>
      <div class="btm">
        <btmLeft v-if="config?.data?.taskDist?.show" :dashboardConfig="config.data" />
        <btmRight  :dashboardConfig="config.data" />
      </div>
    </template>
    <div style="position: relative">
      <PopupContent v-bind="popupProps" />
    </div>
  </div>
</template>
<script setup>

import { ref, onMounted } from 'vue'
import { useWorkbench } from '@/hooks/web/useWorkbench'
import top from './top.vue'
import centerLeft from './centerLeft.vue'
import centerRight from './centerRight.vue'
import btmLeft from './btmLeft.vue'
import btmRight from './btmRight.vue'
// ceisum模块
import * as Cesium from 'cesium'
import CesiumContainer from '../CesiumContainer/index.vue'
import PopupContent from '@/views/CesiumContainer/component/PopupContent.vue'
import * as HomeApi from '@/api/home'
import { updatePopupPosition } from '../CesiumContainer/helper/popup.js'
// 修改参数获取方式
import { useRoute } from 'vue-router'

const route = useRoute()


const TABS_CONFIG = [
  {
    key: 'jc',
    name: '试验中心'
  },
  {
    key: 'wt',
    name: '物探中心'
  },
  {
    key: 'cl',
    name: '测量中心'
  },
  {
    key: 'data',
    name: '数字场景'
  }
]

const { isAdmin, dashboardConfig, updateConfigKey } = useWorkbench()

const activeTabKey = ref('jc')
const config = reactive({ data: {} })
const bimBool = ref(false)
const position = ref({ bottom: '0px', left: '0px' })
const displayBool = ref(false)
const title = ref('')
const tableData = ref([])
const popupProps = computed(() => ({
  position: position.value,
  displayBool: displayBool.value,
  title: title.value,
  tableData: tableData.value
}))

watch(
  () => dashboardConfig.data,
  (value) => {
    config.data = value
  },
  { deep: true, immediate: true }
)

const handleTabClick = (key) => {
  displayBool.value = false
  bimBool.value = false
  activeTabKey.value = key
  if (key == 'data') {
    bimBool.value = true
    return
  }
  updateConfigKey(key)
}
// 初始化时读取query参数
const initFromQuery = () => {
  const tabKey = route.path.split('/')[2]
  if (tabKey && TABS_CONFIG.some(tab => tab.key === tabKey)) {
    handleTabClick(tabKey)
  }
}

//监听query参数变化
// watch(
//   () => route.query.key,
//   (newKey) => {
//   console.log('🚀 ~ initFromQuery ~ route:', route.path.split('/')[1],route.path);
//     if (newKey && TABS_CONFIG.some(tab => tab.key === newKey)) {
//       handleTabClick(route.path.split('/')[2])
//     }
//   }
// )
onMounted(() => {
  initFromQuery()
})

// 视图加载时的回调
const onViewerLoad = (viewer) => {
  viewer.scene.globe.depthTestAgainstTerrain = false // 设置深度测试
  // 加载上水库系统模型
  const upperReservoir = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: '/202412201512024296/tileset.json'
    })
  )
  upperReservoir.readyPromise.then((titleset) => {
    titleset._properties = {
      label: '上水库系统',
      id: '1859797674513670145'
    }
  })
  // 加载下水库系统模型
  const lowerReservoir = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: '/202412301443130848/tileset.json'
    })
  )
  lowerReservoir.readyPromise.then((titleset) => {
    titleset._properties = {
      label: '下水库系统',
      id: '1859798677937987586'
    }
  })
  const tileset01 = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: '/202412201511012209/tileset.json'
    })
  )
  tileset01.readyPromise.then((titleset) => {
    titleset._properties = {
      label: '发电厂房与输水系统',
      id: '1859798076747423745'
    }
  })
  viewer.zoomTo(tileset01)
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((event) => {
    const pickedFeature = viewer.scene.pick(event.position)
    if (!pickedFeature) {
      displayBool.value = false
      return
    }
    const tempPosition = pickedFeature.primitive.boundingSphere.center
    // 转换为 Cartographic
    const cartographic = Cesium.Cartographic.fromCartesian(tempPosition)
    // 提取经纬度和高度
    const longitude = Cesium.Math.toDegrees(cartographic.longitude) // 转换为度
    const latitude = Cesium.Math.toDegrees(cartographic.latitude) // 转换为度
    const height = cartographic.height // 高度
    const pos = Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 1000)

    title.value = pickedFeature.tileset._properties.label
    tableData.value = []
    HomeApi.getReportList({ projectId: pickedFeature.tileset._properties.id }).then((res) => {
      console.log(res.data, 'res.data[0]')
      tableData.value.push({
        检测总数: res.data[0].totalCount,
        未通过次数: res.data[0].noPassCount,
        通过次数: res.data[0].passCount,
        正在检测次数: res.data[0].doingCount
      })
      const windowPosition = new Cesium.Cartesian2()
      Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pos, windowPosition)
      position.value.bottom = `${viewer.scene.canvas.height - windowPosition.y}px`
      position.value.left = `${windowPosition.x}px`
      displayBool.value = true
      viewer.camera.percentageChanged = 0.01
      viewer.camera.changed.addEventListener(() => {
        updatePopupPosition(viewer, tempPosition, (newPosition) => {
          position.value = newPosition
        })
      })
    })
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}
</script>

<style lang="scss" scoped>
.container {
  // min-width: 1285px;
}

.center {
  display: flex;
  margin-top: 20px;
}

.btm {
  display: flex;
  margin-top: 20px;
}

.tab-wrap {
  display: flex;
  width: 100%;
  padding-top: 35px;
  //margin-bottom: 24px;
  border-bottom: 1px solid #e8e9eb;
  justify-content: start;
  align-items: center;
 // background-color: #fff;
}

.d-tab {
  display: flex;
  padding-bottom: 8px;
  font-family: PingFangSC-Medium;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.28px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease-in-out;
  justify-content: start;
  align-items: center;

  &:not(:first-child) {
    margin-left: 60px;
  }

  &.active {
    color: #2559ec;
    border-bottom-color: #2559ec;
  }
}

.bg {
  position: relative;
  top: -15px;
  left: -15px;
  width: 101%;
  height: 100%;
  padding: 0 16px;
  // background: url('../../assets/imgs/bg.png') no-repeat;
  // background-color: gray;
  background-size: 100% 100%;
}

.cesium-container {
  width: 100%;
  height: 80vh;
}
</style>
