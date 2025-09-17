<script lang="tsx">
import { PropType, ref, watch } from 'vue'
import { ElMenu, ElScrollbar } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission' // 导入权限模块
import { useRenderMenuItem } from './components/useRenderMenuItem' // 导入渲染菜单项
import { isUrl } from '@/utils/is' // 导入路由判断函数
import { useDesign } from '@/hooks/web/useDesign' // 导入样式变量
import { LayoutType } from '@/types/layout' // 导入布局类型
import { useLuckySheetTool } from '@/components/luckysheet/hook/useLuckySheetTool.js'
import { generateMultiLevelRoutes } from '@/utils/routerHelper'
import router from '@/router'
import { pa } from 'element-plus/es/locale'
import { on } from 'events'
import $bus from '@/utils/mitt'
import { pathResolve } from '@/utils/routerHelper'

const { exitLuckySheet } = useLuckySheetTool()

const { getPrefixCls } = useDesign()

//得到v-menu的class
const prefixCls = getPrefixCls('menu')
const isUpdateMenu = ref(false)
$bus.on('update-menu', (index: boolean) => {
  //刷新菜单
  isUpdateMenu.value = !isUpdateMenu.value
})

export default defineComponent({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: 'Menu',
  props: {
    menuSelect: {
      type: Function as PropType<(index: string) => void>,
      default: undefined
    }
  },
  setup(props) {
    const appStore = useAppStore()

    const layout = computed(() => appStore.getLayout)

    const { push, currentRoute } = useRouter()

    const permissionStore = usePermissionStore()

    router.beforeEach((to, from, next) => {
      permissionStore.setMenuSelectIndex(('/' + to.path.split('/')[1]) === '/index' ? '/' : ('/' + to.path.split('/')[1]))
      next() // 必须调用 next() 继续导航
    })

    const menuMode = computed((): 'vertical' | 'horizontal' => {
      // 竖
      const vertical: LayoutType[] = ['classic', 'topLeft', 'cutMenu']

      if (vertical.includes(unref(layout))) {
        return 'vertical'
      } else {
        return 'horizontal'
      }
    })
    const normalizedRouters = computed(() => {
      return unref(routers).flatMap(
        (route) => route.children?.filter((child) => !child.meta?.hidden) || []
      )
    })

    const routers = computed(() =>
      unref(layout) === 'cutMenu' ? permissionStore.getMenuTabRouters : permissionStore.getRouters
    )

    const collapse = computed(() => appStore.getCollapse)

    const uniqueOpened = computed(() => appStore.getUniqueOpened)

    const activeMenu = computed(() => {
      
      // console.log('****************************************')
      // console.log(hasChildRouter(unref(currentRoute).path))
      //return hasChildRouter(unref(currentRoute).path) || unref(currentRoute).path

      // const { meta, path } = unref(currentRoute)
      // //if set path, the sidebar will highlight the path you set
      // if (meta.activeMenu) {
      //   return meta.activeMenu as string
      // }
      // return path
      const { meta } = unref(currentRoute)

      if (meta.activeMenu) {
        return meta.activeMenu as string
      }

      // 使用fullPath包含query参数
      const { fullPath } = unref(currentRoute)
      
      return meta.activeMenu ? (meta.activeMenu as string) : fullPath.split('?')[0]
    })
    // 后面添加的激活菜单开始
    // let activeMenu2 = unref('')
    // //判断当前路由是否有子路由
    // const hasChildRouter = (router: any) => {
    //   let path = ''
    //   routers.value.forEach((item) => {

    //     if(item.path === router && item.children && item.children.length > 1){

    //       if(item.children[0].path !== ''){
    //         path = isUrl(item.children[0].path) ? item.children[0].path : pathResolve(item.path, item.children[0].path)
    //         path = path ==='/index'?'/index?key=jc' : path
    //       }
    //     }
    //   })
    //   return path
    // }
    // $bus.on('update-menu-index', (index: boolean) => {
    //      activeMenu2 = hasChildRouter(index)
    //      push(activeMenu2)
    // })
    // 后面添加的激活菜单结束

    const menuSelect = (index: string) => {
      exitLuckySheet()
      //permissionStore.setMenuSelectIndex(index)
      if (props.menuSelect) {
        props.menuSelect(index)
      }
      // 自定义事件
      if (isUrl(index)) {
        window.open(index)
      } else {
        push(index)
      }
    }

    const renderMenuWrap = () => {
      if (unref(layout) === 'top') {
        return renderMenu()
      } else {
        return <ElScrollbar>{renderMenu()}</ElScrollbar>
      }
    }
    // default-openeds={unref(rt[0].children.length>1) === 'vertical' ? [0] : "['1']"}

    const renderMenu = () => {
      const { rt, parentPath } = generateMultiLevelRoutes(
        unref(routers),
        localStorage.getItem('menuSelectIndex') || '/'
      )
      return (
        <ElMenu
          defaultActive={unref(activeMenu)}
          mode={unref(menuMode)}
          //default-openeds={"['0']"}
          collapse={
            unref(layout) === 'top' || unref(layout) === 'cutMenu' ? false : unref(collapse)
          }
          uniqueOpened={unref(layout) === 'top' ? true : unref(uniqueOpened)}
          backgroundColor="var(--left-menu-bg-color)"
          textColor="var(--left-menu-text-color)"
          activeTextColor="var(--left-menu-text-active-color)"
          popperClass={
            unref(menuMode) === 'vertical'
              ? `${prefixCls}-popper--vertical`
              : `${prefixCls}-popper--horizontal`
          }
          onSelect={menuSelect}
          default-openeds={''}
        >
          {{
            default: () => {
              const { renderMenuItem } = useRenderMenuItem(unref(menuMode))
              //const {rt,parentPath} = generateMultiLevelRoutes(unref(routers),localStorage.getItem('menuSelectIndex') || '/')
              //return renderMenuItem(unref(routers))
              return renderMenuItem(rt)
            }
          }}
        </ElMenu>
      )
    }

    return () => (
      <div
        id={prefixCls}
        key={isUpdateMenu.value}
        class={[
          `${prefixCls} ${prefixCls}__${unref(menuMode)}`,
          'h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height))] overflow-hidden flex-col bg-[var(--left-menu-bg-color)]',
          {
            'w-[var(--left-menu-min-width)]': unref(collapse) && unref(layout) !== 'cutMenu',
            'w-[var(--left-menu-max-width)]': !unref(collapse) && unref(layout) !== 'cutMenu'
          }
        ]}
      >
        {renderMenuWrap()}
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-menu;

.#{$prefix-cls} {
  position: relative;
  transition: width var(--transition-time-02);

  :deep(.#{$elNamespace}-menu) {
    width: 100% !important;
    border-right: none;
    font-size: 10px;
    --left-menu-text-active-color: rgb(45, 77, 126); // 激活文字颜色
    --left-menu-bg-active-color: rgba(2, 102, 240, 0.05); // 激活背景色
    --left-menu-text-color: rgb(150, 166, 191); // 普通背景色

    // 设置选中时子标题的颜色
    .is-active {
      & > .#{$elNamespace}-sub-menu__title {
        color: var(--left-menu-text-active-color) !important;
      }
    }
    // 设置折叠时子标题的颜色
    .#{$elNamespace}-sub-menu {
      .#{$elNamespace}-menu-item {
        border-bottom: none !important;
      }
    }
    // 设置子菜单悬停的高亮和背景色
    .#{$elNamespace}-sub-menu__title,
    .#{$elNamespace}-menu-item {
      font-size: var(--font-size-base);
      font-weight: 00;
      border-bottom: 1px solid rgb(213, 219, 229);
      &:hover {
        color: var(--left-menu-text-active-color) !important;
        background-color: var(--left-menu-bg-color) !important;
      }
    }

    // 设置选中时的高亮背景和高亮颜色
    .#{$elNamespace}-menu-item.is-active {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-active-color) !important;

      &:hover {
        background-color: var(--left-menu-bg-active-color) !important;
      }
    }

    .#{$elNamespace}-menu-item.is-active {
      position: relative;
    }

    // 设置子菜单的背景颜色
    .#{$elNamespace}-menu {
      .#{$elNamespace}-sub-menu__title,
      .#{$elNamespace}-menu-item:not(.is-active) {
        background-color: var(--left-menu-bg-light-color) !important;
      }
    }
    // .#{$elNamespace}-sub-menu__icon-arrow {
    //     // 移除默认样式
    //     font-size: 0 !important;
    //     margin-right: 0;
    //     margin-top: -6px;
    //     position: absolute;
    //     right: var(--el-menu-base-level-padding);
    //     top: 50%;
    //     transform: none !important;
    //     transition: none !important;
    //     .el-icon svg {
    //         display: none;
    //         transition: none !important;
    //     }

    //     // 使用伪元素显示自定义图标
    //     &::before {
    //       content: '';
    //       display: inline-block !important;
    //       width: 15px;
    //       height: 14px;
    //       background-image: url('@/assets/imgs/myUpdate/up.svg') !important;
    //       background-repeat: no-repeat !important;
    //       background-position: center !important;
    //       background-size: contain !important;
    //       vertical-align: middle;
    //       margin-left: 8px;  // 新增右边距
    //       //transform: rotate(0deg) !important;
    //       transition: none !important;
    //     }

    //     // 展开状态旋转
    //     .#{$elNamespace}-sub-menu.is-opened &::before {
    //       background-image: url('@/assets/imgs/myUpdate/down.svg') !important;
    //     }

    //     // 调整容器位置
    //     display: flex !important;
    //     align-items: center;
    //     margin-top: 0px;
    //   }
  }

  // 隐藏二级及更深层菜单的下边框
  :deep(.#{$elNamespace}-menu) {
    .#{$elNamespace}-sub-menu {
      // 二级菜单容器
      .#{$elNamespace}-menu {
        // 二级菜单标题
        .#{$elNamespace}-sub-menu__title {
          border-bottom: none !important;
        }

        // 三级及更深层菜单标题
        .#{$elNamespace}-sub-menu .#{$elNamespace}-sub-menu__title {
          border-bottom: none !important;
        }
      }
    }
  }
  // 折叠时的最小宽度
  :deep(.#{$elNamespace}-menu--collapse) {
    width: var(--left-menu-min-width);
    & > .is-active,
    & > .is-active > .#{$elNamespace}-sub-menu__title {
      position: relative;
      background-color: var(--left-menu-collapse-bg-active-color) !important;
    }
  }

  // 折叠动画的时候，就需要把文字给隐藏掉
  :deep(.horizontal-collapse-transition) {
    // transition: 0s width ease-in-out, 0s padding-left ease-in-out, 0s padding-right ease-in-out !important;
    .#{$prefix-cls}__title {
      display: none;
    }
  }

  // 垂直菜单
  &__vertical {
    :deep(.#{$elNamespace}-menu--vertical) {
      &:not(.#{$elNamespace}-menu--collapse) .#{$elNamespace}-sub-menu__title,
      .#{$elNamespace}-menu-item {
        padding-right: 0;
      }
    }
  }

  // 水平菜单
  &__horizontal {
    height: calc(var(--top-tool-height)) !important;

    :deep(.#{$elNamespace}-menu--horizontal) {
      height: calc(var(--top-tool-height));
      border-bottom: none;
      // 重新设置底部高亮颜色
      & > .#{$elNamespace}-sub-menu.is-active {
        .#{$elNamespace}-sub-menu__title {
          border-bottom-color: var(--el-color-primary) !important;
        }
      }

      .#{$elNamespace}-menu-item.is-active {
        position: relative;

        &::after {
          display: none !important;
        }
      }

      .#{$prefix-cls}__title {
        /* stylelint-disable-next-line */
        max-height: calc(var(--top-tool-height) - 2px) !important;
        /* stylelint-disable-next-line */
        line-height: calc(var(--top-tool-height) - 2px);
      }
    }
  }
}
</style>

<style lang="scss">
$prefix-cls: #{$namespace}-menu-popper;

.#{$prefix-cls}--vertical,
.#{$prefix-cls}--horizontal {
  // 设置选中时子标题的颜色
  .is-active {
    & > .el-sub-menu__title {
      color: var(--left-menu-text-active-color) !important;
    }
  }

  // 设置子菜单悬停的高亮和背景色
  .el-sub-menu__title,
  .el-menu-item {
    &:hover {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-color) !important;
    }
  }

  // 设置选中时的高亮背景
  .el-menu-item.is-active {
    position: relative;
    background-color: var(--left-menu-bg-active-color) !important;

    &:hover {
      background-color: var(--left-menu-bg-active-color) !important;
    }
  }
}
</style>
