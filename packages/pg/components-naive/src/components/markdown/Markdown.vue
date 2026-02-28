<script lang="ts" setup>
import { type Ref, useAttrs } from 'vue';
import type { Nullable } from '@vben/types';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onDeactivated,
  ref,
  unref,
  watch,
} from 'vue';

import { preferences } from '@vben/preferences';

import Vditor from 'vditor';

import { getTheme } from './getTheme';
import { onMountedOrActivated } from './onMountedOrActivated';

import 'vditor/dist/index.css';

type Lang = 'en_US' | 'ja_JP' | 'ko_KR' | 'zh_CN' | undefined;

defineOptions({
  inheritAttrs: false,
});
const props = defineProps({
  height: { default: 360, type: Number },
  modelValue: { default: '', type: String },
  upload: { default: {}, type: Object },
});
const emit = defineEmits(['change', 'get', 'update:modelValue']);
const wrapRef = ref(null);
const vditorRef = ref(null) as Ref<Nullable<Vditor>>;
const initedRef = ref(false);
const valueRef = ref(props.modelValue || '');
const instance = {
  getVditor: (): Vditor => vditorRef.value!,
};
const attrs = useAttrs();
watch(
  [() => preferences.theme.mode, () => initedRef.value],
  ([val, inited]) => {
    if (!inited) {
      return;
    }
    instance
      .getVditor()
      ?.setTheme(
        getTheme(val) as any,
        getTheme(val, 'content'),
        getTheme(val, 'code'),
      );
  },
  {
    flush: 'post',
    immediate: true,
  },
);
watch(
  () => props.modelValue,
  (v) => {
    if (v !== valueRef.value) {
      instance.getVditor()?.setValue(v);
    }
    valueRef.value = v;
  },
);

const getCurrentLang = computed((): 'en_US' | 'ja_JP' | 'ko_KR' | 'zh_CN' => {
  let lang: Lang;
  switch (unref(preferences.app.locale)) {
    case 'en': {
      lang = 'en_US';
      break;
    }
    case 'ja': {
      lang = 'ja_JP';
      break;
    }
    case 'ko': {
      lang = 'ko_KR';
      break;
    }
    default: {
      lang = 'zh_CN';
    }
  }
  return lang;
});

function init() {
  const wrapEl = unref(wrapRef) as HTMLElement;
  if (!wrapEl) return;
  const bindValue = { ...attrs, ...props };
  const insEditor = new Vditor(wrapEl, {
    after: () => {
      nextTick(() => {
        insEditor.setValue(valueRef.value);
        vditorRef.value = insEditor;
        initedRef.value = true;
        emit('get', instance);
      });
    },
    blur: () => {
      // unref(vditorRef)?.setValue(props.value);
    },
    // mode: 'sv',
    fullscreen: {
      index: 520,
    },
    input: (v) => {
      valueRef.value = v;
      emit('update:modelValue', insEditor.getValue());
      emit('update:value', insEditor.getValue());
      emit('change', {
        value: v,
        valueMarkdown: insEditor.getValue(),
        valueHtml: insEditor.getHTML(),
      });
    },
    lang: unref(getCurrentLang),
    preview: {
      actions: [],
      hljs: {
        // 设置代码块主题
        style: getTheme(preferences.theme.mode, 'code'),
      },
      theme: {
        // 设置内容主题
        current: getTheme(preferences.theme.mode, 'content'),
      },
    },
    // 设置外观主题
    theme: getTheme(preferences.theme.mode) as any,
    ...bindValue,
    cache: {
      enable: false,
    },
  });
}

function destroy() {
  const vditorInstance = unref(vditorRef);
  if (!vditorInstance) return;
  try {
    vditorInstance?.destroy?.();
  } catch {}
  vditorRef.value = null;
  initedRef.value = false;
}

onMountedOrActivated(init);

onBeforeUnmount(destroy);
onDeactivated(destroy);
</script>
<template>
  <div ref="wrapRef"></div>
</template>
