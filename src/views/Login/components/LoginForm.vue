<template>
    <el-form
        v-show="getShow"
        ref="formLogin"
        :model="loginData.loginForm"
        :rules="LoginRules"
        class="login-form"
        label-position="top"
        label-width="120px"
        size="large"
    >
        <el-row style="margin-right: -10px; margin-left: -10px">
            <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
                <el-form-item>
                    <!-- <LoginFormTitle style="width: 100%" /> -->
                    <div class="title">
                        <img src="@/assets/imgs/myUpdate/login-title.svg" />
                        <p>登录您的账号</p>
                    </div>
                </el-form-item>
            </el-col>
            <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
                <div v-if="loginData.tenantEnable === 'true'" class="label-box">租户名</div>
                <el-form-item v-if="loginData.tenantEnable === 'true'" prop="tenantName">
                    <el-input
                        v-model="loginData.loginForm.tenantName"
                        :placeholder="t('login.tenantNamePlaceholder')"
                        :prefix-icon="iconHouse"
                        link
                        type="primary"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="24" style="padding-right: 10px; padding-left: 10px; margin-bottom: 10px">
                <!-- <div class="label-box">用户名</div> -->
                <el-form-item prop="username">
                    <el-input
                        v-model="loginData.loginForm.username"
                        :placeholder="t('login.usernamePlaceholder')"
                        :prefix-icon="iconAvatar"
                        class="custom-input"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="24" style="padding-right: 10px; padding-left: 10px; margin-bottom: 20px">
                <!-- <div class="label-box">密码</div> -->
                <el-form-item prop="password">
                    <el-input
                        v-model="loginData.loginForm.password"
                        :placeholder="t('login.passwordPlaceholder')"
                        :prefix-icon="iconLock"
                        show-password
                        type="password"
                        @keyup.enter="handleLogin"
                        class="custom-input"
                    />
                </el-form-item>
            </el-col>
            <el-col
                :span="24"
                style="
                    padding-right: 10px;
                    padding-left: 10px;
                    margin-top: -20px;
                    margin-bottom: -5px;
                "
            >
                <el-form-item>
                    <el-row justify="space-between" style="width: 100%">
                        <el-col :span="6">
                            <el-checkbox v-model="loginData.loginForm.rememberMe">
                                {{ t('login.remember') }}
                            </el-checkbox>
                        </el-col>
                        <el-col :offset="6" :span="12">
                            <el-link style="float: right; margin-right: 10px" type="primary">
                                {{ t('login.forgetPassword') }}
                            </el-link>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-col>
            <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
                <el-form-item>
                    <XButton
                        style="background: rgb(45, 77, 126)"
                        :loading="loginLoading"
                        :title="t('login.login')"
                        class="w-[100%]"
                        type="primary"
                        @click="handleLogin"
                    />
                </el-form-item>
            </el-col>
        </el-row>
    </el-form>
</template>
<script lang="ts" setup>
import { ElLoading } from 'element-plus';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { useIcon } from '@/hooks/web/useIcon';
import * as authUtil from '@/utils/auth';
import * as LoginApi from '@/api/login';
import { LoginStateEnum, useFormValid, useLoginState } from './useLogin';

defineOptions({ name: 'LoginForm' });
const { t } = useI18n();
const iconHouse = useIcon({ icon: 'ep:house' });
const iconAvatar = useIcon({ icon: 'ep:avatar', color: 'rgb(45, 77, 126)' });
const iconLock = useIcon({ icon: 'ep:lock', color: 'rgb(45, 77, 126)' });
const formLogin = ref();
const { validForm } = useFormValid(formLogin);
const { getLoginState } = useLoginState();
const { currentRoute, push } = useRouter();
const redirect = ref<string>('');
const loginLoading = ref(false);

const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

const LoginRules = {
    tenantName: [required],
    username: [required],
    password: [required]
};
const loginData = reactive({
    isShowPassword: false,
    captchaEnable: import.meta.env.VITE_APP_CAPTCHA_ENABLE,
    tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
    loginForm: {
        tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
        username: import.meta.env.VITE_APP_DEFAULT_LOGIN_USERNAME || '',
        password: import.meta.env.VITE_APP_DEFAULT_LOGIN_PASSWORD || '',
        captchaVerification: '',
        rememberMe: true // 默认记录我。如果不需要，可手动修改
    }
});

