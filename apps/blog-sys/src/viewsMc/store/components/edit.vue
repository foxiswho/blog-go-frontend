<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import MerchantModal from '../../merchant/invoke/index.vue';
import { existCode, existName, saveOrUpdate, detail } from '../api';
import { RamResourceType } from "@pg/types";

const emit = defineEmits(['ok']);

const [ModalMerchant, modalApiMerchant] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: MerchantModal,
});
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
      fieldName: 'merchantId',
      label: 'merchantId',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'merchantIdName',
      label: '商户',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入',
        disabled: true,
      },
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formApi.getValues();
              modalApiMerchant.setData({
                // 表单值
                values: values,
                isUpdate: true,
                number: 1,
              });
              modalApiMerchant.open();
            },
          },
          () => h('span', { class: 'font-normal' }, '选择'),
        ),
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
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      if (values) {
        let data = { ...values, merchantIdName: '' };
        if (values.merchantId) {
          detail(values.merchantId).then((d) => {
            console.log('detail',d);
            data.merchantIdName = d.merchantIdName;
            formApi.setValues(data);
          });
        }else {
          formApi.setValues(data);
        }
      }

      drawerApi.setState({ title: `币制：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '',
  closeOnClickModal: false,
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
        emit('ok', values);
        drawerApi.setState({ loading: false });
        drawerApi.close();
      }, 900);
    });
  } catch (error) {
    drawerApi.setState({ loading: false });
    console.error(error);
  }
}
function modalOk(opt) {
  if (opt && opt.length > 0) {
    const record = opt[0];
    formApi.setValues({merchantId: record.id, merchantIdName: record.name});
  }
}
</script>
<template>
  <Drawer>
    <Form />
    <ModalMerchant @ok="modalOk"></ModalMerchant>
  </Drawer>
</template>
