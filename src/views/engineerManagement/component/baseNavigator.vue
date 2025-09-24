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
                    <div
                        v-if="item.label !== '图层管理'"
                        class="select-options"
                        :class="{ unExpand: !item.isExpand }"
                    >
                        <p
                            v-for="v in item.children"
                            :key="v.label"
                            :class="{
                                isMenuActive: item.selected && item.selected.includes(v.label)
                            }"
                            @click.stop="onClick(item, v)"
                        >
                            <img :src="v.img" />
                            <span>{{ v.label }}</span>
                        </p>
                    </div>
                    <div v-else class="cascader-panel" :class="{ unExpand: !item.isExpand }">
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
                            @change="onClick(item)"
                        />
                    </div>
                </div>
            </template>
            <template v-else>
                <span @click="onClick(item)">{{ item.label }}</span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getImg } from '@/utils/getAssets';

interface IBaseNavigatorMenu {
    label: string;
    img?: string;
    isExpand?: boolean;
    multible?: boolean;
    selected?: Array<string>;
    children?: IBaseNavigatorMenu[];
}
const list = reactive<IBaseNavigatorMenu[]>([
    {
        label: '图层管理',
        multible: true,
        selected: [],
        img: getImg('tuceng.png'),
        children: [
            {
                label: '测试1'
            },
            {
                label: '测试2',
                children: [{ label: '测试1-1' }]
            }
        ]
    },
    { label: '底图切换', multible: true, selected: [], img: getImg('dituqiehuan.png') },
    {
        label: '工具箱',
        img: getImg('gongjuxiang.png'),
        multible: true,
        selected: [],
        children: [
            {
                label: '测试1',
                img: getImg('tuceng.png')
            },
            {
                label: '测试2',
                img: getImg('tuceng.png')
            },
            {
                label: '测试3',
                img: getImg('tuceng.png')
            }
        ]
    },
    { label: '2D', img: getImg('2Dto3D.png') },
    { label: '截图', img: getImg('jietu.png') },
    { label: '复位', img: getImg('fuwei.png') }
]);

const onClick = (parent: IBaseNavigatorMenu, child?: IBaseNavigatorMenu) => {
    console.log(parent);

    if (parent.label === '涂层管理') return;

    if (child) {
        // 存在下拉菜单
        // 多选
        if (parent.multible) {
            const index = parent.selected!.indexOf(child.label);
            if (index > -1) {
                parent.selected!.splice(index, 1);
            } else {
                parent.selected!.push(child.label);
            }
        } else {
            // 单选
            parent.selected = [child.label];
        }
    } else {
        // 不存在下拉菜单--按钮级别
    }
};
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
