<!-- 多点信息 -->
<template>
    <div class="mult-info">
        <p>
            {{ title }}
        </p>
        <div class="table-content">
            <table>
                <tr v-for="(v, index) in tableConfig" :key="v.name">
                    <td>{{ v.name }}{{ v.unit ? `(${v.unit})` : '' }}</td>
                    <td v-for="item in data" :key="item.id">
                        <p>{{ v.value ? v.value : item[v.props] }}</p>
                    </td>
                    <td v-if="index === 0">备注</td>
                    <td v-else>
                        <p>{{ data[index]?.remark }}</p>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

const props = defineProps({
    data: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    title: {
        type: String,
        default: () => '标题'
    }
});

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
    { name: '计算公式', props: '' }
];

const tableConfig = ref<any[]>([]);

watch(
    () => props.data,
    () => {
        for (const item of props.data) {
            const param = JSON.parse(item.param);
            if (param) {
                tableConfig.value = [...labels, ...param];
                break;
            }
        }
    },
    { immediate: true }
);
</script>

<style scoped lang="scss">
.mult-info {
    max-width: 1450px;
    overflow: auto;

    > p {
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 10px;
    }
    .table-content {
        width: 1410px;
        height: 520px;
        overflow: auto;
        > table {
            table-layout: fixed;
            border-collapse: collapse;
            max-width: 100%;
            min-width: 100%;
            td {
                border: 1px solid #000;
                text-align: center;
                padding: 7px 0;
                overflow: auto;
                min-width: 100px;
                > p {
                    height: 34px;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
            }
        }
    }
}
</style>
