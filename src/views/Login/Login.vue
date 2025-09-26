<template>
    <div
        :class="prefixCls"
        class="relative h-[100%] lt-md:px-10px lt-sm:px-10px lt-xl:px-10px lt-xl:px-10px"
    >
        <div class="relative mx-auto h-full flex">
            <div class="left"></div>
            <div
                class="relative flex-1 p-30px dark:bg-[var(--login-bg-color)] lt-sm:p-10px overflow-x-hidden overflow-y-auto"
            >
                <!-- 右上角的主题、语言选择 -->
                <div
                    class="flex items-center justify-between text-white at-2xl:justify-end at-xl:justify-end"
                >
                    <div class="flex items-center at-2xl:hidden at-xl:hidden">
                        <img alt="" class="mr-10px h-48px w-48px" src="@/assets/imgs/logo.png" />
                        <span class="text-20px font-bold">
                            {{ underlineToHump(appStore.getTitle) }}
                        </span>
                    </div>
                </div>

                <!-- 右边的登录界面 -->
                <Transition appear enter-active-class="animate__animated animate__bounceInRight">
                    <div
                        class="m-auto h-[calc(100%-60px)] w-[100%] flex items-center at-2xl:max-w-500px at-lg:max-w-500px at-md:max-w-500px at-xl:max-w-500px"
                    >
                        <!-- 账号登录 -->
                        <LoginForm
                            class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)"
                        />
                    </div>
                </Transition>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { underlineToHump } from '@/utils';

import { useDesign } from '@/hooks/web/useDesign';
import { useAppStore } from '@/store/modules/app';

import { LoginForm } from './components';

defineOptions({ name: 'Login' });
localStorage.setItem('loginurl', window.location.href);
const appStore = useAppStore();
const { getPrefixCls } = useDesign();
const prefixCls = getPrefixCls('login');
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-login;

.#{$prefix-cls} {
    overflow: auto;
    background: url('@/assets/imgs/myUpdate/login-bg.svg') no-repeat right center;
    background-size: contain;

    &__left {
        &::before {
            position: absolute;
            top: 0;
            left: 0;
            z-index: -1;
            width: 100%;
            height: 100%;
            background-image: url('@/assets/svgs/login-bg.svg');
            background-position: center;
            background-repeat: no-repeat;
            content: '';
        }
    }
}
</style>

<style lang="scss" scoped>
.dark .login-form {
    .el-divider__text {
        background-color: var(--login-bg-color);
    }

    .el-card {
        background-color: var(--login-bg-color);
    }
}

.left {
    width: 35%;
    background: url('../../assets/imgs/bg-left.png') no-repeat;
    background-size: contain;
}
</style>
