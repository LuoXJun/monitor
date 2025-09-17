<template>
    <div class="base-table">
        <el-table
            ref="multipleTableRef"
            :data="tableData"
            v-bind="options"
            :header-cell-style="headerCellStyle"
            :cell-style="cellStyle"
            @selection-change="handleSelectionChange"
            @select="select"
            @select-all="selectAll"
        >
            <el-table-column
                v-if="selection"
                type="selection"
                width="80"
                align="center"
                label-class-name="checkAll"
            />
            <el-table-column v-if="index" type="index" width="70" label="序号" align="center">
                <template #default="scope">
                    {{ (pageInfo.pageNum - 1) * pageInfo.pageSize + (scope.$index + 1) }}
                </template>
            </el-table-column>

            <template v-for="item in tableColumn" :key="item.filed">
                <el-table-column
                    v-if="item.isShowColumn ?? true"
                    :label="item.label"
                    :property="item.filed"
                    align="center"
                    v-bind="item.options"
                >
                    <template #default="scope">
                        <slot :name="item.filed" :scope="scope">
                            {{ scope.row[item.filed] }}
                        </slot>
                    </template>
                </el-table-column>
            </template>
        </el-table>
    </div>
</template>

<script setup lang="ts">
import type { ElTable } from 'element-plus';
import { type PropType } from 'vue';
const emits = defineEmits(['selected']);

const tableData = defineModel<Record<string, any>[]>({ default: [] });

const props = defineProps({
    tableColumn: {
        type: Array as PropType<ITableColumn[]>,
        default: () => [{}]
    },
    index: {
        type: Boolean,
        default: () => false
    },
    selection: {
        type: Boolean,
        default: () => false
    },
    multipleSelection: {
        type: Array,
        default: () => []
    },
    options: {
        type: Object as PropType<ITable>,
        default: () => ({
            border: false
        })
    },
    headerCellStyle: {
        type: Function as PropType<
            (data: {
                row: any;
                rowIndex: number;
                column: any;
                columnIndex: number;
            }) => Record<string, any>
        >,
        default: () => ({})
    },
    cellStyle: {
        type: Function as PropType<
            (data: {
                row: any;
                rowIndex: number;
                column: any;
                columnIndex: number;
            }) => Record<string, any>
        >,
        default: () => ({})
    },
    pageInfo: {
        type: Object as PropType<PageInfo>,
        default: () => ({
            pageSize: 10,
            pageNum: 1
        })
    }
});
const multipleTableRef = ref<InstanceType<typeof ElTable>>();

watch(
    props.multipleSelection,
    () => {
        nextTick(() => {
            if (props.multipleSelection.length > 0) {
                props.multipleSelection.forEach((row) => {
                    multipleTableRef.value!.toggleRowSelection(row, true);
                });
            }
        });
    },
    { immediate: true }
);

const handleSelectionChange = (value: any) => {
    emits('selected', { value, type: 'change' });
};
const select = (value: any, row: any) => {
    emits('selected', { value, row, type: 'select' });
};
const selectAll = (value: any) => {
    emits('selected', { value, type: 'selectAll' });
};
</script>

<style lang="scss">
.base-table {
    // .checkAll {
    //     position: relative;
    //     text-align: left !important;
    // }

    // .checkAll .cell::after {
    //     color: #909399;
    //     font-size: 13px;
    //     font-weight: bold;
    //     content: '全选';
    //     display: block;
    //     position: absolute;
    //     z-index: 1;
    //     left: 35px;
    // }

    .cell,
    .el-button {
        font-family: 'PingFang SC';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 24px; /* 171.429% */
    }

    thead .cell {
        color: #757f96;
    }
    tbody .cell {
        color: #131414;
    }
}
</style>
