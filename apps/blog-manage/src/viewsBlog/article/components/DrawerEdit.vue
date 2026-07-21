<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { useAccessStore } from '@vben/stores';

import { stateYesNoOption } from '@pg/types';
import {
  TypeContentOptions,
  TypeDataSourceOptions,
  TypeReadingOptions,
  TypeSourceOptions,
} from '@pg/types/src/blog/type';
import {PgMarkdown} from '@pg/components-n';
import dayjs from "dayjs";
import { NTag } from 'naive-ui';

import ModalTagTpl from '#/viewsBasic/tags/relation/invoke/ModalTag.vue';
import TopicTable from '#/viewsBlog/article/components/TopicTable.vue';
import { selectNodeAllPublic as selectNodeAllPublicCategory } from '#/viewsBlog/articleCategory/api';

import { detail, existCode, existName, saveOrUpdate } from '../api';

const emit = defineEmits(['ok']);
const currentData = ref({});
const optionsTags = ref({});
const showTopic = ref(false);
const selectData = ref([]);
const contentData = ref({
  value: '',
  valueHtml: '',
  valueMarkdown: '',
});
const [ModalTag, modalTagApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ModalTagTpl,
});
function optionsTagsValue(tag) {
  if (optionsTags.value[tag]) {
    return optionsTags.value[tag];
  }
  return {
    label: tag,
    value: tag,
    data: {
      id: '',
      tagNo: tag,
      name: tag,
      attributeMap: {
        type: 'default',
        bordered: true,
        color: {},
        round: false,
        // size: 'small',
        strong: true,
      },
    },
  };
}
const renderTag = (tag: string, index: number) => {
  console.log('renderTag.tag', tag);
  console.log('renderTag.typeof', typeof tag);
  return h(
    NTag,
    {
      type: optionsTagsValue(tag).data.attributeMap.type as
        | 'default'
        | 'error'
        | 'info'
        | 'success'
        | 'warning',
      bordered: optionsTagsValue(tag).data.attributeMap.bordered,
      color: optionsTagsValue(tag).data.attributeMap.color,
      round: optionsTagsValue(tag).data.attributeMap.round,
      size: optionsTagsValue(tag).data.attributeMap.size,
      strong: optionsTagsValue(tag).data.attributeMap.strong,
      closable: true,
      onClose: async (e: MouseEvent) => {
        const values = await formApi.getValues();
        if (values.tags) {
          let valTags = [...values.tags];
          valTags.splice(index, 1);
          formApi.setFieldValue('tags', valTags);
        }
      },
    },
    { default: () => optionsTagsValue(tag).label },
  );
};
const [Form, formApi] = usePgForm({
  // 按下回车健时提交表单
  submitOnEnter: false,
  tabs: {
    active: 'home',
    group: [
      { value: 'home', label: '基本' },
      { value: 'source', label: '来源' },
      { value: 'seo', label: 'Seo' },
      { value: 'other', label: '其他' },
      { value: 'topic', label: '话题' },
    ],
    props: {
      onUpdateValue: (value) => {
        if (value === 'topic') {
          showTopic.value = true;
        } else {
          showTopic.value = false;
        }
      },
    },
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
            class: 'pg-button-size-small',
            type: 'button',
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
      fieldName: 'categoryNo',
      label: '分类',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectNodeAllPublicCategory,
        params: { by: 'no' },
        props: {
          placeholder: '如果为空,则是一级',
          filterable: true,
        },
      },
    },
    {
      tabGroup: '_no_tabs',
      fieldName: 'tags',
      label: '标签',
      defaultValue: [],
      component: '',
      componentProps: {
        filterable: true,
        multiple: true,
        tag: true,
        show: false,
        renderTag,
        // onCreate:async (label) => {
        //   // const values = await formApi.getValues();
        //   // if(-1 !== values.tags.indexOf(label)) {
        //   //   return;
        //   // }
        //   return ({
        //     label: label,
        //     value: label,
        //   });
        // },
      },
      suffix: () =>
        h(
          VbenButton,
          {
            class: 'pg-button-size-small',
            type: 'button',
            onClick: async (e) => {
              modalTagApi.setData({
                values: {},
                isUpdate: false,
              });
              modalTagApi.open();
            },
          },
          () => h('span', { class: 'font-normal' }, '选择'),
        ),
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
      tabGroup: 'other',
      fieldName: 'code',
      label: '标记',
      defaultValue: '系统自动建立',
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
            class: 'pg-button-size-small',
            type: 'button',
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
      label: '图集',
      defaultValue: {},
      component: 'PgUploadGroupOwner',
      componentProps: {
        isStandalone: false,
        group: [
          {
            name: '主图',
            key: 'main',
            // description: '其他说明 图片大小：宽 500px ,高 400px,图片大小：宽 500px ,高 400px',
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
        ],
      }
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
      component: 'PgMarkdown',
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
      fieldName: 'urlSource',
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
      fieldName: 'urlRewriting',
      label: '自定义伪静态',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'seo',
      fieldName: 'pageTitle',
      label: 'seo网页标题',
      component: 'Input',
      componentProps: {},
    },
    {
      tabGroup: 'seo',
      fieldName: 'seoKeywords',
      label: 'seo关键词',
      component: 'Input',
      componentProps: {},
    },
    {
      tabGroup: 'seo',
      fieldName: 'seoDescription',
      label: 'seo网站说明',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '描述',
      },
    },
    {
      tabGroup: 'seo',
      fieldName: 'read',
      label: '访问数',
      component: 'PgSpan',
      componentProps: {},
    },
    {
      tabGroup: 'seo',
      fieldName: 'comment',
      label: '评论数',
      component: 'PgSpan',
      componentProps: {},
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
  showDefaultActions: false,
});
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false,
        destroyOnClose: true,
      });
      let data = {};
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      if (isUpdate) {
        detail(values.id).then((d) => {
          currentData.value = d;
          console.log('detail', d);
          data = {
            ...d,
            ...d.statistics,
          };
          data.comment = d.statistics.comment;
          data.read = d.statistics.read;
          data.pageTitle = d.statistics.pageTitle;
          data.seoDescription = d.statistics.seoDescription;
          data.seoKeywords = d.statistics.seoKeywords;
          if (d.topicData) {
            selectData.value = d.topicData;
          }
          if (d.tagsStyle) {
            for (const obj of d.tagsStyle) {
              const tag = {
                label: obj.name,
                value: obj.tagNo,
                data: obj,
              };
              const get = optionsTags.value[obj.tagNo];
              if (!get) {
                optionsTags.value[obj.tagNo] = tag;
              }
            }
          }
          formApi.setValues(data);
          //
        });
      } else {
        formApi.setFieldValue('operationTime',dayjs().format('YYYY-MM-DD HH:mm:ss'))
      }

      drawerApi.setState({ title: `文章：${isUpdate ? '编辑' : '新增'}`, loading: false });
    }
  },
  title: '：',
});
// 页面首次渲染完成后执行
// onMounted(() => {

