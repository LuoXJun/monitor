import { reactive } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { getConfigKeyByFlwTags, judgeIsAdmin, getDashboardConfigByKey } from '@/constants/workbench'

export const useWorkbench = () => {
  const userStore = useUserStore()
  // console.log('🚀 ~ useWorkbench ~ userStore:', userStore)
  const roles = userStore.getRoles
  const configKey = ref(getConfigKeyByFlwTags(roles, userStore.flwTags))
  // console.log('🚀 ~ useWorkbench ~ configKey:', configKey)
  const dashboardConfig = reactive({ data: {} })

  const isAdmin = judgeIsAdmin(roles, userStore.flwTags)

  watch(
    () => configKey.value,
    (value) => {
      const _config = getDashboardConfigByKey(value)
      dashboardConfig.data = _config
    },
    { immediate: true }
  )

  const updateConfigKey = (key: string) => {
    configKey.value = key
  }

  return {
    isAdmin,
    configKey,
    dashboardConfig,
    updateConfigKey,
    getDashboardConfigByKey
  }
}
