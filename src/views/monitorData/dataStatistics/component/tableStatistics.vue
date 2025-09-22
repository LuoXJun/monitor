<template>
    <div class="tableStatistics">
        <table v-if="currentData.list.length > 1">
            <tr>
                <td v-for="(v, index) in currentData.dataTemplate" :key="index">{{ v?.name }}</td>
            </tr>

            <template v-for="(val, key) in currentData.dealData" :key="key">
                <tr v-for="(item, index) in val" :key="index">
                    <template v-for="v in currentData.dataTemplate" :key="v.name">
                        <td
                            :rowspan="index === 0 && rowspans.includes(v.mapping) ? val.length : 1"
                            v-if="
                                !rowspans.includes(v.mapping) ||
                                (rowspans.includes(v.mapping) && index === 0)
                            "
                        >
                            {{ item[v.mapping] }}
                        </td>
                    </template>
                </tr>
            </template>
        </table>
        <el-empty v-else description="无数据" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps(['data']);

const currentData = reactive<any>({
    list: [],
    dataTemplate: [],
    dealData: {}
});

const rowspans = ['instrumentNo', 'buryLocation'];

const labels = [
    { name: '仪器编号', mapping: 'instrumentNo' },
    { name: '测点深度', mapping: 'subInstrumentNo' },
    { name: '安装位置高程', mapping: 'buryLocation' },
    { name: '安装日期', mapping: 'buryTime' },
    { name: '变化量', mapping: 'changeVal' },
    { name: '变化率', mapping: 'changeRate' },
    { name: '备注', mapping: 'remark' }
];

const getData = async () => {
    currentData.dataTemplate = [];
    currentData.dealData = {};
    currentData.list = [];

    const res = props.data;
    currentData.list = res?.list ?? [];
    currentData.dataTemplate = [...labels];
    currentData.dataTemplate.splice(
        labels.length - 3,
        0,
        { name: '原始值日期', mapping: 'firstDate' },
        {
            name: res.dataTemplate.name + '(原始值)',
            mapping: 'firstValue'
        },
        { name: '最新值日期', mapping: 'lastDate' },
        {
            name: res.dataTemplate.name + '(最新值)',
            mapping: 'lastValue'
        }
    );
    // 处理特征值结构
    const obj = {};
    if (res?.list && res.list.length > 0) {
        for (const item of res.list) {
            if (!obj[item.instrumentNo]) {
                obj[item.instrumentNo] = [];
                obj[item.instrumentNo].push(item);
            } else {
                obj[item.instrumentNo].push(item);
            }
        }
    }
    currentData.dealData = obj;
};

watch(
    () => props.data,
    (val) => {
        if (val) {
            getData();
        }
    },
    { immediate: true }
);
</script>

<style scoped lang="scss">
.tableStatistics {
    width: 1400px;
    overflow: auto;
    table {
        table-layout: fixed;
        border-collapse: collapse;
        max-width: 100%;
        min-width: 100%;

        td {
            border: 1px solid #000;
            text-align: center;
            min-width: 120px;
            padding: 2px 4px;
            box-sizing: border-box;
            font-size: 14px;
            height: 42px;
            > P {
                max-height: 42px;
                overflow-y: auto;
                overflow-x: hidden;
            }
        }
        .thead {
            font-weight: bold;
        }
    }
}
</style>
