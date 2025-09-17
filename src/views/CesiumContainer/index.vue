<template>
  <div id="cesium-container" class="cesium-container">
    <slot name="map-legend" :mapLoad="mapLoad" ></slot>
    <slot name="map-compass" ></slot>
    <slot name="map-ruler" ></slot>
    <slot name="map-tool" ></slot>
    <slot name="resource-manager" ></slot>
    <slot name="result-manager" ></slot>
    <slot name="search-input" ></slot>
    <slot name="bottom-all" ></slot>
    <slot name="thematic-map-compass" ></slot>
    <slot name="middle-left" ></slot>
    <slot name="info" ></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps } from 'vue';
import { viewerInit } from './helper/ViewerInit';
import {cesiumStore} from './helper/CesiumStore';
import 'cesium/Source/Widgets/widgets.css';

// 定义组件属性
const props = defineProps({
  isBgTransparent: {
    type: Boolean,
    default: false,
  },
  isAutoRotation: {
    type: Boolean,
    default: false,
  },
  isNeedSearchBtn: {
    type: Boolean,
    default: false,
  },
  isOpenDeepChecked: {
    type: Boolean,
    default: false,
  },
  isDisabledUnderGround: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['on-viewer-load']);

// 定义响应式数据
const mapLoad = ref(false);
let viewer = null;
// 组件挂载时逻辑
onMounted(() => {
  viewer = viewerInit(
    'cesium-container',
    props.isBgTransparent,
    props.isNeedSearchBtn
  );

  cesiumStore.setViewer(viewer);
  emit('on-viewer-load', viewer);
  if (props.isOpenDeepChecked) {
    viewer.scene.globe.depthTestAgainstTerrain = true;
  }

  if (props.isDisabledUnderGround) {
    viewer.scene.preRender.addEventListener(() => {
      // 禁止进入地下模式
      viewer.camera._suspendTerrainAdjustment = false;
    });
  }

  // 注册 viewer
  mapLoad.value = true;
});

// 组件卸载前的逻辑
onBeforeUnmount(() => {
  cesiumStore.destroy(); // 清理 cesiumStore
});
</script>

<style lang="scss">
.cesium-container {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  top: 0px;
  width: 100%;
  height: 100%;

  // 搜索框样式
  .cesium-viewer-toolbar {
    display: none;
    left: 100px;
    top: 20px;
    width: 225px;
    background-color: #fff;

    .cesium-viewer-geocoderContainer {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 3px;

      .search-results {
        background: #fff;
        color: #8a8a8a;
      }
    }

    .cesium-geocoder-input {
      width: 210px !important;
      background-color: #fff;
      color: #8a8a8a;
      height: 40px;
      outline: none;
      border: none;
      text-indent: 1em !important;
    }

    .cesium-geocoder-searchButton {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 38px;
      margin-top: 2px;
      fill: #fff;

      svg {
        position: static;
        width: 30px;
        height: 30px;
      }
    }
  }

  &__compass {
    position: absolute;
    // z-index: 199;
    top: 5%;
    right: 25%;
    width: 10%;
    height: 20%;
  }
}
</style>
