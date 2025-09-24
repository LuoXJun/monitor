<template>
    <div class="basePagination">
        <el-pagination
            v-model:current-page="pageInfo.pageNo"
            v-model:page-size="pageInfo.pageSize"
            :page-sizes="pageSizes"
            :size="size"
            :disabled="disabled"
            :layout="layout.join(',')"
            :total="pageInfo.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
    </div>
</template>

<script setup lang="ts">
import type { EpPropMergeType } from 'element-plus/es/utils/index.mjs';
import type { PropType } from 'vue';
const emits = defineEmits<{
    handleChange: [type: 'sizeChange' | 'currentChange', value: number];
}>();
const pageInfo = defineModel<PageInfo>({ default: {} });
const props = defineProps({
    disabled: {
        type: Boolean,
        default: () => false
    },
    background: {
        type: String,
        default: () => ''
    },
    size: {
        type: String as PropType<
            EpPropMergeType<StringConstructor, '' | 'small' | 'default' | 'large', never>
        >,
        default: () => 'default'
    },
    pageSizes: {
        type: Array as PropType<number[]>,
        default: () => [10, 20, 30, 50]
    },
    layout: {
        type: Array as PropType<Layout[]>,
        // layout="total, sizes, prev, pager, next, jumper"
        default: () => ['total', 'sizes', 'prev', 'pager', 'next', 'jumper']
    }
});

const handleSizeChange = (val: number) => {
    emits('handleChange', 'sizeChange', val);
};
const handleCurrentChange = (val: number) => {
    emits('handleChange', 'currentChange', val);
};
</script>

<style lang="scss">
.basePagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;

    // .is-active.number {
    //     background: v-bind(color) !important;
    //     color: #fff;
    // }
}
</style>
