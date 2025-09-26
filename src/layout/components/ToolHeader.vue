<script lang="tsx">
import { defineComponent, computed } from 'vue';
import { UserInfo } from '@/layout/components/UserInfo';
import { useAppStore } from '@/store/modules/app';
import { useDesign } from '@/hooks/web/useDesign';
import { Logo } from '@/layout/components/Logo';

const { getPrefixCls, variables } = useDesign();

const prefixCls = getPrefixCls('tool-header');

const appStore = useAppStore();

// logo
const logo = computed(() => appStore.logo);

export default defineComponent({
    name: 'ToolHeader',
    setup() {
        return () => (
            <div
                id={`${variables.namespace}-tool-header`}
                class={[
                    prefixCls,
                    'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-between',
                    'dark:bg-[var(--el-bg-color)]'
                ]}
            >
                {logo.value ? <Logo></Logo> : undefined}
                {}
                <div class="h-full flex items-center">
                    <UserInfo></UserInfo>
                </div>
            </div>
        );
    }
});
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-tool-header;

.#{$prefix-cls} {
    transition: left var(--transition-time-02);
}
</style>
