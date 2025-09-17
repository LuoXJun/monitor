import * as Cesium from "cesium"
Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NzE3NGI3OC1jYjkwLTQ0NzYtYTJhMS05MmI3NzZjZGYyYTMiLCJpZCI6MTIzNjIsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjA5Mjg5NDF9.zh6Qq8VVlcyWL5tKR8OSrrPvU9DuMipxuKtporndooA'

export default {
  geocoder: false, //是否显示geocoder小器件，右上角查询按钮
  homeButton: false, //是否显示Home按钮
  sceneModePicker: false, //是否显示3D/2D选择器
  fullscreenButton: false,
  vrButton: false, //VR模式
  baseLayerPicker: false, //是否显示图层选择器
  infoBox:false , //是否显示信息框
  selectionIndicator: false,
  animation: false, //是否创建动画小器件，左下角仪表
  timeline: false, //是否显示时间轴
  shouldAnimate: true,//是否显示动画
  navigationHelpButton: false, //是否显示右上角的帮助按钮
  navigationInstructionsInitiallyVisible: false,
  mapProjection: new Cesium.WebMercatorProjection(),
  scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
  // geocoder:true,//查询
  sceneMode: 3, //初始场景模式 1 2D模式 2 2D循环模式 3 3D模式
  showRenderLoopErrors: true, //如果设为true，将在一个HTML面板中显示错误信息
  shadows: true ,//阳光下的阴影效果
}
