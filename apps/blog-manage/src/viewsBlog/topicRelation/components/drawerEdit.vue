<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { VbenButton } from '@vben/common-ui';

import { YesNoOptions } from '@pg/types';

import { useVbenForm, usePgForm } from '#/adapter';

import { existName, saveOrUpdate, existCountryCode } from '../api';

const emit = defineEmits(['ok']);
const [Form, formApi] = usePgForm({
  tabs: {
    active: 'home',
    group: [
      { value: 'home', label: '基本' },
      { value: 'other', label: '其他' },
    ],
  },
  schema: [
    {
      tabGroup: 'home',
      fieldName: 'topicNo',
      label: '话题编号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        readonly: true,
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'topicName',
      label: '话题',
      component: 'PgSpan',
      componentProps: {},
    },
    {
      tabGroup: 'home',
      fieldName: 'articleNo',
      label: '文章编号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        readonly: true,
      },
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formApi.getValues();
              //existName(values.name, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '选择文章'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'name',
      label: '文章名称',
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
      tabGroup: 'home',
      fieldName: 'description',
      label: '文章描述',
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
      const modalData = drawerApi.getData<Record<string, any>>();
      console.log('modalData=>', modalData);
      if (modalData.values) {
        formApi.setValues(modalData.values);
      }

      drawerApi.setState({ title: `话题文章：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '：',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    drawerApi.setState({ loading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    saveOrUpdate(values, isUpdate)
      .then((d) => {
        setTimeout(() => {
          emit('ok', values);
          drawerApi.setState({ loading: false });
          drawerApi.close();
        }, 500);
      })
      .catch((error) => {
        drawerApi.setState({ loading: false });
      });
  } catch (error) {
    drawerApi.setState({ loading: false });
    console.error(error);
  }
}
</script>
<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
