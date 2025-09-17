<script lang="tsx">
import { PropType } from 'vue'
import { ElMenu, ElScrollbar } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission';// 导入权限模块
import { useRenderMenuItem } from './components/useRenderMenuItem';// 导入渲染菜单项
import { is, isUrl } from '@/utils/is';// 导入路由判断函数
import { useDesign } from '@/hooks/web/useDesign';// 导入样式变量
import { LayoutType } from '@/types/layout';// 导入布局类型
import { useLuckySheetTool } from '@/components/luckysheet/hook/useLuckySheetTool.js';
import { has } from 'min-dash';
import { ro } from 'element-plus/es/locale';
import $bus from '@/utils/mitt';
import { on } from 'events';


const { exitLuckySheet } = useLuckySheetTool()

const { getPrefixCls } = useDesign()

//得到v-menu的class
const prefixCls = getPrefixCls('menu')


export default defineComponent({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: 'MenuNew',
  props: {
    menuSelect: {
      type: Function as PropType<(index: string) => void>,
      default: undefined
    }
  },
  setup(props) {
    
    const appStore = useAppStore()

    //得到布局样式classic
    const layout = computed(() => appStore.getLayout)
 

    const { push, currentRoute } = useRouter()

    const permissionStore = usePermissionStore()
   
    const routePath = ref('')

    const menuMode = computed((): 'vertical' | 'horizontal' => {
      // 竖
      // const vertical: LayoutType[] = ['classic', 'topLeft', 'cutMenu']

      // if (vertical.includes(unref(layout))) {
      //   return 'vertical'
      // } else {
        return 'horizontal'
      // }
    })

    const routers = computed(() =>
      unref(layout) === 'cutMenu' ? permissionStore.getMenuTabRouters : permissionStore.getRouters
    )
 

    //const collapse = computed(() => appStore.getCollapse)


    const uniqueOpened = computed( () => appStore.getUniqueOpened)

   
    const activeMenu = computed(() => {
      const { meta, path,fullPath } = unref(currentRoute)
      //  if (meta.activeMenu) {
      //   return meta.activeMenu as string
      // }
      if (fullPath==='/' || fullPath === '/index') {
        push('/index/jc')
      }else{
        push(fullPath as string)
      }
      // console.log(currentRoute)
      // // if set path, the sidebar will highlight the path you set
      // if (meta.activeMenu) {
      //   return meta.activeMenu as string
      // }
      // return path
      // permissionStore.setMenuSelectIndex('/' + path.split('/')[1])
      return ('/' + path.split('/')[1]) === '/index' ? '/' : ('/' + path.split('/')[1])
      // return localStorage.getItem('menuSelectIndex')!==null ?localStorage.getItem('menuSelectIndex'):  '/'
      //return '/index?key=jc'
    })
    
    //判断当前路由是否有子路由
    const hasChildRouter = (router: any) => {
      let isFind = false
      routers.value.forEach((item) => {
        if(item.path === router && item.children && item.children.length > 1 || item.path === router &&item.name === 'Home' ){
          isFind = true
        }
      })
      return isFind
    }

    //获取当前路由的子路由
    const countAllChildren = (meat) => {
      if (!meat) {
        return
      }
      if (meat.name === 'Home') {
        return push('/index/jc')
      }

      //拼接路由，如果前面有/，则去掉
      routePath.value = routePath.value + '/' + meat.path.replace(/^\//, "")
      //如果没有子路由，就跳转
      if (!meat || !meat.children || !Array.isArray(meat.children)) {
        return push(routePath.value)
      }
      // 当前节点的直接子节点有没有children + 递归相加每个子节点的子节点children
      return countAllChildren(meat.children[0])
    }

    const menuSelect = (index: string) => {
      routePath.value = ''
      
      if (index === '/') {
        const selectedItem = routers.value.find((item) => item.name == 'Home')
        countAllChildren(selectedItem)
      }else{
        const selectedItem = routers.value.find((item) => item.name == index)
        countAllChildren(selectedItem)
      }

      exitLuckySheet()
      permissionStore.setMenuSelectIndex(index)
      if (props.menuSelect) {
        props.menuSelect(index)
      }
      // 自定义事件
      if (isUrl(index)) {
        window.open()
      } else {
        if(!hasChildRouter(index)){
          if (unref(currentRoute).path !== index && index !== '/') {
            push(index)
            
          }
        }
        $bus.emit('update-menu', true)
       
        
      }
      // 自定义事件
      // if (isUrl(index)) {
      //   window.open(index)
      // } else {
      //   push(index)
      // }
      
     
      
      
    }

    const renderMenuWrap = () => {
      if (unref(layout) === 'top') {
        return renderMenu()
      } else {
        return renderMenu()
      }
    }

    const renderMenu = () => {
      return (
        <ElMenu
          defaultActive={unref(activeMenu)}
          mode={unref(menuMode)}
          router
          uniqueOpened={unref(layout) === 'top' ? false : unref(uniqueOpened)}
          backgroundColor="var(--left-menu-bg-color)"
          textColor="var(--left-menu-text-color)"
          activeTextColor="var(--left-menu-text-active-color)"
          popperClass={
            unref(menuMode) === 'vertical'
              ? `${prefixCls}-popper--vertical`
              : `${prefixCls}-popper--horizontal`
          }
          onSelect={menuSelect}
        >
          {{
            default: () => {
              const { renderMenuItem } = useRenderMenuItem(unref(menuMode))

              return renderMenuItem(unref(routers), '/','hos')
            }
          }}
        </ElMenu>
      )
    }

    return () => (
      <div
        id={prefixCls}
        class={[
          `${prefixCls} ${prefixCls}__${unref(menuMode)}`,
          {/* 'h-[100%] overflow-hidden flex-col bg-[var(--left-menu-bg-color)]',
          {
            'w-[var(--left-menu-min-width)]': unref(collapse) && unref(layout) !== 'cutMenu',
            'w-[var(--left-menu-max-width)]': !unref(collapse) && unref(layout) !== 'cutMenu'
          } */}
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
  //height: 50px;
  --menu-horizontal-height: 50px; // 水平模式高度

  :deep(.#{$elNamespace}-menu) {
    width: 100% !important;
    border-right: none;
    background-color: rgb(45, 77, 126);
    height: 100% !important; // 继承容器高度
     // 新增文字颜色设置
    --left-menu-text-color: #ffffff; // 普通状态文字颜色
    //--left-menu-text-active-color:rgb(45, 77, 126); // 激活状态文字颜色

        // 新增右移样式
    padding-left: 100px !important;
    //width: calc(100%) !important;
    transition: padding var(--transition-time-02);
      
    // 设置选中时子标题的颜色
    .is-active {
      & > .#{$elNamespace}-sub-menu__title {
        color: var(--left-menu-text-active-color) !important;
        
      }
    }

    // 设置子菜单悬停的高亮和背景色
    .#{$elNamespace}-sub-menu__title,
    .#{$elNamespace}-menu-item {
      //height: 53px;
      border-bottom:none !important;
      padding: 0px 30px;
      font-size:14px;
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
    //height: calc(var(--top-tool-height)) !important;
    height: var(--menu-horizontal-height, 50px) !important;
    :deep(.#{$elNamespace}-menu--horizontal) {
     
    > .#{$elNamespace}-menu-item.is-active {
      border-bottom: none !important;
      &::after {
        content: none !important;
      }
    }
      --left-menu-text-active-color: rgb(45, 77, 126);
      --left-menu-bg-active-color: rgb(223, 235, 255);
      // 重新设置底部高亮颜色
      & > .#{$elNamespace}-sub-menu.is-active {
      
        .#{$elNamespace}-sub-menu__title {
          //border-bottom-color: var(--el-color-primary) !important;
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
        //max-height: calc(var(--top-tool-height) - 2px) !important;
        /* stylelint-disable-next-line */
        //line-height: calc(var(--top-tool-height) - 2px);
        max-height: 50px !important;  // 配合新高度
        line-height: 50px; // 行高等于容器高度
        display: flex;
        align-items: center; // 双重保障
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
