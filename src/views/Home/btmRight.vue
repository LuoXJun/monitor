
<template>
  <div class="btm-left" :style="dashboardConfig?.taskCount?.style">
    <div class="top-box">
      <div class="title">任务数量</div>
    </div>
    <!-- 筛选框 -->
     <el-form class="form-warp">
      <el-form-item label="工程名称">
        <el-tree-select
          v-model="formData.projectId"
          :data="projectList"
          :default-expanded-keys="[0]"
          :props="defaultProps2"
          check-strictly
          clearable
          style="width: 182px"
          node-key="id"
          @change="fetchTaskCount"
        />
        <!-- <el-select  style="width: 182px;"  v-model="formData.projectId" >
          <el-option :label="item.projectName" value="date" v-for="(item,index) in projectList" :key="index"  />
        </el-select> -->
      </el-form-item> 
      <el-form-item label-width="58px" v-show="businessType !== 'flw_cl_'" label="材料" >
        <el-tree-select
        :disabled="!!materialTypeId"
        v-model="formData.materialType"
        :data="matertiralList"
        :default-expanded-keys="[0]"
        :props="defaultProps"
        check-strictly
        node-key="id"
        clearable
        style="width: 182px;"
        @check="handleCheck"
        @node-click="handleMatertiralChange"
        @change="data => {
          if(!data){
            formData.materialType = ''
            matertiralName = ''
            fetchTaskCount()
          }
        }"
      />
        <!-- <el-select :value="valueTitle" :clearable="clearable" @clear="clearHandle" style="width: 182px;">
          <el-option :value="valueTitle" :label="valueTitle">
          <el-tree
          id="tree-option"
          ref="selectTree"
          :accordion="accordion"
          :data="options"
          :props="props"
          :node-key="props.value"
          :default-expanded-keys="defaultExpandedKey"
          @node-click="handleNodeClick"/>
          </el-option>
          </el-select> -->
      </el-form-item>
      <el-form-item label="时间区间" label-width="88px">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px;"
          @change="fetchTaskCount"/>
      </el-form-item>
     </el-form>
     <!-- 材料总数 -->
      <!-- <div class="total">{{ matertiralName }}任务总数 <span class="ml-10px">{{taskCount}}</span></div> -->
     <!-- 多组数据柱状图 -->
    <div class="chart-warp" > 
        <div class="chart" ref="chartRef"> </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { useWorkbench } from '@/hooks/web/useWorkbench'
import { useEmitt } from '@/hooks/web/useEmitt'
import { getTaskQuantityState } from '@/api/home'
import * as ItemApi from '@/api/itemManage'
import * as InspectionItemApi from '@/api/inspectionItem'

const CONSTANTS = {
  WEEK_MAP: {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    7: '周日'
  },
  TIME_DIMENSIONS: [
    { key: 'week', statType: 1, name: '本周' },
    { key: 'month', statType: 2, name: '本月' },
    { key: 'year', statType: 3, name: '本年' }
  ],
  //CHART_COLORS: ['#29aadf','#1dffd4','#f1d53c','#ffad5c','#34da62','#00e9db','#00c0e9','#0096f3'],
  CHART_COLORS: ['rgb(85, 108, 149)','rgb(111, 175, 175)','rgb(184, 153, 56)','rgb(200, 200, 200)'],
  LABEL_LIST: ['总任务','通过','未通过','取消']
}

