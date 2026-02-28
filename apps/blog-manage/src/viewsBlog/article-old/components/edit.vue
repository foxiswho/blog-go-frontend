<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';
import { usePgForm } from '#/adapter';
import {
  PgUploadGroup,
  PgSku,
  PgMarkdown,
  PgTreeSelect,
  PgPageHeader,
} from '@pg/components-n';
const { uploadUrl } = useAppConfig(import.meta.env, import.meta.env.PROD);
const accessStore = useAccessStore();
import { existCode, existName, saveOrUpdate } from '../api';
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';
import { stateYesNoOption } from '@pg/types';
import {
  TypeContentOptions,
  TypeDataSourceOptions,
  TypeReadingOptions,
  TypeSourceOptions,
} from '@pg/types/src/blog/type';

const emit = defineEmits(['ok']);
const contentData = ref({
  value: '',
  valueHtml: '',
  valueMarkdown: '',
});
const [Form, formApi] = usePgForm({
  tabs: {
    active: 'home',
    group: [
      { value: 'home', label: '基本' },
      { value: 'source', label: '来源' },
      { value: 'other', label: '其他' },
    ],
  },
  schema: [
    {
      tabGroup: '_no_tabs',
      fieldName: 'name',
      label: '名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {
          const values = await formApi.getValues();
          if (!values.nameFull) {
            formApi.setFieldValue('nameFull', e.target.value);
          }
        },
      },
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formApi.getValues();
              existName(values.name, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: '_no_tabs',
      fieldName: 'tag',
      label: '标签',
      component: 'Select',
      componentProps: {
        filterable: true,
        multiple: true,
        tag: true,
      },
    },
    {
      tabGroup: 'other',
      fieldName: 'nameFl',
      label: '名称英文',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'code',
      label: '编码',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {
          const values = await formApi.getValues();
          if (!values.nameFl) {
            formApi.setFieldValue('nameFl', e.target.value);
          }
        },
      },
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formApi.getValues();
              existCode(values.code, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'other',
      fieldName: 'nameFull',
      label: '全称',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'typeContent',
      label: '内容类型',
      defaultValue: 'original',
      component: 'PgRadioGroup',
      componentProps: {
        type: 'button',
        options: TypeContentOptions,
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'typeSource',
      label: '源类型',
      defaultValue: 'handwritten',
      component: 'PgRadioGroup',
      componentProps: {
        type: 'button',
        options: TypeSourceOptions,
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'typeReading',
      label: '阅读',
      defaultValue: 'unread',
      component: 'PgRadioGroup',
      componentProps: {
        type: 'button',
        options: TypeReadingOptions,
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'state',
      label: '状态',
      defaultValue: 1,
      component: 'PgRadioGroup',
      componentProps: {
        type: 'button',
        options: stateYesNoOption,
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'typeComment',
      label: '允许评论',
      defaultValue: 'yes',
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
        checkedValue: 'yes',
        uncheckedValue: 'no',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'operationTime',
      label: '操作时间',
      component: 'PgDatePicker',
      componentProps: {
        isTimestamp: false,
        type: 'datetime',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
        // formattedValue:'2022-11-10 11:11:11',
        // defaultValue:'2022-11-10 11:11:11',
        shortcuts: {
          昨天: () => Date.now() - 24 * 60 * 60 * 1000,
        },
        // onUpdateValue: (value, formattedValue) => {
        //     console.log('OnUpdateValue', value, formattedValue)
        // }
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'attachment',
      label: '商品图集',
      defaultValue: {},
      component: '',
    },
    {
      tabGroup: 'home',
      fieldName: 'description',
      label: '描述',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '描述',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'content',
      label: '内容',
      component: 'Input',
    },
    {
      tabGroup: 'source',
      fieldName: 'typeDataSource',
      label: '数据源类型',
      defaultValue: 'platform',
      component: 'PgRadioGroup',
      componentProps: {
        type: 'button',
        options: TypeDataSourceOptions,
      },
      rules: 'required',
    },
    {
      tabGroup: 'source',
      fieldName: 'author',
      label: '作者',
      component: 'Input',
      defaultValue: '风.foxwho',
      componentProps: {
        placeholder: '请输入',
      },
      rules: 'required',
    },
    {
      tabGroup: 'source',
      fieldName: 'source',
      label: '来源平台',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'source',
      fieldName: 'url_source',
      label: '来源地址',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'source',
      fieldName: 'jump',
      label: '跳转',
      defaultValue: 2,
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
        checkedValue: 1,
        uncheckedValue: 2,
      },
    },
    {
      tabGroup: 'source',
      fieldName: 'url_rewriting',
      label: '自定义伪静态',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'other',
      fieldName: 'pageTitle',
      label: 'seo网页标题',
      component: 'Input',
      componentProps: {},
    },
    {
      tabGroup: 'other',
      fieldName: 'seoKeywords',
      label: 'seo关键词',
      component: 'Input',
      componentProps: {},
    },
    {
      tabGroup: 'other',
      fieldName: 'seoDescription',
      label: 'seo网站说明',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '描述',
      },
    },
    {
      fieldName: 'id',
      label: 'id',
      defaultValue: '0',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
  ],
  handleSubmit: onSubmit,
  showDefaultActions: false,
});
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }

      drawerApi.setState({ title: `币制：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    drawerApi.setState({ loading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    let data = {
      ...values,
    };
    data.content = contentData.value.valueMarkdown;
    //
    saveOrUpdate(data, isUpdate)
      .then((d) => {
        setTimeout(() => {
          emit('ok', data);
          drawerApi.setState({ loading: false });
          drawerApi.close();
        }, 900);
      })
      .catch((error) => {
        drawerApi.setState({ loading: false });
      });
  } catch (error) {
    drawerApi.setState({ loading: false });
    console.error(error);
  }
}
const attachmentGroup = ref([
  {
    name: '主图',
    key: 'main',
    description: '其他说明 图片大小：宽 500px ,高 400px',
    headerExtra: ',图片大小：宽 500px ,高 400px',
    width: '500px',
    height: '400px',
    maxNumber: 1,
    maxSize: 30,
  },
  {
    name: '列表图',
    key: 'list',
    description: '其他说明 图片大小：宽 500px ,高 400px',
    headerExtra: ',图片大小：宽 500px ,高 400px',
    width: '500px',
    height: '400px',
    maxNumber: 1,
    maxSize: 30,
  },
  {
    name: '轮播图',
    key: 'carousel',
    description: '其他说明 图片大小：宽 500px ,高 400px',
    descriptionIsHtml: false,
    headerExtra: ',图片大小：宽 500px ,高 400px',
    width: '500px',
    height: '400px',
    maxNumber: 21,
    maxSize: 30,
  },
]);
const uploadSettingFetch = ref({
  params: {},
  header: {
    Authorization: `Bearer ${accessStore.accessToken}`,
  },
  // url
  url: uploadUrl,
  // 链接
  urlLink: `${uploadUrl}-link`,
  // 列表
  urlList: `${uploadUrl}-list`,
  // 二维码url
  urlQr: `${uploadUrl}-qr`,
});
const upload = ref({
  accept: 'image/*,.mp3,.mp4 .wav, .rar,.zip,.7z,.tar',
  headers: {
    Authorization: `Bearer ${accessStore.accessToken}`,
  },
  url: `${uploadUrl}-more`,
  fieldName: 'file',
  filename(e) {
    return e
      .replaceAll(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '')
      .replaceAll(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '')
      .replace('/\\s/g', '');
  },
  format(files, responseText) {
    // console.log('files',files)
    // console.log('files',files[0])
    // console.log('responseText',responseText)
    const succMap = {};
    try {
      // var json = (new Function("return " + responseText))();//第三种
      const json = JSON.parse(responseText);
      // console.log('responseText',json.data)
      for (const jsonKey in json.data) {
        const item = json.data[jsonKey];
        succMap[item.sourceName ? item.sourceName : jsonKey] = item.url;
      }
    } catch (error) {
      console.log('eeee', error);
    }

    return JSON.stringify({
      msg: '',
      code: 0,
      data: {
        succMap,
      },
    });
  },
  // success(editor: HTMLPreElement, msg: string){
  //   console.log('editor',editor)
  //   console.log('msg',msg)
  // }
  // filename (name) {
  //   console.log('xxxxxx',name)
  //   return name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '').
  //   replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '').
  //   replace('/\\s/g', '')
  // },
});
/**
 * markdown 保存
 * @param opt
 */
function updateMarkdownChange(opt) {
  console.log('updateMarkdownChange', opt);
  contentData.value = opt;
}
function PgUploadOk(data) {
  console.log('PgUploadOk', data);
}
</script>
<template>
  <Drawer class="w-[1200px]">
    <Form>
      <template #attachment="tpl">
        <PgUploadGroup
          key="main"
          v-model="tpl.modelValue"
          :fetch-setting="uploadSettingFetch"
          :group="attachmentGroup"
          @ok="PgUploadOk"
        />
      </template>
      <template #content="tpl">
        <PgMarkdown
          v-model="tpl.modelValue"
          :upload="upload"
          style="width: 100%"
          width="100%"
          @change="updateMarkdownChange"
        />
      </template>
    </Form>
  </Drawer>
</template>
