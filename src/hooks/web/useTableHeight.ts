/*
 * @Author: Lihongjian binj1219@163.com
 * @Date: 2024-12-31 16:50:59
 * @LastEditors: Lihongjian binj1219@163.com
 * @LastEditTime: 2024-12-31 16:51:10
 * @FilePath: \BD-ui\src\hooks\web\useTableHeight.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useTableHeight(options: {
  extraHeight?: number // 额外需要减去的高度
  padding?: number    // 自定义padding值
} = {}) {
  const tableHeight = ref(0)

  const calculateTableHeight = () => {
    const topToolHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--top-tool-height')
    )
    const tagsViewHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--tags-view-height') 
    )
    const footerHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--app-footer-height')
    )
    const formHeight = document.querySelector('.el-form')?.offsetHeight || 0
    const tabsHeight = document.querySelector('.el-radio-group')?.offsetHeight || 0
    const paginationHeight = 32
     const tableFormHeight = 90
    const padding = options.padding ?? 100

    tableHeight.value = 
      window.innerHeight -
      tableFormHeight -
      topToolHeight -
      tagsViewHeight - 
      footerHeight -
      formHeight -
      tabsHeight -
      paginationHeight -
      padding -
      (options.extraHeight || 0)
  }

  onMounted(() => {
    calculateTableHeight()
    window.addEventListener('resize', calculateTableHeight)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', calculateTableHeight)
  })

  return {
    tableHeight,
    calculateTableHeight
  }
} 
