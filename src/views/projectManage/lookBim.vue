<template>
  <div class="look-page">
    <div class="canvas-container" ref="canvasDom"> </div>
    <div class="box">
      <div class="select">
        <el-button @click="close"> 关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader' //加载模型
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' //减压模型
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
let controls
const colors = ref(['red', 'blue', 'green', 'gray', 'purple'])
const canvasDom = ref(null)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// camera.position.set(-50, 50, 150)

camera.position.set(1, 0, 0)
const renderer = new THREE.WebGLRenderer({
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
const render = () => {
  requestAnimationFrame(render)

  renderer.render(scene, camera)
}

onMounted(() => {
  canvasDom.value.appendChild(renderer.domElement)

  renderer.setClearColor('#000')
  scene.background = new THREE.Color('#ccc')
  scene.environment = new THREE.Color('#ccc')
  render()

  //添加网格地面
  // const gridHelper = new THREE.GridHelper(10, 10)
  // gridHelper.material.opacity = 0.2
  // gridHelper.material.transparent = true
  // scene.add(gridHelper)

  //添加控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.update()
  // //初始化减压模型
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('./draco/')

  //初始化加载模型
  const loader = new GLTFLoader()
  loader.setDRACOLoader(dracoLoader) //设置解码器
  // http://101.126.77.103:9000/sandfile/fe983b740e44f3647eb98da4ba0b808b20530cccc6f6b4e1845168d49a892d96.gltf
  //101.126.77.103:9000/sandfile/33f63078d871cb4a881c2a4fced2dc34c184ad7b8aaaf4e7c9165344207085da.glb
  http: loader.load(
    'http://101.126.77.103:9000/sandfile/fe983b740e44f3647eb98da4ba0b808b20530cccc6f6b4e1845168d49a892d96.gltf',
    // 'http://10.10.11.129:48080/admin-api/infra/file/4/get/60f78c4a48522630ba1a65f6efe53ee761c756ef3ffc7e8c6f781c79911c79a3.glb',
    (gltf) => {
      const model = gltf.scene
      scene.add(model)
    }
  )

  //添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2)
  directionalLight1.position.set(0, 0, 10)
  scene.add(directionalLight1)
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight2.position.set(0, 0, -10)
  scene.add(directionalLight2)
  const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight3.position.set(10, 0, 0)
  scene.add(directionalLight3)
  const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight4.position.set(-10, 0, 0)
  scene.add(directionalLight4)
  const directionalLight5 = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight5.position.set(0, 10, 0)
  scene.add(directionalLight5)

  const directionalLight6 = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight6.position.set(5, 10, 0)
  scene.add(directionalLight6)

  const directionalLight7 = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight7.position.set(0, 10, 5)
  scene.add(directionalLight7)

  const directionalLight8 = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight8.position.set(0, 10, -5)
  scene.add(directionalLight8)
})

const emit = defineEmits(['close'])
const close = () => {
  emit('close')
}
</script>

<style>
.look-page {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100vw;
  height: 100vh;
}

.canvas-container {
  width: 100%;
  height: calc(100% - 50px);
}

.box {
  position: fixed;
  top: 10px;
  right: 30px;
  height: 50px;
}

.select {
  display: flex;
}

.box-item {
  width: 50px;
  height: 50px;
  margin-right: 20px;
  border-radius: 10px;
}
</style>