const projectList = ref([])
const matertiralList = ref([]) // 树形结构
const matertiralName = ref('')
const dateRange = ref([])
const taskCount = ref(0)
const props = defineProps({
  dashboardConfig: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const defaultProps2 = {
  children: 'children',
  label: 'projectName'
}
const defaultProps = {
  children: 'children',
  label: 'materialName'
}
const formData = ref({
  id: undefined,
  projectId: undefined,
  examineProjectId: undefined,
  materialType: '',
  examineName: '',
  measure: '',
  attachment: ''
})

const businessType = ref(props.dashboardConfig?.query.businessType)
const activeName = ref(CONSTANTS.TIME_DIMENSIONS[0].key)
const statType = ref(CONSTANTS.TIME_DIMENSIONS[0].statType)
const chartRef = ref(null)
const chartRef1= ref(null)
const chartRef2 = ref(null)
const chartRef3 = ref(null)
const chartXAxisData = ref([])
const chartSeriesData = ref([])
let chartInstance = null
watch(
  () => props.dashboardConfig,
  (value) => {
    businessType.value = value.flwTag
    fetchTaskQuantityState()
    fetchTaskCount()
    value.flwTag !== 'flw_cl_' && getTree()
  }
)

const chartData = {
  xAxisData: ref([]),
  seriesData: ref([]),
}



const initChart = () => {
  chartInstance?.dispose?.()
  const option = {
    legend: { 
      orient: 'vertical', // 设置图例为水平排列
      right: 10, // 图例位置在底部
      itemWidth: 10, // 图例项的宽度
      itemHeight: 10, // 图例项的高度
      textStyle: {
        fontSize: 12, // 图例文本大小
      },
      icon:'circle', // 设置图例项为圆形
      itemGap: 40, // 增加图例项之间的间距
      data: CONSTANTS.LABEL_LIST, // 图例数据
     
    },
    grid: {
      top: '50',
      left: '30', // 修改左边距
      right: '100', // 添加右边距
      bottom: '40', // 添加底部边距
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData.xAxisData.value,
      axisTick: { 
        show: true,
      },
      boundaryGap: true,
      axisLabel: {
        interval: 0,
        backgroundColor: 'rgb(232, 243, 255)',
        color: 'rgb(67, 140, 220)',
        fontSize: 12,
        align: 'center',
        width: 230,
        overflow: 'break',
        padding: [5, 10, 5, 10],
        margin:40,
         // 调整轴线位置
        offset: 40, // 整个X轴向下偏移10px
        // 强制保留空间
        axisTick: {
          length: 20 // 刻度线长度增大留出空间
        }
        
      },
      axisLine: { show: true,
        lineStyle: {
          type: 'solid',
          color: '#999',
          width: 1,
          shadowColor: 'rgba(0, 0, 0, 0.2)', // 添加阴影
          shadowBlur: 4,
          shadowOffsetY: 0
        }
       }
    },
    
    yAxis: {
      type: 'value',
      interval:2,
      max:20,
      splitLine: {
        lineStyle: { color: '#DEE4EB', type: 'dashed' }
      },
    },

    series: chartData.seriesData.value.map((data, index) => [
      {
      name: CONSTANTS.LABEL_LIST[index],
      data: data,
      type: 'pictorialBar',
      symbol: 'rect',
      symbolRepeat: false,
      symbolMargin: 2,
      symbolClip: true,
      symbolSize: ['100%', '100%'],
      symbolPosition: 'start',
      symbolOffset: [
        -90 + index * 60, 
        0
      ],
      label: {
        normal: {
          show: true,
          position: 'bottom', // index === 3 ? 'insideTop' : 'top',
          formatter: param => {
            return `${CONSTANTS.LABEL_LIST[index]}`
          },
          offset: [
            -90 + index * 60,  // x轴偏移,与symbolOffset保持一致
            10  // y轴向上偏移10个单位
          ],
          color: 'rgb(134, 144, 156)'
        },
      },
      
      barWidth: 20,
      itemStyle: { normal: { color: CONSTANTS.CHART_COLORS[index] } },
    },
    {
      type: 'pictorialBar',
    data: data,
    barGap: '-100%', // 与原系列重叠
    itemStyle: { normal: { color: 'transparent' } },
    label: {
      normal: {
        show: true,
        position: 'left',
        formatter: param => `${param.value}`, // 显示数值
        offset: [-90 + index * 60, -5], // 垂直方向偏移调整
        color: CONSTANTS.CHART_COLORS[index],
        fontSize: 12,
        fontWeight: 'bold'
      }
    },
    symbol: 'rect',
    symbolSize: ['100%', '100%'],
    barWidth: 20
    }
  ]).flat(),

    dataZoom: [
      {
        type: "slider",
        show: false,
        startValue:0,
        endValue: 2,
        bottom: 0, //居下的距离
        // width: 10,
        height:5,
        textStyle: {
          color: "#FFF",
          fontSize: 9,
        },
        fillerColor: "rgba(25, 105, 226, 0.6)",
        handleIcon: //两侧缩放手柄的 icon 形状，支持路径字符串
            "path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5M36.9,35.8h-1.3z M27.8,35.8 h-1.3H27L27.8,35.8L27.8,35.8z", // 画一个圆形
        handleSize: "80%",
        handleStyle: {
          color: "rgba(25, 105, 226, 0.6)",
          borderWidth: 0,
        },
        backgroundColor: "rgba(38, 108, 252, 0.2)", //两边未选中的滑动条区域的颜色
        showDetail: false, //是否显示detail，即拖拽时候显示详细数值信息。
        borderColor: "transparent",
        filterMode: "empty",
        brushSelect: false, // 是否开启刷选功能。在下图的 brush 区域你可以按住鼠标左键后框选出选中部分。
        zoomLock: true, 
      }
    ]
  }

  chartInstance = echarts.init(chartRef.value)
  chartInstance?.setOption?.(option)
}



const handleStatTypeChange = (tab) => {
  const target = CONSTANTS.TIME_DIMENSIONS.find((ite) => ite.key === tab)

  if (target) {
    statType.value = target.statType
    fetchTaskQuantityState()
  }
}

const fetchTaskQuantityState = async () => {
  const query = { statType: statType.value, ...props.dashboardConfig?.query }
  const res = await getTaskQuantityState(query)
  const data = res.data ?? []
  const xData = []
  const sData = []

  res?.data?.forEach?.((element) => {
    let xName = xData.push(
      res?.statType === 1 ? CONSTANTS.WEEK_MAP[element.dimension] : element.dimension
    )
    sData.push(element.taskQuantity)
  })
  chartXAxisData.value = xData
  chartSeriesData.value = sData

  initChart()
}

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    chartInstance?.resize?.()
  }
})

