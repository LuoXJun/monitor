<!-- 多点信息 -->
<template>
    <div class="mult-info">
        <p v-if="title">
            {{ title }}
        </p>
        <div class="table-content">
            <table>
                <tr v-for="v in [...labels, ...tableConfig[0]]" :key="v.name">
                    <td>{{ v.name }}</td>
                    <td v-for="(item, i) in currentData" :key="item.id">
                        <p v-if="v.props">{{ item[v.props] }}</p>
                        <template v-else>
                            <template v-for="el in tableConfig[i]" :key="el.id">
                                <p v-if="el.name === v.name">
                                    {{
                                        el.value || (el.formulae ? '计算公式=' + el.formulae : '/')
                                    }}
                                </p>
                            </template>
                        </template>
                    </td>
                    <!-- <td v-if="index === 0">备注</td>
                    <td v-else>
                        <p>{{ currentData[index]?.remark }}</p>
                    </td> -->
                </tr>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { template } from 'lodash-es';
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
    { name: '距孔口', props: 'holeDistance' }
];

const tableConfig = ref<any[]>([]);
const currentData = ref<any[]>([]);

watch(
    () => props.data,
    () => {
        tableConfig.value = [];
        currentData.value = [...props.data];
        currentData.value.forEach((item, index) => {
            const param = JSON.parse(item.param || '[]');
            const dataTemplate = JSON.parse(item.instrumentType.dataTemplate || '[]');
            tableConfig.value.push([...param, ...dataTemplate]);
        });
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
        max-width: 1410px;
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
