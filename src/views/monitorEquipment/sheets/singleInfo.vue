<!-- 单点信息 -->
<template>
  <div class="single-info">
    <p>
      {{ title }}
    </p>
    <baseList :list="tableConfig" :column="3" />
  </div>
</template>

<script setup lang="ts">
import baseList from '@/components/base-list/base-list.vue';


const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {}
    }
  },
  title: {
    type: String,
    default: () => '标题'
  }
})

// 基本数据
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

const tableConfig = ref<any[]>([])

watch(() => props.data, () => {
  const param = JSON.parse(props.data.param) || {}
  const data = [...labels, ...param];
  console.log(data);

  tableConfig.value = data.map(item => {
    return { label: item.unit ? item.name + `(${item.unit})` : item.name, value: item.value || props.data[item.props] }
  })
}, { immediate: true })

</script>

<style scoped lang="scss">
.single-info {
  overflow: auto;

  >p {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
  }


}
</style>
