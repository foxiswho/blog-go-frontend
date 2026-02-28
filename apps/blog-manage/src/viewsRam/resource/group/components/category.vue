<script lang="ts" setup>
import { h } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { VbenButton } from '@vben/common-ui';

import { usePgForm, useVbenForm } from '#/adapter';

import { existName, saveOrUpdate, selectNodeAllPublic } from '../api';
const emit = defineEmits(['ok',]);
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
      fieldName: 'parentId',
      label: '上级',
      defaultValue: '',
      component: 'Input',
      componentProps: {
        api: selectNodeAllPublic,
        params: {},
        props: {
          placeholder: '如果为空,则是一级',
          filterable: true,
        },
      },
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'typeSys',
      label: '类型',
      defaultValue: 'general',
      component: 'Input',
      componentProps: {
        type: 'button',
        options: [
          { label: '普通', value: 'general' },
          { label: '系统', value: 'system' },
          { label: 'api', value: 'api' },
        ],
      },
      rules: 'required',
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'typeAttr',
      label: '属性',
      defaultValue: 'menu',
      component: 'Input',
      componentProps: {
        placeholder: '请选择',
        type: 'button',
        options: [
          { label: '菜单', value: 'menu' },
          { label: '资源', value: 'resource' },
        ],
      },
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'name',
      label: '名称',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {
          const values = await formApi.getValues();
          if (!values.nameFull) {
            formApi.setFieldValue('nameFull', e.target.value);
          }
        },
      },
      rules: 'required',
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
      tabGroup: 'other',
      fieldName: 'nameFl',
      label: '名称英文',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'code',
      label: '资源标识',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {
          const values = await formApi.getValues();
          if (!values.nameFl) {
            formApi.setFieldValue('nameFl', e.target.value);
          }
          if (!values.path) {
            formApi.setFieldValue('path', e.target.value);
          }
        },
      },
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
    {
      tabGroup: 'other',
      fieldName: 'nameFull',
      label: '全称',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'path',
      label: '路径',
      component: 'Input',
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'method',
      label: '方法',
      defaultValue: 'POST',
      component: 'Input',
      componentProps: {
        placeholder: '请选择',
        type: 'button',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PUT', value: 'PUT' },
          { label: 'ALL', value: 'ALL' },
        ],
      },
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
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
      fieldName: 'id',
      label: 'id',
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
const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values, isUpdate } = modalApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }

      modalApi.setState({ title: `分类：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '：',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    // console.log('values',values)
    const { isUpdate } = modalApi.getData<Record<string, any>>();
    values['typeSys'] = 'general';
    values['typeAttr'] = 'menu';
    values['typeCategory'] = 'group';
    saveOrUpdate(values, isUpdate).then((d) => {
      setTimeout(() => {
        formApi.close();
        emit('ok',values);
      }, 500);
    });
  } catch (error) {
    console.error(error);
  }
}
</script>
<template>
  <Modal>
    <Form />
  </Modal>
</template>
