<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { VbenButton } from '@vben/common-ui';

import { useVbenForm, usePgForm } from '#/adapter';

import { existName, saveOrUpdate } from '../api';
import DrawerEditTpl from '#/viewsBasic/configEvent/event/invoke/ModalList.vue';
const [ModalList, modalListApi] = useVbenModal({
  connectedComponent: DrawerEditTpl,
});
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
      fieldName: 'eventNo',
      label: '事件',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请选择事件',
        onBlur: async (e) => {

        },
      },
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: (e) => {
              modalListApi.setData({
                // 表单值
                values: {},
                isUpdate: false,
                num: 1,
              });
              modalListApi.open();
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
      tabGroup: 'home',
      fieldName: 'field',
      label: '字段名称英文',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
      rules: 'required',
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
      tabGroup: 'home',
      fieldName: 'show',
      label: '显示',
      component: 'Switch',
      componentProps: {
        checkedLabel: '是',
        uncheckedLabel: '否',
        placeholder: '内容',
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

      drawerApi.setState({
        title: `配置：${isUpdate ? '编辑' : '新增'}`,
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
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
function selectEvent(opt) {
  console.log('selectEvent',opt);
  if (opt && opt.data) {
    const row = opt.data[0];
    const values = formApi.getValues()
    let data = {
      ...values ,
    };
    data.eventNo = row.no;
    if (!data.name) {
      data.name = row.name;
    }
    if (!data.field) {
      data.field = row.field;
    }
    if (!data.description) {
      data.description = row.description;
    }
    formApi.setValues({
      ...data
    });
  }
}
</script>
<template>
  <Drawer>
    <Form />
  </Drawer>
  <ModalList @ok="selectEvent"/>
</template>
