<template>
  <div class="app-loading">
        <div class="app-loading-wrap">
          <div class="app-loading-title">
            <img src="/logo.gif" class="app-loading-logo" alt="Logo" />
            <div class="app-loading-title">{{appStore.title}}</div>
          </div>
          <div class="app-loading-item">
            <div class="app-loading-outter"></div>
            <div class="app-loading-inner"></div>
          </div>
        </div>
      </div>
</template>
<script lang="ts" setup>
// import { ElLoading } from 'element-plus'
// import LoginFormTitle from './LoginFormTitle.vue'
// import type { RouteLocationNormalizedLoaded } from 'vue-router'
// import { underlineToHump } from '@/utils'
// import { useIcon } from '@/hooks/web/useIcon'
import { useAppStore } from '@/store/modules/app'
import * as authUtil from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
import * as LoginApi from '@/api/login'
// import { LoginStateEnum, useFormValid, useLoginState } from './useLogin'

// defineOptions({ name: 'LoginForm' })
const appStore = useAppStore()
import { useRoute } from 'vue-router'
const route = useRoute()

// const { t } = useI18n()
// const message = useMessage()
// const iconHouse = useIcon({ icon: 'ep:house' })
// const iconAvatar = useIcon({ icon: 'ep:avatar' })
// const iconLock = useIcon({ icon: 'ep:lock' })
// const formLogin = ref()
// const { validForm } = useFormValid(formLogin)
// const { setLoginState, getLoginState } = useLoginState()
const { currentRoute, push } = useRouter()
const permissionStore = usePermissionStore()
const redirect = ref<string>('')
const loginLoading = ref(false)
const verify = ref()
// const captchaType = ref('blockPuzzle') // blockPuzzle 滑块 clickWord 点击文字

// const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN)

// const LoginRules = {
//   tenantName: [required],
//   username: [required],
//   password: [required]
// }

const loginData = reactive({
  isShowPassword: false,
  captchaEnable: import.meta.env.VITE_APP_CAPTCHA_ENABLE,
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  loginForm: {
    tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
    username: route.query.userName|| '',
    // password: import.meta.env.VITE_APP_DEFAULT_LOGIN_PASSWORD || '',
    appToken:route.query.appToken ||'',
    captchaVerification: '',
    rememberMe: true // 默认记录我。如果不需要，可手动修改
  }
})

// const socialList = [
//   { icon: 'ant-design:wechat-filled', type: 30 },
//   { icon: 'ant-design:dingtalk-circle-filled', type: 20 },
//   { icon: 'ant-design:github-filled', type: 0 },
//   { icon: 'ant-design:alipay-circle-filled', type: 0 }
// ]

// 获取验证码
// const getCode = async () => {
//   // 情况一，未开启：则直接登录
//   if (loginData.captchaEnable === 'false') {
//     await handleLogin({})
//   } else {
//     // 情况二，已开启：则展示验证码；只有完成验证码的情况，才进行登录
//     // 弹出验证码
//     verify.value.show()
//   }
// }
// 获取租户 ID
const getTenantId = async () => {
  if (loginData.tenantEnable === 'true') {
    const res = await LoginApi.getTenantIdByName(loginData.loginForm.tenantName)
    authUtil.setTenantId(res)
  }
}
// 记住我
// const getLoginFormCache = () => {
//   const loginForm = authUtil.getLoginForm()
//   if (loginForm) {
//     loginData.loginForm = {
//       ...loginData.loginForm,
//       username: loginForm.username ? loginForm.username : loginData.loginForm.username,
//       password: loginForm.password ? loginForm.password : loginData.loginForm.password,
//       rememberMe: loginForm.rememberMe,
//       tenantName: loginForm.tenantName ? loginForm.tenantName : loginData.loginForm.tenantName
//     }
//   }
// }
// 根据域名，获得租户信息
const getTenantByWebsite = async () => {
  const website = location.host
  const res = await LoginApi.getTenantByWebsite(website)
  if (res) {
    loginData.loginForm.tenantName = res.name
    authUtil.setTenantId(res.id)
  }
}
  const loading = ref() // ElLoading.service 返回的实例
