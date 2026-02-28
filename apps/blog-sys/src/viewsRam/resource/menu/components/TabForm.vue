<script lang="ts" setup>
import { computed, h, onMounted, watch } from 'vue';

import { VbenButton } from '@vben/common-ui';

import { PgTreeSelect } from '@pg/components-n';
import { HttpMethod, RamMenuTypeAttr, RamResourceType } from '@pg/types';

import { usePgForm } from '#/adapter';

import { existName, saveOrUpdate, selectNodeAllPublic } from '../api';

const props = defineProps({
  data: {
    type: Object as PropType<Recordable<any>>,
    // eslint-disable-next-line vue/require-valid-default-prop
    default: {},
  },
  isUpdate: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['ok']);

const getValue = computed(() => {
  return props.data.data;
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
      fieldName: 'parentId',
      label: '上级',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectNodeAllPublic,
        params: {},
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
        options: RamResourceType,
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'typeAttr',
      label: '属性',
      defaultValue: 'menu',
      component: 'PgRadioGroup',
      componentProps: {
        placeholder: '请选择',
        type: 'button',
        options: RamMenuTypeAttr,
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
      label: '标识',
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
      fieldName: 'path',
      label: '路由路径',
      component: 'Input',
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'method',
      label: '方法',
      defaultValue: 'POST',
      rules: 'required',
      component: 'PgRadioGroup',
      componentProps: {
        placeholder: '请选择',
        type: 'button',
        options: HttpMethod,
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'component',
      label: '对应前端文件路径',
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
  showDefaultActions: true,
});

// 解决第一次 赋值
setTimeout(() => {
  formApi.setValues({
    ...getValue.value,
  });
}, 500);

watch(
  () => props.data,
  () => {
    formApi.setValues({
      ...getValue.value,
    });
  },
  { deep: true },
);
/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    // console.log('values', values);
    saveOrUpdate(values, props.isUpdate).then((d) => {
      setTimeout(() => {
        emit('ok', values);
      }, 500);
    });
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  formApi.setValues(getValue.value);
  // formApi.setValues({name:"sssss"});
  // console.log('getValues',formApi.getValues())
  // console.log('ddd',getValue.value)
});
</script>
<template>
  <Form>
    <template #parentId="slotProps">
      <PgTreeSelect
        :api="selectNodeAllPublic"
        :convert-node="true"
        v-bind="slotProps"
        class="w-full"
      />
    </template>
  </Form>
</template>
