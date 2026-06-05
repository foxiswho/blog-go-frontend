<script setup lang="ts">
import { h, ref } from 'vue';

import { useVbenModal, VbenButton, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { usePgForm } from '#/adapter';

import { updatePassword } from '../api';
import { usePubPreStore } from '#/store';
import { SmUtil } from '#/tools/smUtil';

const pubPreStore = usePubPreStore();
const sm = new SmUtil();
const currentData = ref({});
const emit = defineEmits(['ok']);
const [Form, formApi] = usePgForm({
  tabs: {
    active: 'home',
    group: [{ value: 'home', label: '修改密码' }],
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
      tabGroup: 'home',
      fieldName: 'confirmPassword',
      label: '确认密码',
      component: 'VbenInputPassword',
      rules: z.string().min(8, { message: $t('authentication.passwordTip') }),
      componentProps: {
        placeholder: '请输入',
      },
      dependencies: {
        rules(values) {
          const { passwordNew } = values;
          return z
            .string()
            .min(8, { message: $t('authentication.passwordTip') })
            .refine((value) => value === passwordNew, {
              message: $t('authentication.confirmPasswordTip'),
            });
        },
        triggerFields: ['passwordNew'],
      },
    },
    {
      fieldName: 'id',
      label: 'id',
      component: 'Input',
      defaultValue: '0',
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
      currentData.value = values;
      formApi.setFieldValue('id', values.id);

      modalApi.setState({
        title: `修改密码：${values.account} (${values.phone})  ${values.id}`,
      });
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
    const data = {
      ...values,
    };
    if (
      pubPreStore.isEnable() &&
      pubPreStore.getLoginPub() &&
      data['passwordNew']
    ) {
      sm.setPublicKey(pubPreStore.getLoginPub());
      data.passwordNew = sm.encryptHex(data.passwordNew);
      data['encrypt'] = 'encrypt';
    }
    updatePassword(data).then((d) => {
      setTimeout(() => {
        emit('ok', values);
        modalApi.close();
      }, 1500);
    });
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.unlock();
  }
}
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>

<style scoped></style>
