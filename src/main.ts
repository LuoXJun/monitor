import contextmenu from "v-contextmenu";
import "v-contextmenu/dist/themes/default.css";

import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

import print from 'vue3-print-nb'

// 引入unocss css
import '@/plugins/unocss'

// 导入全局的svg图标
import '@/plugins/svgIcon'

// 初始化多语言
import { setupI18n } from '@/plugins/vueI18n'

// 引入状态管理
import { setupStore } from '@/store'

// 全局组件
import { setupGlobCom } from '@/components'

// 引入 element-plus
import { setupElementPlus } from '@/plugins/elementPlus'

// 引入 form-create
import { setupFormCreate } from '@/plugins/formCreate'

// 引入全局样式
import '@/styles/index.scss'

// 引入动画
import '@/plugins/animate.css'

// 路由
import router, { setupRouter } from '@/router'

// 权限
import { setupAuth } from '@/directives'

import { createApp } from 'vue'

import App from './App.vue'

import './permission'

import '@/plugins/tongji' // 百度统计
import Logger from '@/utils/Logger'

import VueDOMPurifyHTML from 'vue-dompurify-html' // 解决v-html 的安全隐患

import {
  VxeUI,

  VxeButton,
  VxeButtonGroup,
  VxeDrawer,
  VxeForm,
  VxeFormGroup,
  VxeFormItem,
  VxeIcon,
  VxeLoading,
  VxeModal,
  VxePager,
  VxePrint,
  VxeTooltip,
  VxeUpload
} from 'vxe-pc-ui'

import {
  VxeTable,
  VxeColumn,
  VxeColgroup,
  VxeGrid,
  VxeToolbar
} from 'vxe-table'

// 导入主题变量，也可以重写主题变量
import 'vxe-pc-ui/lib/style.css'
import 'vxe-table/lib/style.css'
import "@/styles/vxe-table.theme.css"

// 导入默认的语言
// @ts-ignore
import zhCN from 'vxe-table/packages/locale/lang/zh-CN'

VxeUI.setI18n('zh-CN', zhCN)
VxeUI.setLanguage('zh-CN')

// 可选组件
function lazyVxeUI (app) {
  app.use(VxeButton)
  app.use(VxeButtonGroup)
  app.use(VxeDrawer)
  app.use(VxeForm)
  app.use(VxeFormGroup)
  app.use(VxeFormItem)
  app.use(VxeIcon)
  app.use(VxeLoading)
  app.use(VxeModal)
  app.use(VxePager)
  app.use(VxePrint)
  app.use(VxeTooltip)
  app.use(VxeUpload)
}

function lazyVxeTable (app) {
  app.use(VxeTable)
  app.use(VxeColumn)
  app.use(VxeColgroup)
  app.use(VxeGrid)
  app.use(VxeToolbar)
}

// 创建实例
const setupAll = async () => {
  const app = createApp(App)

  await setupI18n(app)

  setupStore(app)

  setupGlobCom(app)

  setupElementPlus(app)

  setupFormCreate(app)

  setupRouter(app)

  setupAuth(app)

  await router.isReady()

  app.use(print)
  app.use(ContextMenu);
  app.use(contextmenu);
  app.use(VueDOMPurifyHTML)
  app.use(lazyVxeUI)
  app.use(lazyVxeTable)

  app.mount('#app')
}

setupAll()

Logger.prettyPrimary(`欢迎使用`, import.meta.env.VITE_APP_TITLE)
