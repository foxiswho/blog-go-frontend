<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import {
  basicOptionsType,
  HttpMethod,
  RamResourceType,
  RamResourceTypeAttr,
} from '@pg/types';

import { usePgForm } from '#/adapter';

import { existName, saveOrUpdate, selectNodeAllPublic } from '../api';
import { selectNodeAllPublic as selectNodeAllPublicCategory } from '#/viewsApi/diplCategory/api';
import AccessKeyTableTpl from './accessKeyTable.vue';
const emit = defineEmits(['ok']);
const showTable = ref(false);
const recordData = ref({});
const [Form, formApi] = usePgForm({
  tabs: {
    active: 'home',
    group: [
      { value: 'home', label: '基本' },
      { value: 'other', label: '其他' },
    ],
  },
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      tabGroup: 'home',
      fieldName: 'categoryNo',
      label: '分类',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectNodeAllPublicCategory,
        params: { by: 'no' },
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
        options: basicOptionsType,
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
      label: '标记',
      defaultValue: '系统自动建立',
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
      defaultValue: '',
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
      drawerApi.setState({ loading: true });
      let data = {};
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      if (values) {
        data = {
          ...values,
          categoryNo: '',
        };
        if (parent) {
          data.categoryNo = parent.no;
        }
        formApi.setValues({
          ...data,
        });
      }
      if (isUpdate) {
        recordData.value = data;
        showTable.value = true;
        console.log('recordData=>', recordData.value);
      }
      formApi.setState({ commonConfig: { disabled: true } });
      drawerApi.setState({ title: `应用：密钥`, loading: false });
    }
  },
  title: '：',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  drawerApi.setState({ loading: true });
  try {
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
</script>
<template>
  <Drawer class="w-[1200px]">
    <Form />
    <AccessKeyTableTpl
      v-if="showTable"
      :dipl-no="recordData.no"
      :data="recordData"
    />
  </Drawer>
</template>
