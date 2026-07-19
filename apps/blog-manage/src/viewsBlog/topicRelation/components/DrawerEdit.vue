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
            class: 'pg-button-size-small',
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
            class: 'pg-button-size-small',
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
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      console.log('modalData=>', { values, isUpdate });
      if (values) {
        formApi.setValues(values);
      }

      drawerApi.setState({
        title: `话题文章：${isUpdate ? '编辑' : '新增'}`,
        loading: false,
      });
    }
  },
  title: '：',
});

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
    saveOrUpdate(values, isUpdate)
      .then((d) => {
        setTimeout(() => {
          emit('ok', values);
          drawerApi.setState({ loading: false });
          drawerApi.close();
        }, 500);
      });
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>
<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
