<template>
  <div class="btm-right">
    <div class="title">任务分布</div>
    <div class="myChartContainer">

      <div class="chart" ref="chartRef"></div>
    </div>
    <div class="info">
      <div v-for="item in chartData" :key="item.name" class="item">
        <p>{{ item.name }}</p>
        <p>{{ item.value }}<span>个</span></p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getTaskDistribution } from '@/api/home'
import { TASK_TYPE_MAP } from '@/constants/sampleTask'

const props = defineProps({
  dashboardConfig: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const chartRef = ref(null)
const chartData = ref([])
const statData = ref({})
let chartInstance = null

watch(
  () => props.dashboardConfig,
  (value) => {
    fetchTaskDistribution()
  },
  { deep: true }
)

const colorData = [
  'rgba(55,194,253,',
  'rgba(67,252,170,',
  'rgba(252,132,30,',
  'rgba(63,126,252,'
]

const initChart = () => {
  chartInstance?.dispose?.()
  // const options = {
  //   tooltip: {
  //     trigger: 'item'
  //   },
  //   title: [
  //     {
  //       text: `{name|任务完成率}\n{val|${((statData.value.completionRate ?? 0) * 100).toFixed(2)}%}`,
  //       top: 'center',
  //       left: 120,
  //       textStyle: {
  //         rich: {
  //           name: {
  //             fontSize: 14,
  //             color: '#000000',
  //             padding: [4, 1]
  //           },
  //           val: {
  //             fontSize: 20,
  //             fontWeight: 500,
  //             padding: [8, 8],
  //             color: '#000000'
  //           }
  //         }
  //       }
  //     }
  //   ],
  //   legend: {
  //     //图例设置
  //     //   data: ["14", "3", "4"],
  //     type: 'scroll',
  //     right: '20px',
  //     top: 'middle',
  //     bottom: 20,
  //     itemHeight: 10,
  //     itemWidth: 10,
  //     orient: 'vertical', //垂直
  //     itemGap: 12, //图例之间间距
  //     textStyle: {
  //       //数据右对齐样式
  //       color: '#00B4FF',
  //       fontSize: 14
  //     },
  //     formatter(name) {
  //       let str = ''
  //       chartData.value.forEach((item) => {
  //         if (item.name == name) {
  //           return (str = `${item.name}    ${item.value}`)
  //         }
  //       })
  //       return str
  //     }
  //   },
  //   series: [
  //     {
  //       // name: '任务占比',
  //       type: 'pie',
  //       center: [165, '50%'], //饼图位置
  //       radius: ['52%', '72%'], //圆环大小
  //       avoidLabelOverlap: false,
  //       emphasis: {
  //         label: {
  //           show: false,
  //           fontSize: 40,
  //           fontWeight: 'bold'
  //         }
  //       },
  //       labelLine: {
  //         show: false
  //       },
  //       label: {
  //         show: false,
  //         fontSize: 8,
  //         color: '#fff'
  //       },
  //       data: chartData.value,
  //       itemStyle: {
  //         normal: {
  //           color: function (params) {
  //             // 预定义一个颜色数组
  //             var colorList = [
  //               '#95D475',
  //               '#F9DB81',
  //               '#1AC5FF',
  //               '#FFB200',
  //               '#FF6500',
  //               '#661C05',
  //               '#001F7F',
  //               '#0442FA',
  //               '#007FFF',
  //               '#911AFF',
  //               '#501AFF',
  //               '#1AFFD7'
  //             ]
  //             // 返回每个饼图扇区的颜色
  //             return colorList[params.dataIndex % colorList.length]
  //           }
  //         }
  //       }
  //     }
  //   ]
  // }


  const inRing = chartData.value.map((item, index) => {
    const newItem = JSON.parse(JSON.stringify(item));
    newItem.itemStyle = {
      color: colorData[index] + '0.2)'
    };
    return newItem;
  });
  const outRing = chartData.value.map((item, index) => {
    const newItem = JSON.parse(JSON.stringify(item));

    //  newItem.itemStyle = {
    //     //color: ['red','yellow']
    //     // color:{
    //     //   colorStops:[{
    //     //     offset: 0,
    //     //     color:'red'
    //     //   }, {
    //     //     offset: 1,
    //     //     color: 'yellow'
    //     //   }]
    //     // }
    //   };
    return newItem;
  });


  const options = {
    color: ['rgb(81, 138, 131)', 'rgb(110, 192, 170)', '#556C95', '#B89938'],
    title: [
      {
        //text: `{name|任务完成率}\n{val|${((statData.value.completionRate ?? 0) * 100).toFixed(2)}%}`,
        text: '任务完成率',
        top: '32%',
        left: 'center',

        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: 'rgb(30, 41, 69)',
          rich: {
            name: {
              fontSize: 14,
              color: '#000000',
              padding: [4, 1]
            },
            val: {
              fontSize: 20,
              fontWeight: 500,
              padding: [8, 8],
              color: '#000000'
            }
          }
        }
      }
    ],
    legend: {
      top: '75%',
      bottom: 0,
      itemHeight: 50,
      itemWidth: 4,
      orient: 'horizontal', //水平
      itemGap: 20, //图例之间间距     
      textStyle: {
        //数据右对齐样式
        color: 'rgb(78, 89, 105)',
        fontSize: 14,
        fontWeight: 'bold',
        lineHeight: 30,
      },
      formatter(name) {

        let str = ''
        let total = 0
        chartData.value.forEach((item) => {
          total += item.value
        })
        chartData.value.forEach((item) => {
          if (item.name == name) {
            str = `${item.name}\n${(item.value / total * 100).toFixed(2)}%`
          }
        })

        return str
      }
    },
    tooltip: {
      show: true,
      formatter(params) {
        let str = ''
        let total = 0
        chartData.value.forEach((item) => {
          total += item.value
        })
        chartData.value.forEach((item) => {
          if (item.name == params.name) {
            str = `${item.name}\n${(item.value / total * 100).toFixed(2)}%`
          }
        })
        return str
      }
    },
    series: [
      // 外圈
      {
        type: 'pie',
        radius: ['43%', '55%'],
        // center: ['40%', '50%'],
        center: ['50%', '35%'],
        hoverAnimation: false,
        z: 10,
        label: {
          show: true,
          fontSize: 14,
          color: 'rgb(110, 192, 170)',
          lineHeight: 20,
          formatter(params) {
            let str = ''
            let total = 0
            chartData.value.forEach((item) => {
              total += item.value
            })
            chartData.value.forEach((item) => {
              if (item.name == params.name) {
                const percentage = (item.value / total * 100).toFixed(2)
                // 添加百分比为0的判断
                str = percentage !== '0.00' ? `${item.name}\n${percentage}%` : ''
              }
            })
            return str
          }

        },
        labelLine: {
          show: false,
        },
        data: outRing,
        itemStyle: {
          normal: {
            borderWidth: 0,
            borderColor: '#fff',
          }
        },
      },
      {
        type: 'pie',
        radius: ['40%', '39%'],  // 外径缩小
        center: ['50%', '35%'],
        itemStyle: {
          normal: {
            borderWidth: 0.1,
            borderColor: 'rgba(100,100,100,0.9)', // 深灰
            borderRadius: 3
          }
        }
      }
      // // 内圈
      // {
      //   type: 'pie',
      //   //radius: ['24%', '42.8%'],
      //   //center: ['50%', '35%'],
      //   hoverAnimation: false,
      //   label: {
      //     show: false,
      //   },
      //   data:  inRing,

      //   itemStyle:{
      //       normal: {
      //           borderWidth: 5, 
      //           borderColor: '#fff',
      //         }
      //   },
      // },

    ],

  };
  chartInstance = echarts.init(chartRef.value)
  chartInstance?.setOption?.(options)
}

const fetchTaskDistribution = async () => {
  const data = await getTaskDistribution({ ...props.dashboardConfig?.query })
  const _data = []

  data?.data?.forEach?.((item, index) => {
    _data.push({
      name: `${TASK_TYPE_MAP.find((T) => T.value == item.taskType)?.name ?? item.taskType}-已完成`,
      value: item.passCount
    })
    _data.push({
      name: `${TASK_TYPE_MAP.find((T) => T.value == item.taskType)?.name ?? item.taskType}-未完成`,
      value: item.doingCount
    })
  })

  chartData.value = _data
  // 外圈色

  statData.value = data

  initChart()
}


const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    chartInstance?.resize?.()
  }
})

