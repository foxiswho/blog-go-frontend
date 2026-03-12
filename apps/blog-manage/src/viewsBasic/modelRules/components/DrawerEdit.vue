<script lang="ts" setup>
import {h, ref} from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { VbenButton } from '@vben/common-ui';

import { useVbenForm, usePgForm } from '#/adapter';

import { existName, saveOrUpdate } from '../api';
import {codeValueAllPublic} from "#/viewsBasic/data-dict/dict/api";
const fieldData = ref(null);
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
      fieldName: 'ruleMode',
      label: '验证模式类型',
      component: 'PgTreeSelect',
      componentProps: {
        api: codeValueAllPublic,
        params: { typeCode: 'basicModel:ruleMode' },
        props: {
          placeholder: '请选择',
        },
        onOk: async (e) => {
          const values = await formApi.getValues();
          if (values.ruleMode === 'required') {
            formApi.setFieldValue('name', '不为空');
          }
        },
      },
      rules: 'required',
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
      fieldName: 'sharedRuleNo',
      label: '共享规则编号',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },

    {
      tabGroup: 'home',
      fieldName: 'coding',
      label: '代码',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '代码',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'condition',
      label: '条件',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '条件',
      },
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
      const { values, isUpdate,field } = drawerApi.getData<Record<string, any>>();
      if (field) {
        fieldData.value = field;
        console.log('field',field)
      }
      if (values) {
        formApi.setValues(values);
      }
      let title = `字段规则：${isUpdate ? '编辑' : '新增'}`;
      if (fieldData.value) {
        title = title + ` [所属字段：${fieldData.value.name}(${fieldData.value.field})]`;
      }
      drawerApi.setState({
        title: title,
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
      ...values,
    };
    if(fieldData.value) {
      data['fieldNo'] = fieldData.value.no;
    }
    saveOrUpdate(data, isUpdate)
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
    <Form />
  </Drawer>
</template>
