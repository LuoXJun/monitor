import * as Cesium from "cesium"
export const  updatePopupPosition=async (viewer, tempPosition,cb)=> {
  console.log(tempPosition,"tempPosition")
  const position={bottom:0,left:0}
  const windowPosition = new Cesium.Cartesian2()
  await Cesium.SceneTransforms.wgs84ToWindowCoordinates(
    viewer.scene,
    tempPosition,
    windowPosition
  )
  position.bottom = `${viewer.scene.canvas.height - windowPosition.y}px`
  position.left = `${windowPosition.x}px`
  cb(position)
}