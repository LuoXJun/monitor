<template>
  <div class="table-list">
    <table>
      <tr>
        <td v-for="item in currentData.tableConfig" :key="item.id">{{ item.name }}</td>
      </tr>
      <tr v-for="i in pageInfo.pageSize" :key="i">
        <td v-for="item in labels" :key="item">{{ item }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { getDetailApi, getMultiPageApi, getSinglePageApi } from '@/api/monitor/monitorInstrument'

const props = defineProps({
  id: {
    type: String,
    default: () => ''
  },
  multiple: {
    type: Boolean,
    default: () => true
  }
})

const currentData = reactive<Record<string, any>>({
  data: [],
  tableConfig: []
})

const pageInfo = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const getPage = async () => {
  currentData.data = []
  currentData.tableConfig = []

  const data = await getDetailApi({ id: props.id })
  data.children.forEach(item => {
    const param = JSON.parse(item.instrumentType.dataTemplate)
    currentData.data.push({ id: item.id, param, list: [] })
    currentData.tableConfig.push(...param)
  })

  const res = await getMultiPageApi({ pageNum: pageInfo.pageNum, pageSize: pageInfo.pageSize }, { instrumentId: props.id })
  for (const key in res) {
    for (const item of res[key]) {

      for (const v of currentData.data) {

        if (item.instrumentId === v.id) {
          v.list.push(item)
        }
      }
    }
  }

  console.log(currentData.data);

}

watch(() => props.id, () => {
  if (props.id) {
    getPage()
  }
}, { immediate: true })





const labels = [
  { name: '测点编号', props: 'specsNo' },
  { name: '仪器编号', props: 'instrumentNo' },
  { name: '仪器型号', props: 'machiningNo' },
  { name: '生产厂家', props: 'producer' },
  { name: '安装日期', props: 'createTime' },
  { name: '安装位置', props: 'buryLocation' },
  { name: '注浆日期', props: 'groutingTime' },
  { name: '距孔口', props: 'holeDistance' },
  { name: '计算公式', props: 'specsNo' },
]

</script>

<style scoped></style>
