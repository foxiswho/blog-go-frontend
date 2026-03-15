<script lang="ts" setup>
import { h,ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { VbenButton } from '@vben/common-ui';

import {useVbenForm, usePgForm, type VbenFormSchema} from '#/adapter';

import { existName, saveOrUpdate,detailForm, configUpdate } from '../api';

function getComponentProps(item: any): Record<string, any> {
  const props: Record<string, any> = {
    placeholder: `请输入${item.name}`,
  };

  switch (item.formCode) {
    case 'InputNumber':
      props.placeholder = `请输入${item.name}`;
      props.style = { width: '100%' };
      break;
    case 'Select':
      props.placeholder = `请选择${item.name}`;
      props.options = [];
      break;
    case 'DatePicker':
      props.placeholder = `请选择${item.name}`;
      props.type = 'date';
      props.style = { width: '100%' };
      break;
    default:
      break;
  }

  return props;
}
function transformToSchema(items: any[]): VbenFormSchema[] {
  return items
    .filter((item) => item.show === 1)
    .map((item) => {
      const schemaItem: VbenFormSchema = {
        tabGroup: 'home',
        fieldName: item.field,
        label: item.name,
        component: item.formCode,
        defaultValue: item.defaultValue || undefined,
        componentProps: getComponentProps(item),
      };

      if (item.rules?.includes('required')) {
        schemaItem.rules = 'required';
      }

      return schemaItem;
    });
}
const currendData = ref<any>(null);
const emit = defineEmits(['ok']);
const [Form, formApi] = usePgForm({
  tabs: {
    hide: true,
    active: 'home',
    group: [
      { value: 'home', label: '基本' },
      { value: 'other', label: '其他' },
    ],
  },
  schema: [],
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
      let title = '';
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate,row } = drawerApi.getData<Record<string, any>>();
      if (row) {
        currendData.value = row
        title = row.name
        console.log('row', row)
        detailForm({eventNo:row.eventNo}).then((d) => {
          console.log('d', d);
          if (d) {
            if (d.form.item) {
              const newSchema = transformToSchema(d.form.item);
              formApi.setState({ schema: newSchema });
            }
            if (d.data) {
              formApi.setValues({...d.data});
            }
          }
        });
      }

      drawerApi.setState({
        title: `配置：${title}`,
        loading: false,
      });
    }
  },
  title: '：',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    let data = {
      data: {
        ...values
      },
    };
    if (currendData.value) {
      data.eventNo = currendData.value.eventNo;
    }
    configUpdate(data)
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
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>
<template>
  <Drawer>
    <template #extra>
      <VbenButton @click="" size="">取消</VbenButton>
    </template>
    <Form />
  </Drawer>
</template>
