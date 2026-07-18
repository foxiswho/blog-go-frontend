<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { VbenButton } from '@vben/common-ui';

import { useVbenForm, usePgForm } from '#/adapter';
import {typeCodePublic} from "#/viewsBasic/data-dict/dict/api";
import {selectNodeAllPublic} from "#/viewsBasic/smsMailCategory/api";

import { existName, saveOrUpdate,existSpTemplateCode } from '../api';
import {NTag} from "naive-ui";
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
      fieldName: 'categoryNo',
      label: '分类',
      defaultValue: '',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectNodeAllPublic,
        params: { by: 'no' },
        filterQueryAsync: true,
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
            class:'pg-button-size-small',
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
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'code',
      label: '码值',
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
      rules: 'required',
    },
    {
      tabGroup: 'other',
      fieldName: 'nameFull',
      label: '全称',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'spCode',
      label: '服务商',
      component: 'ApiRadioGroup',
      componentProps: {
        // 菜单接口
        api: typeCodePublic,
        params: { typeCode: 'spCodeSms' },
        autoSelect: 'first',
        optionType: 'button',

        buttonStyle: 'solid',
      },
      defaultValue: 'aliyun',
    },
    {
      tabGroup: 'home',
      fieldName: 'spTemplateCode',
      label: '服务商模版',
      defaultValue: '',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {

        },
      },
      suffix: () =>
        h(
          VbenButton,
          {
            class:'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existSpTemplateCode(values.spTemplateCode, values.id,values.spCode);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'contentTemplate',
      label: '模版内容',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '请输入模版内容',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'param',
      label: '参数结构定义',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '请输入参数',
      },
      description: () =>
        h(
          NTag,
          { class: '', type: 'info', size: 'small', bordered: false },
          '例如：{"code":"123456","event":"string"}',
        ),
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
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }

      drawerApi.setState({ title: `团队：${isUpdate ? '编辑' : '新增'}` ,loading: false});
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
  const values = await formApi.getValues<Omit<Record<string, any>,'id'>>();
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
