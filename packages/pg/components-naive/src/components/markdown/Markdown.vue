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
import {useMessage} from "naive-ui";

type Lang = 'en_US' | 'ja_JP' | 'ko_KR' | 'zh_CN' | undefined;
const message = useMessage();
defineOptions({
  inheritAttrs: false,
});
const props = defineProps({
  height: { default: 360, type: Number },
  modelValue: { default: '', type: String },
  upload: { default: () => {}, type: Function },
  uploadSetting: { default: {
      accept:
        'image/*,.zip,.rar,.7z,.tar,.gzip,.bz2,.jar,.jpg,.jpeg,.png,.gif,.webp,.webm,.bmp,.mp3,.mp4,.wav,.mov,.weba,.mkv',
      multiple: false,   // 是否允许多文件，根据你的需求设置
      max: 90 * 1024 * 1024, // 可选，前端大小限制（Vditor 自带校验）
    }, type: Object },
  uploadByMarkdown: { default: () => {}, type: Function },
  params: { default: {}, type: Object },
});
const emit = defineEmits(['change', 'get', 'update:modelValue']);
const wrapRef = ref(null);
const vditorRef = ref(null) as Ref<Nullable<Vditor>>;
const initedRef = ref(false);
const uploadSetting = ref({
  accept:
    'image/*,.zip,.rar,.7z,.tar,.gzip,.bz2,.jar,.jpg,.jpeg,.png,.gif,.webp,.webm,.bmp,.mp3,.mp4,.wav,.mov,.weba,.mkv',
  multiple: false,   // 是否允许多文件，根据你的需求设置
  max: 20 * 1024 * 1024, // 可选，前端大小限制（Vditor 自带校验）
  handler: (files:File)=>{},
});
const valueRef = ref(props.modelValue || '');
const instance = {
  getVditor: (): Vditor => vditorRef.value!,
};
const attrs = useAttrs();
//
if(props?.uploadSetting){
  if(props?.uploadSetting?.accept){
    uploadSetting.value.accept = props?.uploadSetting?.accept;
  }
  if(props?.uploadSetting?.multiple){
    uploadSetting.value.multiple = props?.uploadSetting?.multiple;
  }
  if(props?.uploadSetting?.max){
    uploadSetting.value.max = props?.uploadSetting?.max;
  }
}

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
  (v,old) => {
    if (v !== valueRef.value && v !== old) {
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


/**
 * 定义自定义上传函数
 * @param
 */
uploadSetting.value.handler = (files:any)=> {
// files: File 数组（即使 multiple: false 也以数组形式传入）
  // editor: Vditor 编辑器实例，可用于插入内容或显示提示

  // 1. 定义 accept 支持的所有 MIME 类型（基于原来的 accept 字符串）
  const acceptPattern = /\.(zip|rar|7z|tar|gzip|bz2|jar|jpg|jpeg|png|gif|webp|webm|bmp|mp3|mp4|wav|mov|weba|mkv)$/i;

  // 2. 遍历每个文件（支持多文件上传）
  files.forEach(async (file) => {
    // 2.1 文件类型校验（根据 accept）
    const fileExt = '.' + file.name.split('.').pop();
    const isImage = file.type.startsWith('image/');
    const isAcceptedExt = acceptPattern.test(file.name);
    if (!isImage && !isAcceptedExt) {
      message.error('不支持该文件类型');
      return;
    }

    // 可选：大小校验（比如限制 20MB）
    if (file.size > 20 * 1024 * 1024) {
      message.error('文件大小不能超过 20MB');
      return;
    }

    // 2.2 应用 filename 过滤函数
    const sanitizedFileName = file.name
      .replace(/[^(a-zA-Z0-9\u4e00-\u9fa5.)]/g, '')
      .replace(/[?\\/:|<>*[\]()$%{}@~]/g, '')
      .replace('/\\s/g', '');

    // 2.3 构造 FormData
    const formData = new FormData();
    formData.append('file', file, sanitizedFileName); // fieldName 为 'file'
    if(props.params){
      Object.keys(props.params).forEach((key) => {
        formData.append(key,props.params[key]);
      });
    }
    // 2.4 发送请求
    try {
      const response = await props.uploadByMarkdown(formData);
      //
      //const responseText = await response.text(); // 获取原始响应文本（用于 format 逻辑）
     console.log('response=',response)
      // 2.5 模拟原有的 format 解析，构建 succMap
      let succMap = {};
      try {
        // 根据你的后端响应结构，假设 json.data 是一个对象，key 为文件名或标识，value 包含 url 和 sourceName
        for (const key in response) {
          const item = response[key];
          const mapKey = item.originalName ? item.originalName : key;
          succMap[mapKey] = item.url;
        }
      } catch (e) {
        console.error('解析响应失败', e);
        message.error('上传响应解析错误');
        return;
      }

      // 2.6 将每个成功上传的文件插入编辑器
      // 注意：succMap 的 key 是原始文件名（处理后的），value 是访问 URL
      const originalFileName = sanitizedFileName;
      const fileUrl = succMap[originalFileName];
      if (fileUrl) {
        // 判断是否为图片类型
        if (file.type.startsWith('image/')) {
          // 图片：插入 Markdown 图片语法
          instance.getVditor()?.insertValue(`![${originalFileName}](${fileUrl})`);
        } else {
          // 非图片：插入普通链接
          instance.getVditor()?.insertValue(`[${originalFileName}](${fileUrl})`);
        }
      } else {
        message.error(`文件 ${originalFileName} 上传成功但无法获取 URL`);
      }
    } catch (error) {
      console.error('上传请求失败', error);
      message.error('网络错误，上传失败');
    }
  });
}


function init() {
  const wrapEl = unref(wrapRef) as HTMLElement;
  if (!wrapEl) return;
  const bindValue = { ...attrs, ...props,
  upload: uploadSetting.value
  };
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
        fileOwner: props.fileOwner,
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
