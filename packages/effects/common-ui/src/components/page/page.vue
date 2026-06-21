<script setup lang="ts">
import type { StyleValue } from 'vue';

import type { PageProps } from './types';

import {
  computed,
  nextTick,
  onActivated,
  onMounted,
  ref,
  useTemplateRef,
} from 'vue';

import {
  CSS_VARIABLE_LAYOUT_FOOTER_HEIGHT,
  CSS_VARIABLE_LAYOUT_HEADER_HEIGHT,
} from '@vben-core/shared/constants';
import { preferences } from '@vben-core/preferences';
import { cn } from '@vben-core/shared/utils';

defineOptions({
  name: 'Page',
});

const {
  autoContentHeight = false,
  heightOffset = 0,
  footerFixed = false,
} = defineProps<PageProps>();

const headerHeight = ref(0);
const footerHeight = ref(0);
const shouldAutoHeight = ref(false);

const headerRef = useTemplateRef<HTMLDivElement>('headerRef');
const footerRef = useTemplateRef<HTMLDivElement>('footerRef');

const footerEnable = preferences.footer.enable;


/**
 * 内容区样式计算
 * autoContentHeight 模式下使用 100vh - header高度 - footer高度 计算内容区高度，
 * 仅在 footer 启用时减去 footer 高度，避免依赖不稳定的 --vben-content-height CSS 变量
 */
const contentStyle = computed<StyleValue>(() => {
  if (autoContentHeight) {
    const footerHeightCalc = footerEnable
      ? `var(${CSS_VARIABLE_LAYOUT_FOOTER_HEIGHT})`
      : '0px';
    return {
      height: `calc(100vh - var(${CSS_VARIABLE_LAYOUT_HEADER_HEIGHT}) - ${footerHeightCalc} - ${headerHeight.value}px - ${footerHeight.value}px - ${typeof heightOffset === 'number' ? `${heightOffset}px` : heightOffset})`,
      overflowY: shouldAutoHeight.value ? 'auto' : 'unset',
    };
  }
  return {};
});

/**
 * 计算内容区高度相关状态
 * 读取 header/footer 实际高度，延迟启用滚动条
 */
async function calcContentHeight() {
  if (!autoContentHeight) {
    return;
  }
  shouldAutoHeight.value = false;
  await nextTick();
  headerHeight.value = headerRef.value?.offsetHeight || 0;

  footerHeight.value = footerFixed ? 0 : footerRef.value?.offsetHeight || 0;

  setTimeout(() => {
    shouldAutoHeight.value = true;
  }, 30);
}

onMounted(() => {
  calcContentHeight();
});

onActivated(() => {
  calcContentHeight();
});
</script>

<template>
  <div class="relative flex h-full flex-col">
    <div
      v-if="
        description ||
        $slots.description ||
        title ||
        $slots.title ||
        $slots.extra
      "
      ref="headerRef"
      :class="
        cn(
          'relative flex items-end border-b border-border bg-card px-6 py-4',
          headerClass,
        )
      "
    >
      <div class="flex-auto">
        <slot name="title">
          <div v-if="title" class="mb-2 flex text-lg font-semibold">
            {{ title }}
          </div>
        </slot>

        <slot name="description">
          <p v-if="description" class="text-muted-foreground">
            {{ description }}
          </p>
        </slot>
      </div>

      <div v-if="$slots.extra">
        <slot name="extra"></slot>
      </div>
    </div>

    <div
      :class="cn(autoContentHeight ? 'h-full' : 'flex-1', 'p-4', contentClass)"
      :style="contentStyle"
    >
      <slot></slot>
    </div>
    <div
      v-if="$slots.footer"
      ref="footerRef"
      :class="cn('align-center flex bg-card px-6 py-4', footerClass)"
    >
      <slot name="footer"></slot>
    </div>
  </div>
</template>