const handleAddEvent = () => {
  fetchTaskQuantityState()
}

const { emitter } = useEmitt({ name: 'task:refresh', callback: handleAddEvent })
const getProjectTree = async () => {
  // const data = await ItemApi.getTreeList({'level':2})
  const data = await ItemApi.getTreeList({ projectType: 0 })
  projectList.value = data
}
const getTree = async () => {
  let params = {
    businessType: businessType.value == 'flw_jc_' ? 1 : businessType.value == 'flw_wt_' ? 2 : null
  }
  const resData = await InspectionItemApi.getMaterialTreeList(params)
  // 使用递归函数设置 disabled 属性
  setDisabled(resData);
  matertiralList.value = resData
}

// 遍历列表，递归设置没有 children 或者 children 为空数组的项为 disabled
const setDisabled = (items) => {
  items.forEach(item => {
    item.disabled = !item.children || item.children.length === 0;
    if (item.children) {
      setDisabled(item.children); // 递归调用
    }
  });
}

const fetchTaskCount = async () => {
  if(businessType.value == 'flw_cl_' && (!dateRange.value || dateRange.value.length === 0)){
    dateRange.value = [
      dayjs().subtract(30, 'days').format('YYYY-MM-DD'), 
      dayjs().format('YYYY-MM-DD')
    ]
  }
  try {
    const param = {
      projectId: formData.value.projectId,
      materialId: formData.value.materialType,
      startTime: dateRange.value?.[0] || '',
      endTime: dateRange.value?.[1] || '',
      ...props.dashboardConfig?.query
    }
    
    const res = await ItemApi.getTaskCount(param)
    if (!res?.data) return
    
    const { xData, totalData,doneData, undoneData, runningData, cancelData } = processTaskCountData(res.data)
    
    chartData.xAxisData.value = xData
    chartData.seriesData.value = [totalData,doneData, undoneData, cancelData]
    taskCount.value = res.data.reduce((sum, item) => sum + item.totalQuantity, 0)
    initChart()
  } catch (error) {
    console.error('获取任务数量失败:', error)
  }
}

const processTaskCountData = (data) => {
  const xData = []
  const totalData = []
  const doneData = []
  const undoneData = []
  const runningData = []
  const cancelData = []
  
  data.forEach(item => {
    const dimension = businessType.value === 'flw_cl_' 
      ? item.dimension 
      : item.materialCategory
    xData.push(dimension)
    totalData.push(item.totalQuantity)
    cancelData.push(item.totalQuantityCancel)
    doneData.push(item.totalQuantityDone)
    runningData.push(item.totalQuantityRunning)
    undoneData.push(item.totalQuantityUndone)
  })
  
  return { xData, totalData,doneData, undoneData, runningData, cancelData }
}

const handleMatertiralChange = (data) => {
  if(data.disabled) return
  matertiralName.value = data.materialName
  formData.value.materialType = data.id
  fetchTaskCount()
}

onMounted(() => {
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }
  fetchTaskQuantityState()
  getProjectTree()
  businessType.value !== 'flw_cl_' && getTree()
  fetchTaskCount()
  initChart()
})


onUnmounted(() => {
  if (chartRef.value) {
    resizeObserver.unobserve(chartRef.value)
  }

  if (chartInstance) {
    chartInstance.dispose()
  }
  
})
</script>

<style lang="scss" scoped>
.btm-left {
  width: 60%;
  height: 420px;
  background: #fff;
  border-radius: 4px;
  

  .top-box {
    display: flex;
     
    justify-content: space-between;
    align-items: center;
    position: relative;

    .title {
      
    width: 384px;
    font-family: 'HarmonyOS Sans SC';
    font-size: 16px;
    color: #191B1C;
    font-weight: 700;
    height: 32px;
    padding-left: 10px;
    margin-left: 10px;
    margin-top: 10px;
    background: url('../../assets/imgs/myUpdate/titleReg.svg') no-repeat 0% center;
    line-height: 32px;
    margin-bottom: 10px;
    }


    .tabs {
      
      margin-right: 16px;
    }
  }

  .chart {
    width: 100%;
    height: 300px;
  }
}
::v-deep .el-radio-button.is-active .el-radio-button__original-radio:not(:disabled)+.el-radio-button__inner{
  background:rgba(37,89,236,1);
}
::v-deep .el-select__wrapper{
  box-shadow: 0 0 0 1px #E8E9EB inset;
}
.form-warp{
  display: flex;
  align-items: center;
  margin-top: 18px;
  margin-left: 30px;
}
::v-deep .el-form-item__label{
  color: rgb(9, 15, 25);
}
.chart-warp{
  width: 100%;
  display: flex;
  .chart{
    min-width: 100%;
    overflow-x: auto;
  }
   
}
.total{
  border: 1px solid #ecae25;
  background-color: rgba(236,174, 37,0.1);
  color: #ecae25;
  border-radius: 2px;
  padding: 5px 10px;
}

</style>
