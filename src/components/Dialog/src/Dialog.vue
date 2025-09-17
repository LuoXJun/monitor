<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import { isNumber } from '@/utils/is'
defineOptions({ name: 'Dialog' })

const emit = defineEmits(['toggleFull', 'update:isFullscreen'])

const slots = useSlots()

const props = defineProps({
  resetFullScreenOnClose: propTypes.bool.def(false),
  modelValue: propTypes.bool.def(false),
  title: propTypes.string.def('Dialog'),
  defaultFullscreen: propTypes.bool.def(false),
  fullscreen: propTypes.bool.def(true),
  width: propTypes.oneOfType([String, Number]).def('40%'),
  scroll: propTypes.bool.def(false), // 是否开启滚动条。如果是的话，按照 maxHeight 设置最大高度
  maxHeight: propTypes.oneOfType([String, Number]).def('400px')
})

const getBindValue = computed(() => {
  const delArr: string[] = ['fullscreen', 'title', 'maxHeight', 'appendToBody']
  const attrs = useAttrs()
  const obj = { ...attrs, ...props }
  for (const key in obj) {
    if (delArr.indexOf(key) !== -1) {
      delete obj[key]
    }
  }
  return obj
})

const isFullscreen = ref(props.defaultFullscreen ?? false)

const toggleFull = () => {
  isFullscreen.value = !unref(isFullscreen)
  emit('toggleFull', isFullscreen.value)
}

const dialogHeight = ref(isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight)

watch(
  () => isFullscreen.value,
  async (val: boolean) => {
    await nextTick()
    if (val) {
      const windowHeight = document.documentElement.offsetHeight
      dialogHeight.value = `${windowHeight - 55 - 60 - (slots.footer ? 63 : 0)}px`
    } else {
      dialogHeight.value = isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight
    }

    emit('update:isFullscreen', val)
  },
  {
    immediate: true
  }
)

const dialogStyle = computed(() => {
  return {
    height: unref(dialogHeight)
  }
})

const onClose = () => {
  if (props.resetFullScreenOnClose) {
    isFullscreen.value = false
  }
}
</script>

<template>
  <ElDialog
    v-bind="getBindValue"
    :close-on-click-modal="true"
    :fullscreen="isFullscreen"
    :width="width"
    destroy-on-close
    lock-scroll
    draggable
    align-center
    class="com-dialog"
    :show-close="false"
    @close="onClose"
  >
    <template #header="{ close }">
      <div class="relative h-24px flex items-center justify-between text-18px">
        <slot name="title">
          <div class="dialog-header">
          <span><img src="@/assets/imgs/myUpdate/detailPath.svg" />
          {{ title }}
          </span>
          </div>
        </slot>
        <div
          class="absolute right-22px top-[50%] h-24px flex translate-y-[-50%] items-center justify-between"
        >
          <Icon
            v-if="fullscreen"
            class="is-hover mr-10px cursor-pointer text-24px!"
            :icon="isFullscreen ? 'radix-icons:exit-full-screen' : 'radix-icons:enter-full-screen'"
            color="var(--el-color-info)"
            hover-color="var(--el-color-primary)"
            @click="toggleFull"
          />
          <!-- <Icon
            class="is-hover cursor-pointer text-24px!"
            icon="ep:close"
            hover-color="var(--el-color-primary)"
            color="var(--el-color-info)"
            @click="close"
          /> -->
           <Icon
            class="is-hover cursor-pointer text-20px!"
            icon="ep:close"
            hover-color="var(--el-color-primary)"
            color="#fff"
            @click="close"
          />
        </div>
      </div>
    </template>

    <ElScrollbar v-if="scroll" :style="dialogStyle">
      <slot></slot>
    </ElScrollbar>
    <slot v-else></slot>
    <template v-if="slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </ElDialog>
</template>

<style lang="scss">

.com-dialog {
  --el-dialog-padding-primary: 0px !important;
  padding: 0 0 20px 0!important;
  .#{$elNamespace}-overlay-dialog {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .#{$elNamespace}-dialog {
    margin: 0 !important;

    &__header {
      // height: 54px;
      padding: 0;
      margin-right: 0 !important;
      // border-bottom: 1px solid var(--el-border-color);
      margin-bottom: 20px;
    }

    &__body {
      padding: 15px !important;
      margin-top: 20px !important;
    }

    &__footer {
      // border-top: 1px solid var(--el-border-color);
      margin-right:20px !important;

    }

    &__headerbtn {
      top: 0;
    }
  }
  .dialog-header {
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  color: white;
  box-sizing: border-box; /* 确保填充不增加总宽度 */
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  font-size: 16px;
  text-indent: 1em;
  background-color:#2b4a7c;
  img{
    margin-right: 3px;
    vertical-align: bottom;
  }
}
}
</style>
