<template>
    <div class="base-row-bar">
        <div class="text">
            <span>正常</span>
            <span>88%</span>
        </div>
        <div class="content">
            <div class="line">
                <div :style="{ width: '80%', background: bgColor }"></div>
            </div>
            <div class="length">
                <span>3103</span>
                <span>个</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    bgColor: {
        type: String,
        default: () => 'red'
    }
});
</script>

<style scoped lang="scss">
.base-row-bar {
    width: 100%;
    .text {
        display: flex;
        align-items: center;
        > span {
            margin-right: 50px;
            font-family: 'PingFang SC';
            font-size: 14px;
            font-style: italic;
            font-weight: 500;
            color: rgba(29, 33, 41, 1);
        }
    }
    .content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .line {
            height: 8px;
            flex: 75% 0 0;
            background-color: rgba(97, 141, 229, 0.2);
            > div {
                height: 100%;
            }
        }
        .length {
            > span {
                color: rgba(29, 33, 41, 1);
            }
            > span:nth-child(2) {
                font-size: 10px;
            }
        }
    }
}
</style>