// 记住我
const getLoginFormCache = () => {
    const loginForm = authUtil.getLoginForm();
    if (loginForm) {
        loginData.loginForm = {
            ...loginData.loginForm,
            username: loginForm.username ? loginForm.username : loginData.loginForm.username,
            password: loginForm.password ? loginForm.password : loginData.loginForm.password,
            rememberMe: loginForm.rememberMe,
            tenantName: loginForm.tenantName ? loginForm.tenantName : loginData.loginForm.tenantName
        };
    }
};

const loading = ref(); // ElLoading.service 返回的实例
// 登录
const handleLogin = async (params) => {
    loginLoading.value = true;
    try {
        const data = await validForm();
        if (!data) {
            return;
        }
        const loginDataLoginForm = { ...loginData.loginForm };
        loginDataLoginForm.captchaVerification = params.captchaVerification;
        const res = await LoginApi.login(loginDataLoginForm);
        if (!res) {
            return;
        }
        loading.value = ElLoading.service({
            lock: true,
            text: '正在加载系统中...',
            background: 'rgba(0, 0, 0, 0.7)'
        });
        if (loginDataLoginForm.rememberMe) {
            authUtil.setLoginForm(loginDataLoginForm);
        } else {
            authUtil.removeLoginForm();
        }
        authUtil.setToken(res);

        push({ path: '/' });
    } finally {
        loginLoading.value = false;
        loading.value.close();
    }
};

watch(
    () => currentRoute.value,
    (route: RouteLocationNormalizedLoaded) => {
        redirect.value = route?.query?.redirect as string;
    },
    {
        immediate: true
    }
);
onMounted(() => {
    getLoginFormCache();
});
</script>

<style lang="scss" scoped>
:deep(.anticon) {
    &:hover {
        color: var(--el-color-primary) !important;
    }
}
:deep(.el-checkbox) {
    /* 未选中时的字体颜色 */
    .el-checkbox__label {
        color: rgb(45, 77, 126);
    }

    /* 选中时的对勾颜色 */
    .el-checkbox__inner::after {
        border-color: #fff;
    }

    /* 选中时的背景和边框颜色 */
    .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: rgb(45, 77, 126);
        border-color: rgb(45, 77, 126);
    }

    /* 选中时的标签文字颜色 */
    .el-checkbox__input.is-checked + .el-checkbox__label {
        color: rgb(45, 77, 126);
    }
}
:deep(.custom-input) {
    /* 文字颜色 */
    .el-input__inner {
        color: rgb(80, 107, 148);
    }

    /* 边框样式 */
    .el-input__wrapper {
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        box-shadow: 0 0 0 1px var(--el-input-border-color) inset; /* 去除默认内阴影 */

        /* 悬停状态 */
        &:hover {
            border-color: #c0c4cc;
        }

        /* 聚焦状态 */
        &.is-focus {
            border-color: rgb(80, 107, 148);
            box-shadow: 0 0 0 1px rgb(150, 179, 223) inset;
        }
    }
}
:deep(.el-input__inner::placeholder) {
    color: rgb(80, 107, 148);
    opacity: 1; /* 解决 Firefox 浏览器默认透明度问题 */
}

.login-code {
    float: right;
    width: 100%;
    height: 38px;

    img {
        width: 100%;
        height: auto;
        max-width: 100px;
        vertical-align: middle;
        cursor: pointer;
    }
}

.title {
    width: 100%;
    height: 167px;
    font-family: 'HarmonyOS Sans SC';

    p {
        color: rgb(80, 107, 148);
        font-family: 'HarmonyOS Sans SC';
        font-size: 18px;
        font-weight: 500;
        line-height: -1px;
        letter-spacing: 0%;
        text-align: left;
        margin-top: 30px;
    }
}

.label-box {
    margin-bottom: 7px;
    font-family: 'HarmonyOS Sans SC';
    font-size: 20px;
    font-weight: 500;
    color: #000;
}
// .input-box{
//   width: 450px;
//   height: 40px;
//   box-sizing: border-box;
//   /* 中性色/100 */
//   border: 1px solid rgb(213, 219, 229);
//   border-radius: 6px;
//   /* 中性色/白色 */
//   background: rgb(255, 255, 255);
// }
</style>