// });
/**
 * 提交
 */
async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values = await formApi.getValues<Omit<Record<string, any>, 'id'>>();
  drawerApi.lock();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    let data = {
      ...values,
    };
    data.statistics = {
      // comment: values.comment,
      // read: values.read,
      pageTitle: values.pageTitle,
      seoDescription: values.seoDescription,
      seoKeywords: values.seoKeywords,
    };
    data.topics = [];
    if (selectData.value && selectData.value.length > 0) {
      for (const item of selectData.value) {
        data.topics.push(item.no);
      }
    }
    console.log('contentData.value', contentData.value);
    //
    saveOrUpdate(data, isUpdate)
      .then((d) => {
        setTimeout(() => {
          emit('ok', data);
          drawerApi.setState({ loading: false });
          drawerApi.close();
        }, 900);
      });
  } catch (error) {
    console.error(error);
    drawerApi.setState({confirmLoading: false});
  } finally {
    drawerApi.unlock();
    drawerApi.setState({loading: false});
  }
}


function okSelectData(opt) {
  console.log('opt', opt);
  selectData.value = opt;
}
async function modalOkTags(e) {
  console.log('modalOkTags', e);
  if (e) {
    let tagsQuery = [];
    const values = await formApi.getValues();
    if (values.hasOwnProperty('tags')) {
      tagsQuery = [];
      for (const i in values.tags) {
        tagsQuery.push(values.tags[i]);
      }
    }
    for (const i in e) {
      const obj = e[i];
      const tag = {
        label: obj.name,
        value: obj.tagNo,
        data: obj,
      };
      const get = optionsTags.value[obj.tagNo];
      if (!get) {
        optionsTags.value[obj.tagNo] = tag;
      }
      if (-1 === tagsQuery.indexOf(obj.tagNo)) {
        tagsQuery.push(obj.tagNo);
      }
    }
    formApi.setFieldValue('tags', tagsQuery);
  }
}
async function handleEnter(sub, e) {
  let val = e.target.value;
  // sub(val);
  // console.log('handleEnter', val);
  e.stopPropagation();
  let tagsQuery = [];
  const values = await formApi.getValues();
  if (values.hasOwnProperty('tags')) {
    tagsQuery = [];
    for (const i in values.tags) {
      tagsQuery.push(values.tags[i]);
    }
  }
  if (-1 === tagsQuery.indexOf(val)) {
    tagsQuery.push(val);
    formApi.setFieldValue('tags', tagsQuery);
  }
}

</script>
<template>
  <Drawer class="w-[1200px]">
    <Form>
      <template #tags="tpl">
        <n-dynamic-tags v-model:value="tpl.modelValue" v-bind="tpl">
          <template #input="{ submit, deactivate }">
            <n-input
              size="small"
              @blur="deactivate"
              @keydown.enter="handleEnter(submit, $event)"
            />
          </template>
        </n-dynamic-tags>
      </template>
    </Form>
    <TopicTable v-if="showTopic" @ok="okSelectData" :data="selectData" />
    <ModalTag @ok="modalOkTags" />
  </Drawer>
</template>
