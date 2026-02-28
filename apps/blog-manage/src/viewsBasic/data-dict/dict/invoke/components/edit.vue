<script lang="ts" setup>
import {h, ref} from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { existCode, existName, existValue, saveOrUpdate } from '../api';

const emit = defineEmits(['ok']);
const parentData = ref<Recordable<any>>({});
const [FormEdit, formInApi] = usePgForm({
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
      fieldName: 'name',
      label: '名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {
          const values = await formInApi.getValues();
          if (!values.nameFull) {
            formInApi.setFieldValue('nameFull', e.target.value);
          }
        },
      },
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formInApi.getValues();
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
      label: '编码',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {
          const values = await formInApi.getValues();
          if (!values.nameFl) {
            formInApi.setFieldValue('nameFl', e.target.value);
          }
        },
      },
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formInApi.getValues();
              existCode(values.code, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'value',
      label: '值',
      rules: 'required',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '请输入',
        onBlur: async (e) => {

        },
      },
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formInApi.getValues();
              existValue(values.value, values.id);
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
    {
      fieldName: 'ownerId',
      label: 'ownerId',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
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
    await formInApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    parentData.value = {};
    if (isOpen) {
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      if (values) {
        let data = { ...values, ownerId: '0'};
        if (parent) {
          data.ownerId = parent.id;
        }
        formInApi.setValues(data);
      }
      if (parent) {
        parentData.value = parent;
      }

      drawerApi.setState({ title: `数据字典：${isUpdate ? '编辑' : '新增'}` });
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
    saveOrUpdate(values, isUpdate).then((d) => {
      setTimeout(() => {
        drawerApi.setState({ loading: false });
        emit('ok', values);
        drawerApi.close();
      }, 500);
    });
  } catch (error) {
    drawerApi.setState({ loading: false });
    console.error(error);
  }
}
</script>
<template>
  <Drawer>
    <FormEdit />
  </Drawer>
</template>
