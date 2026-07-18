<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { VbenButton } from '@vben/common-ui';

import { usePgForm, useVbenForm } from '#/adapter';

import { existName, saveOrUpdate, selectCategory } from '../api';
import {RamResourceType, RamResourceTypeAttr} from "@pg/types";
import {typeCodePublic} from "#/viewsBasic/data-dict/dict/api";
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
      fieldName: 'terminalCode',
      label: '终端类型',
      component: 'ApiRadioGroup',
      componentProps: {
        api: typeCodePublic,
        params: {typeCode:'terminalCode'},
        autoSelect: 'first',
        optionType: 'button',
        buttonStyle: 'solid',
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'parentNo',
      label: '上级',
      component: 'PgTreeSelect',
      componentProps: {
        // api: selectCategory,
        // params: {typeAttr:'categoryLast'},
        convertNode: true,
        props: {
          placeholder: '如果为空,则是一级',
          filterable: true,
        },
      },
      dependencies: {
        show: (values)=> values.terminalCode,
        triggerFields: ['terminalCode'],
        componentProps(values) {
          return {
            api: selectCategory,
            params: {typeAttr: 'categoryLast',terminalCode:values.terminalCode},
          };
        }
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'name',
      label: '名称',
      component: 'Input',
      defaultValue: '',
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
            await formApi.setFieldValue('nameFl', e.target.value);
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
      fieldName: 'typeSys',
      label: '类型',
      defaultValue: 'general',
      component: 'PgRadioGroup',
      componentProps: {
        type: 'button',
        options: RamResourceType,
      },
      rules: 'required',
    },
    // {
    //   tabGroup: 'home',
    //   fieldName: 'typeAttr',
    //   label: '属性',
    //   defaultValue: 'resource',
    //   component: 'PgRadioGroup',
    //   componentProps: {
    //     placeholder: '请选择',
    //     type: 'button',
    //     options: RamResourceTypeAttr,
    //   },
    //   rules: 'required',
    // },
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
      const { values, isUpdate, parent,copy,terminalCode } = drawerApi.getData<Record<string, any>>();
      if (values && Object.keys(values).length > 0) {
        let data = {
          ...values,
        };
        if (parent) {
          data.parentNo = parent.no;
        }
        formApi.setValues(data);
      } else if ( copy && Object.keys(copy).length > 0) {
        let data = {
          ...copy,
          id:'0',
          code:'系统自动建立',
        };
        formApi.setValues(data);
      } else if (parent && Object.keys(parent).length > 0) {
        console.log('parent',parent);
        let data = {parentNo:parent.no}
        if(terminalCode) {
          data['terminalCode'] = terminalCode;
        }
        formApi.setValues(data);
      } else if (terminalCode) {
        formApi.setValues({terminalCode:terminalCode});
      }

      drawerApi.setState({ title: `分组：${isUpdate ? '编辑' : '新增'}` ,loading: false});
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
