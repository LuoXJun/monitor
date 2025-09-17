class CesiumStore {
  constructor() {
    if (!CesiumStore.instance) {
      this.viewer = null
      this.timer = null
      this.sphereRotationTool = null
      CesiumStore.instance = this
      console.log(CesiumStore.instance,'进入CesiumStore instance created')
    }
    console.log(CesiumStore.instance,'CesiumStore instance created')
    return CesiumStore.instance
  }
  setViewer(viewer) {
    this.viewer = viewer
  }

  getViewer() { 
    return this.viewer
  }
  destroy() {
    if (this.viewer && !this.viewer.isDestroyed()) {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.viewer.destroy()
      this.viewer = null
    }

    if (this.sphereRotationTool) {
      this.sphereRotationTool.endRotation()
    }
  }

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  // 设置地球旋转
  setSphereRotationTool(val) {
    this.sphereRotationTool = val
  }

  getSphereRotationTool() {
    return this.sphereRotationTool
  }
}
// 导出单例实例
export const cesiumStore = new CesiumStore()
