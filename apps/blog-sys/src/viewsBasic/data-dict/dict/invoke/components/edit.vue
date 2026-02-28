<script lang="ts" setup>
import {h, ref} from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { existCode, existName, existValue, saveOrUpdate } from '../api';

const emit = defineEmits(['ok']);
const recordData = ref({});
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
      fieldName: 'div1-amount',
      label: '',
      component: 'Divider',
      labelWidth: 0,
      renderComponentContent: () => {
        return {
          default: () => [`父级码值: ${parentData.value.name} ( ${parentData.value.code} )`],
        };
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'sort',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        placeholder: '请输入',
      },
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
      label: '码值',
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
      label: '其他值',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '请输入',
        onBlur: async (e) => {

        },
      },
      // suffix: () =>
      //   h(
      //     VbenButton,
      //     {
      //       onClick: async (e) => {
      //         const values = await formInApi.getValues();
      //         existValue(values.value, values.id);
      //       },
      //     },
      //     () => h('span', { class: 'font-normal' }, '查重'),
      //   ),
    },
    {
      tabGroup: 'other',
      fieldName: 'nameFull',
      label: '全称',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'extend',
      label: '扩展参数',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '扩展参数',
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
      defaultValue: '',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
    {
      fieldName: 'typeCode',
      label: 'typeCode',
      defaultValue: '',
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
    await formInApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    parentData.value = {};
    recordData.value = {};
    if (isOpen) {
      drawerApi.setState({ loading: true, closeOnClickModal: false });
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      let data = { typeCode: '' };
      if (parent) {
        parentData.value = parent;
        data.typeCode = parent.code;
      }
      if (values) {
        data = { ...values, typeCode: '' };
        data.typeCode = parent.code;
        recordData.value = values;
        if (values.sort) {
          data.sort = Number(data.sort);
        }
      }
      if (isUpdate) {
        formInApi.setValues(data);
      } else {
        formInApi.setValues({ ...data });
      }

      drawerApi.setState({
        title: `数据字典：${isUpdate ? '编辑' : '新增'}`,
        loading: false,
      });
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
    let data = {
      ...values,
    };
    if (isUpdate) {
      data.id = recordData.value.id;
      data.typeCode = parentData.value.code;
    }
    saveOrUpdate(values, isUpdate)
      .then((d) => {
        setTimeout(() => {
          emit('ok', values);
          drawerApi.setState({ loading: false });
          drawerApi.close();
        }, 500);
      })
      .catch((error) => {
        drawerApi.setState({ loading: false });
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
