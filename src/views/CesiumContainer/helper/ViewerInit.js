import defaultOption from './ViewerOptions'
import SkyBoxOnGround from './skyBoxRepiar'
import positiveX from '@/assets/imgs/skybox/px.png';
import negativeX from '@/assets/imgs/skybox/nx.png';
import positiveY from '@/assets/imgs/skybox/py.png';
import negativeY from '@/assets/imgs/skybox/ny.png';
import positiveZ from '@/assets/imgs/skybox/pz.png';
import negativeZ from '@/assets/imgs/skybox/nz.png';
import * as Cesium from 'cesium'

/**
 * 球体初始化并加载GeoJSON数据
 * @param {String} containerId - 容器ID
 * @param {Boolean} isBgTransparent - 是否背景透明
 * @param {Boolean} isNeedSearchBtn - 是否需要搜索按钮
 * @param {Object} options - 其他Viewer选项
 * @param {Object} geojson - GeoJSON数据
 */
export const viewerInit = function (containerId, isBgTransparent, isNeedSearchBtn = true, options) {
  // 合并用户自定义选项
  options && Object.assign(defaultOption, options)

  // 如果背景透明，设置相关选项
  isBgTransparent &&
    Object.assign(defaultOption, {
      contextOptions: {
        webgl: {
          alpha: true
        }
      }
    })

  // 设置是否需要搜索按钮
  Object.assign(defaultOption, {
    geocoder: isNeedSearchBtn
  })

  // 初始化Viewer
  let viewer = new Cesium.Viewer(containerId, defaultOption)

  // 初始化场景
  viewer.scene.skyBox.show = true //是否显示星空
  viewer.scene.sun.show = false //是否显示太阳
  viewer.scene.moon.show = false //是否显示有月亮
  viewer.scene.globe.depthTestAgainstTerrain = false //地形深度检测
  viewer.scene.globe.showGroundAtmosphere = true //大气层
  viewer.scene.fog.enabled = true //是否启用雾
  viewer.scene.postProcessStages.fxaa.enabled = true //后处理
  viewer.scene.fxaaEnabled = true //是否启用FXAA
  viewer.scene.verticalExaggeration = 5.0
  viewer._cesiumWidget._supportsImageRenderingPixelated =
    Cesium.FeatureDetection.supportsImageRenderingPixelated()
  viewer._cesiumWidget._forceResize = true
  // 如果背景透明，隐藏天空盒并设置背景颜色
  if (isBgTransparent) {
    viewer.scene.skyBox.show = false
    viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0)
  }
  if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    let vtxfDpr = window.devicePixelRatio
    // 适度降低分辨率
    while (vtxfDpr >= 2.0) {
      vtxfDpr /= 2.0
    }
    viewer.resolutionScale = vtxfDpr
  }
  

viewer.scene.skyBox = new SkyBoxOnGround({
  sources: {
    positiveX: positiveX,
    negativeX: negativeX,
    positiveY: positiveY,
    negativeY: negativeY,
    positiveZ: positiveZ,
    negativeZ: negativeZ
  }
});

//  加载默认地形
 viewer.terrainProvider = Cesium.createWorldTerrain({
  requestWaterMask: true, // 请求水掩膜以实现水体效果
  requestVertexNormals: true // 请求法线以实现光照效果
});
// viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
//   url: 'http://data.mars3d.cn/terrain'
// })  

  // 移除双击事件
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  )

  // 隐藏归因控件
  viewer.cesiumWidget.creditContainer.style.display = 'none'
  // 开启帧率
  viewer.scene.debugShowFramesPerSecond = true
  // viewer.imageryLayers.remove(viewer.imageryLayers.get(0)) // 清除默认地形

  // 设定初始视角
  let initialView = {
    longitude: 101.297516,
    latitude: 29.483168,
    height: 1037484.97452,
    heading: 350,
    pitch: -58,
    roll: 0.0,
    maximumZoomDistance: 631047.744387,
    heightOffset: 40 //高度偏移
  }

  // 设定初始视角
  const center = Cesium.Cartesian3.fromDegrees(
    initialView.longitude,
    initialView.latitude,
    initialView.height
  )
  const heading = Cesium.Math.toRadians(initialView.heading)
  const pitch = Cesium.Math.toRadians(initialView.pitch)

  viewer.camera.setView({
    destination: center,
    orientation: {
      heading: heading,
      pitch: pitch
    }
  })

  return viewer
}