onMounted(() => {
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }

  fetchTaskDistribution()
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
.btm-right {
  width: 40%;
  //height: 420px;
  background: #fff;
  border-radius: 4px;
  margin-right: 20px;
  position: relative;

  .title {
    font-family: 'HarmonyOS Sans SC';
    font-size: 16px;
    color: #191B1C;
    font-weight: 700;
    height: 32px;
    background: url('../../assets/imgs/myUpdate/titleReg.svg') no-repeat 0% center;
    padding-left: 10px;
    line-height: 32px;
    margin-top: 10px;
    margin-left: 10px
  }

  .myChartContainer {
    // ✅ 新增容器布局
    width: 100%;
    height: calc(100% - 40px); // 留出标题高度
    display: flex;
    justify-content: flex-end;
  }

  .chart {
    width: 80%;
    height: 380px;
    padding-top: 20px;
    padding-left: 10%;
  }

  .info {
    position: absolute;
    top: 80px;
    left: 30px;

    div {
      margin-bottom: 30px;
    }

    p:nth-child(1) {
      font-size: 16px;
      color: rgb(78, 89, 105);
      margin-bottom: 5px;
      font-weight: 500;
    }

    p:nth-child(2) {
      font-size: 30px;
      color: rgb(46, 71, 204);
      margin-bottom: 10px;

      span {
        color: rgb(134, 144, 156);
        font-size: 12px;
      }
    }

  }
}
</style>
