<template>
  <div id="cesium-containar">
    <div class="content">
      <div class="left">
        <div v-for="i in 3" :key="i"></div>
      </div>
      <div class="right">
        <div v-for="i in 3" :key="i"></div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium'
import ViewerOptions from './ViewerOptions';
let viewer;
onMounted(() => {
  // viewer = new Cesium.Viewer('cesium-containar', ViewerOptions)
})

</script>

<style lang="scss">
#cesium-containar {
  height: 100%;
  overflow: hidden;

  >div {
    width: 100vw;
    height: 100%;
    display: flex;
    justify-content: space-between;

    >.left,
    >.right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      >div {
        background-color: red;
        height: 250px;
        width: 300px;
      }
    }
  }

  .cesium-widget-credits {
    display: none;
  }
}

section {
  height: 770px;
  padding: 0 !important;
}
</style>
