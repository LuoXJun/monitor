export const useLuckySheetTool = () => {
  const exitLuckySheet = () => {
    window.luckysheet?.exitEditMode?.()
    const luckysheetMoreBtnDiv = document.getElementById('luckysheet-icon-morebtn-div')
    if (luckysheetMoreBtnDiv) {
      luckysheetMoreBtnDiv.style.visibility = 'hidden'
    }

    const luckysheetSliderImageCtrl = document.getElementById(
      'luckysheet-modal-dialog-slider-imageCtrl'
    )
    if (luckysheetSliderImageCtrl) {
      luckysheetSliderImageCtrl.style.display = 'none'
    }
  }

  return {
    exitLuckySheet
  }
}
