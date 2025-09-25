<template>
    <div class="base-navigator">
        <div v-for="item in list" :key="item.label">
            <img :src="item.img" />
            <template v-if="item.children">
                <div class="include-select">
                    <span @click.self="item.isExpand = !item.isExpand">{{ item.label }}</span>
                    <img
                        src="@/assets/imgs/xiala.png"
                        @click.self="item.isExpand = !item.isExpand"
                    />
                    <div class="cascader-panel" :class="{ unExpand: !item.isExpand }">
                        <el-cascader-panel
                            v-model="item.selected"
                            :props="{
                                label: 'label',
                                value: 'label',
                                multiple: true,
                                checkStrictly: true,
                                expandTrigger: 'hover',
                                emitPath: false
                            }"
                            style="width: fit-content"
                            :options="item.children"
                            @change="item.change(item.selected)"
                        />
                    </div>
                </div>
            </template>
            <template v-else>
                <span @click="item.change(item.selected)">{{ item.label }}</span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

defineProps({
    list: {
        type: Array as PropType<IBaseNavigatorMenu[]>
    }
});
</script>

<style lang="scss">
.base-navigator {
    background-color: rgba(69, 122, 230, 1);
    display: flex;
    align-items: center;

    > div {
        display: flex;
        align-items: center;
        font-size: 14px;
        padding: 8px 14px;
        color: #fff;
        cursor: pointer;
        position: relative;
        user-select: none;
        &:hover {
            background-image: linear-gradient(
                to right,
                rgba(74, 204, 255, 1),
                rgba(69, 122, 230, 0)
            );
        }
        > img {
            width: 17px;
            height: 17px;
        }
        > span {
            margin: 0 8px 0 6px;
        }
        .include-select {
            display: flex;
            align-items: center;
            > span {
                margin: 0 8px 0 6px;
            }
            > img {
                width: 12px;
                height: 12px;
            }

            .select-options {
                position: absolute;
                top: 110%;
                left: 0;
                width: 100%;
                background: rgba(69, 122, 230, 1);
                overflow: hidden;
                transition: all 0.2s ease-in;
                max-height: 300px;
                border-radius: 8px;
                &.unExpand {
                    max-height: 0px;
                }
                > p {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    height: 36px;
                    line-height: 36px;
                    padding-left: 24px;
                    > span {
                        margin: 0 8px 0 6px;
                    }
                    > img {
                        width: 17px;
                        height: 17px;
                    }
                    &.isMenuActive {
                        background-image: linear-gradient(
                            to right,
                            rgba(74, 204, 255, 1),
                            rgba(69, 122, 230, 0)
                        );
                    }
                    &:hover {
                        background-image: linear-gradient(
                            to right,
                            rgba(74, 204, 255, 1),
                            rgba(69, 122, 230, 0)
                        );
                    }
                }
            }
            .cascader-panel {
                background: #fff;
                position: absolute;
                top: 110%;
                left: 0;
                overflow: hidden;
                transition: all 0.2s ease-in;
                max-height: 300px;
                border-radius: 8px;
                &.unExpand {
                    max-height: 0px;
                }
            }
        }
    }
}
</style>
