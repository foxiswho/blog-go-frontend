<script lang="ts" setup>
import { h } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import {
  existAccount,
  saveOrUpdate,
  existPhone,
  existMail,
  saveOrUpdateAccount,
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
      fieldName: 'account',
      label: '账号',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入',
      },
      suffix: () =>
        h(
          VbenButton,
          {
            size: 'medium',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existAccount(values.account, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'countryCode',
      label: '国际区号',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'phone',
      label: '手机号',
      rules: 'required',
      component: 'Input',
      suffix: () =>
        h(
          VbenButton,
          {
            size: 'medium',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existPhone(values.phone, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'mail',
      label: '邮箱',
      rules: 'required',
      component: 'Input',
      suffix: () =>
        h(
          VbenButton,
          {
            size: 'medium',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existMail(values.mail, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'code',
      label: '编号',
      rules: 'required',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'registerTime',
      label: '注册时间',
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

const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: false,
  draggable: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
    // modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate } = modalApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }

      modalApi.setState({ title: `账号：${isUpdate ? '编辑' : '新增'}`, oading: false });
    }
  },
});
/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = modalApi.getData<Record<string, any>>();
    saveOrUpdate(values, isUpdate)
      .then((d) => {
        setTimeout(() => {
          modalApi.setState({
            loading: false,
            confirmLoading: false,
          });
          modalApi.close();
          emit('ok', data);
        }, 2500);
      })
      .catch((error) => {
        modalApi.setState({
          loading: false,
          confirmLoading: false,
        });
      });
  } catch (error) {
    modalApi.setState({ loading: false, confirmLoading: false });
    console.error(error);
  }
}
</script>
<template>
  <Modal>
    <Form />
  </Modal>
</template>
