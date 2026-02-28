<script lang="ts" setup>
import {
  onBeforeUnmount,
  onDeactivated,
  type Ref,
  ref,
  unref,
  watch,
} from 'vue';

import { preferences } from '@vben/preferences';

import Preview from 'vditor';

import { getTheme } from './getTheme';
import { onMountedOrActivated } from './onMountedOrActivated';

const props = defineProps({
  class: { type: String },
  value: { type: String },
});
const viewerRef = ref(null);
const vditorPreviewRef = ref(null) as Ref<Nullable<Preview>>;

function init() {
  const viewerEl = unref(viewerRef) as HTMLElement;
  vditorPreviewRef.value = Preview.preview(viewerEl, props.value, {
    hljs: {
      // 设置代码块主题
      style: getTheme(preferences.theme.mode, 'code'),
    },
    mode: getTheme(preferences.theme.mode, 'content'),
    theme: {
      // 设置内容主题
      current: getTheme(preferences.theme.mode, 'content'),
    },
  });
}
watch(
  () => preferences.theme.mode,
  (val) => {
    Preview.setContentTheme(getTheme(val, 'content'));
    Preview.setCodeTheme(getTheme(val, 'code'));
    init();
  },
);

watch(
  () => props.value,
  (v, oldValue) => {
    v !== oldValue && init();
  },
);

function destroy() {
  const vditorInstance = unref(vditorPreviewRef);
  if (!vditorInstance) return;
  try {
    vditorInstance?.destroy?.();
  } catch {}
  vditorPreviewRef.value = null;
}

onMountedOrActivated(init);

onBeforeUnmount(destroy);
onDeactivated(destroy);
</script>

<template>
  <div id="markdownViewer" ref="viewerRef" :class="$props.class"></div>
</template>
