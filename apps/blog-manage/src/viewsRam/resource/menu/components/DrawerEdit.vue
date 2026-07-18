<script lang="ts" setup>
import {h, watch, ref} from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { VbenButton } from '@vben/common-ui';

import { PgTreeSelect } from '@pg/components-n';
import {HttpMethod, RamResourceType, RamMenuTypeAttr} from "@pg/types";

import { usePgForm } from '#/adapter';

import {
  existName,
  saveOrUpdate,
  selectNodeAllPublic,
  selectPublic,
} from '../api';

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
      fieldName: 'parentId',
      label: '上级',
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
    {
      tabGroup: 'home',
      fieldName: 'typeAttr',
      label: '属性',
      defaultValue: 'menu',
      component: 'PgRadioGroup',
      componentProps: {
        placeholder: '请选择',
        type: 'button',
        options: RamMenuTypeAttr,
      },
      rules: 'required',
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
      fieldName: 'path',
      label: '路由路径',
      component: 'Input',
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'method',
      label: '方法',
      defaultValue: 'POST',
      rules: 'required',
      component: 'PgRadioGroup',
      componentProps: {
        placeholder: '请选择',
        type: 'button',
        options: HttpMethod,
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'component',
      label: '对应前端文件路径',
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
        formApi.setValues(values);
      }
      if (parent) {
        formApi.setValues({ parentId: parent.id});
      }

      drawerApi.setState({ title: `角色：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '角色：',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
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
      })
      .catch(() => {
        drawerApi.setState({ loading: false, confirmLoading: false });
      });
  } catch (error) {
    drawerApi.setState({ loading: false, confirmLoading: false });
    console.error(error);
  }
}
</script>
<template>
  <Drawer>
    <Form>
      <template #parentId="slotProps">
        <PgTreeSelect :api="selectPublic" v-bind="slotProps">
        </PgTreeSelect>
      </template>
    </Form>
  </Drawer>
</template>
