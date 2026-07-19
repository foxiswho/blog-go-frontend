<script setup lang="ts">
import { h } from 'vue';

import { useVbenModal, VbenButton, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { usePgForm } from '#/adapter';

import { copy } from '../api';

const emit = defineEmits(['ok']);
const [Form, formApi] = usePgForm({
  tabs: {
    active: 'home',
    group: [
      { value: 'home', label: '复制' },
    ],
  },
  schema: [
    {
      tabGroup: 'home',
      fieldName: 'passwordNew',
      label: '新密码',
      component: 'VbenInputPassword',
      rules: z.string().min(8, { message: $t('authentication.passwordTip') }),
      componentProps: {
        passwordStrength: true,
        placeholder: '请输入',
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
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: false,
  draggable: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values } = modalApi.getData<Record<string, any>>();
      modalApi.setState({ title: `事件复制：${values.account} (${values.phone})  ${values.id}` });
    }
  },
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
  modalApi.lock();
  try {
    modalApi.setState({ loading: true, confirmLoading: true });
    copy(values).then((d) => {
      setTimeout(() => {
        emit('ok', values);
        modalApi.setState({ loading: false });
        modalApi.close();
      }, 1500);
    });
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.unlock();
    modalApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>

<style scoped></style>
