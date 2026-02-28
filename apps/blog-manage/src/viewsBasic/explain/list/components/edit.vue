<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { VbenButton } from '@vben/common-ui';

import { usePgForm, useVbenForm } from '#/adapter';

import { existName, saveOrUpdate } from '../api';
import { selectNodeAllPublic } from '../../category/api';

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
      fieldName: 'categoryId',
      label: '分类',
      rules: 'required',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectNodeAllPublic,
        params: {},
        props: {
          placeholder: '如果为空,则是一级',
          filterable: true,
        },
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
      label: '标识',
      rules: 'required',
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
    },
    {
      tabGroup: 'other',
      fieldName: 'nameFull',
      label: '全称',
      component: 'Input',
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
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '内容',
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
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values, isUpdate, parent } = drawerApi.getData<Record<string, any>>();
      if (values) {
        // console.log('values',values)
        // console.log('values.parent',parent)
        if (parent) {
          values.categoryId = parent.id;
        }
        formApi.setValues(values);
      }else if(parent){
        formApi.setValues({ categoryId: parent.id});
      }

      drawerApi.setState({ title: `说明：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    console.log('values',values)
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    saveOrUpdate(values, isUpdate).then((d) => {
      setTimeout(() => {
        drawerApi.close();
      }, 500);
    });
  } catch (error) {
    console.error(error);
  }
}
</script>
<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
