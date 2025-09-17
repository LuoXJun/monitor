// import { ElSubMenu, ElMenuItem } from 'element-plus'
// import { hasOneShowingChild } from '../helper'
// import { isUrl } from '@/utils/is'
// import { useRenderMenuTitle } from './useRenderMenuTitle'
// import { pathResolve } from '@/utils/routerHelper'

// const { renderMenuTitle } = useRenderMenuTitle()

// export const useRenderMenuItem = () =>
//   // allRouters: AppRouteRecordRaw[] = [],
//   {
//     const renderMenuItem = (routers: AppRouteRecordRaw[], parentPath = '/') => {
//       return routers
//         .filter((v) => !v.meta?.hidden)
//         .map((v) => {
//           const meta = v.meta ?? {}
//           const { oneShowingChild, onlyOneChild } = hasOneShowingChild(v.children, v)
//           const fullPath = isUrl(v.path) ? v.path : pathResolve(parentPath, v.path) // getAllParentPath<AppRouteRecordRaw>(allRouters, v.path).join('/')
//           console.log(fullPath)
//           if (
//             oneShowingChild &&
//             (!onlyOneChild?.children || onlyOneChild?.noShowingChildren) &&
//             !meta?.alwaysShow
//           ) {
//             return (
//               <ElMenuItem
//                 index={onlyOneChild ? pathResolve(fullPath, onlyOneChild.path) : fullPath}
//               >
//                 {{
//                   default: () => renderMenuTitle(onlyOneChild ? onlyOneChild?.meta : meta)
//                 }}
//               </ElMenuItem>
//             )
//           } else {
//             return (

//               <ElSubMenu index={fullPath}>
//                 {{
//                   title: () => renderMenuTitle(meta),
//                   default: () => renderMenuItem(v.children!, fullPath)
//                 }}
//               </ElSubMenu>
//             )
//           }
//         })
//     }

//     return {

//       renderMenuItem
//     }
//   }

import { ElSubMenu, ElMenuItem } from 'element-plus'
import { hasOneShowingChild } from '../helper'
import { isUrl } from '@/utils/is'
import { useRenderMenuTitle } from './useRenderMenuTitle'
import { pathResolve } from '@/utils/routerHelper'
import { useRoute } from 'vue-router'

const route = useRoute()

const { renderMenuTitle } = useRenderMenuTitle()

export const useRenderMenuItem = () =>
  // allRouters: AppRouteRecordRaw[] = [],
  {
    const renderMenuItem = (
      routers: AppRouteRecordRaw[],
      parentPath = '/',
      type: string = 'vertical'
    ) => {
      return routers
        .filter((v) => !v.meta?.hidden)
        .map((v) => {
          const meta = v.meta ?? {}
          const { oneShowingChild, onlyOneChild } = hasOneShowingChild(v.children, v)
          const fullPath = isUrl(v.path) ? v.path : pathResolve(parentPath, v.path) // getAllParentPath<AppRouteRecordRaw>(allRouters, v.path).join('/')
          if (
            oneShowingChild &&
            (!onlyOneChild?.children || onlyOneChild?.noShowingChildren) &&
            !meta?.alwaysShow
          ) {
            // if(meta.title==='试验中心'){
            //   return (
            //     <ElMenuItem
            //       index='/index?key=jc'
            //     >
            //       {{

            //         default: () => renderMenuTitle(onlyOneChild ? onlyOneChild?.meta : meta,type)
            //       }}
            //     </ElMenuItem>
            //   )
            // }else if(meta.title==='物探中心'){
            //   return (
            //     <ElMenuItem
            //       index='/index?key=wt'
            //     >
            //       {{
            //         default: () => renderMenuTitle(onlyOneChild ? onlyOneChild?.meta : meta,type)
            //       }}
            //     </ElMenuItem>
            //   )
            // }else if(meta.title==='测量中心'){
            //   return (
            //     <ElMenuItem
            //       index='/index?key=cl'
            //     >
            //       {{
            //         default: () => renderMenuTitle(onlyOneChild ? onlyOneChild?.meta : meta,type)
            //       }}
            //     </ElMenuItem>
            //   )
            // }else if(meta.title==='数字场景'){
            //   return (
            //     <ElMenuItem
            //       index='/index?key=data'
            //     >
            //       {{
            //         default: () => renderMenuTitle(onlyOneChild ? onlyOneChild?.meta : meta,type)
            //       }}
            //     </ElMenuItem>
            //   )
            // }else{
            return (
              <ElMenuItem
                index={onlyOneChild ? pathResolve(fullPath, onlyOneChild.path) : fullPath}
              >
                {{
                  default: () => renderMenuTitle(onlyOneChild ? onlyOneChild?.meta : meta, type)
                }}
              </ElMenuItem>
            )
            // }
          } else {
            if (type == 'vertical') {
              return (
                <ElSubMenu index={fullPath}>
                  {{
                    title: () => renderMenuTitle(meta, type),
                    default: () => renderMenuItem(v.children!, fullPath)
                  }}
                </ElSubMenu>
              )
            } else {
              return (
                <ElMenuItem index={fullPath}>
                  {{
                    title: () => renderMenuTitle(meta, type)
                    //default: () => renderMenuItem(v.children!, fullPath)
                  }}
                </ElMenuItem>
              )
            }
          }
        })
    }

    return {
      renderMenuItem
    }
  }