// 登录
const handleLogin = async (params) => {

  loginLoading.value = true
  try {
    await getTenantId()
    //const data = await validForm()
    // if (!data) {
    //   return
    // }
    const loginDataLoginForm = { ...loginData.loginForm }
    loginDataLoginForm.captchaVerification = params.captchaVerification
    const res = await LoginApi.loginSso(loginDataLoginForm)
    localStorage.setItem('loginurl', `${import.meta.env.VITE_MENHU_URL}/login`)
    if (!res) {
      return
    }
    // loading.value = ElLoading.service({
    //   lock: true,
    //   text: '正在加载系统中...',
    //   background: 'rgba(0, 0, 0, 0.7)'
    // })
    // if (loginDataLoginForm.rememberMe) {
    //   authUtil.setLoginForm(loginDataLoginForm)
    // } else {
    //   authUtil.removeLoginForm()
    // }
    authUtil.setToken(res)
    if (!redirect.value) {

      redirect.value = '/'
    }
    // 判断是否为SSO登录
    if (redirect.value.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      push({ path: redirect.value || permissionStore.addRouters[0].path })
    }
  } finally {
    // console.log(route.path)
    loginLoading.value = false
    // loading.value.close()
  }
}

// // 社交登录
// const doSocialLogin = async (type: number) => {
//   if (type === 0) {
//     message.error('此方式未配置')
//   } else {
//     loginLoading.value = true
//     if (loginData.tenantEnable === 'true') {
//       // 尝试先通过 tenantName 获取租户
//       await getTenantId()
//       // 如果获取不到，则需要弹出提示，进行处理
//       if (!authUtil.getTenantId()) {
//         try {
//           const data = await message.prompt('请输入租户名称', t('common.reminder'))
//           if (data?.action !== 'confirm') throw 'cancel'
//           const res = await LoginApi.getTenantIdByName(data.value)
//           authUtil.setTenantId(res)
//         } catch (error) {
//           if (error === 'cancel') return
//         } finally {
//           loginLoading.value = false
//         }
//       }
//     }
//     // 计算 redirectUri
//     // tricky: type、redirect需要先encode一次，否则钉钉回调会丢失。
//     // 配合 Login/SocialLogin.vue#getUrlValue() 使用
//     const redirectUri =
//       location.origin +
//       '/social-login?' +
//       encodeURIComponent(`type=${type}&redirect=${redirect.value || '/'}`)

//     // 进行跳转
//     const res = await LoginApi.socialAuthRedirect(type, encodeURIComponent(redirectUri))
//     window.location.href = res
//   }
// }
// watch(
//   () => currentRoute.value,
//   (route: RouteLocationNormalizedLoaded) => {
//     redirect.value = route?.query?.redirect as string
//   },
//   {
//     immediate: true
//   }
// )
onMounted(() => {
  // getLoginFormCache()
  getTenantByWebsite()
  handleLogin({})
})
</script>

<style lang="scss" scoped>
        .app-loading {
          display: flex;
          width: 100%;
          height: 100%;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          background: #f0f2f5;
        }

        .app-loading .app-loading-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          display: flex;
          -webkit-transform: translate3d(-50%, -50%, 0);
          transform: translate3d(-50%, -50%, 0);
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }

        .app-loading .app-loading-title {
          margin-bottom: 30px;
          font-size: 20px;
          font-weight: bold;
          text-align: center;
        }

        .app-loading .app-loading-logo {
          width: 100px;
          margin: 0 auto 15px auto;
        }

        .app-loading .app-loading-item {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 60px;
          vertical-align: middle;
          border-radius: 50%;
        }

        .app-loading .app-loading-outter {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 4px solid #2d8cf0;
          border-bottom: 0;
          border-left-color: transparent;
          border-radius: 50%;
          animation: loader-outter 1s cubic-bezier(0.42, 0.61, 0.58, 0.41) infinite;
        }

        .app-loading .app-loading-inner {
          position: absolute;
          top: calc(50% - 20px);
          left: calc(50% - 20px);
          width: 40px;
          height: 40px;
          border: 4px solid #87bdff;
          border-right: 0;
          border-top-color: transparent;
          border-radius: 50%;
          animation: loader-inner 1s cubic-bezier(0.42, 0.61, 0.58, 0.41) infinite;
        }

        @-webkit-keyframes loader-outter {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }

          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }

        @keyframes loader-outter {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }

          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }

        @-webkit-keyframes loader-inner {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }

          100% {
            -webkit-transform: rotate(-360deg);
            transform: rotate(-360deg);
          }
        }

        @keyframes loader-inner {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }

          100% {
            -webkit-transform: rotate(-360deg);
            transform: rotate(-360deg);
          }
        }
      </style>
