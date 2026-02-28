<script lang="ts" setup>
import { h, computed } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';
import { usePgForm } from '#/adapter';

import { selectNodeAllPublic as selectNodeAllPublicTagsCategory } from '#/viewsBasic/tags/category/api';
import {
  existName,
  saveOrUpdate,
  selectNodeAllPublic,
  existCode,
} from '#/viewsBasic/tags/relation/api';
const titleRef = defineModel('title', {
  default: () => '',
  type: [String],
});
const width = defineModel('width', {
  default: () => '500px',
  type: [String, Number],
});
const data = defineModel('data', {
  default: () => [],
  type: [Object, Number, String, Array],
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
      fieldName: 'category',
      label: '分类',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectNodeAllPublicTagsCategory,
        convertNodeField: {
          keyField: 'extend.code',
          parentField: 'extend.parentCode',
        },
        props: {
          placeholder: '',
          filterable: true,
          disabled: true,
        },
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'name',
      label: '显示名称',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {
          const values = await formApi.getValues();
          if (!values.nameFull) {
            formApi.setFieldValue('nameFull', e.target.value);
          }
          if (!values.code) {
            formApi.setFieldValue('code', e.target.value);
          }
          if (!values.nameFl) {
            formApi.setFieldValue('nameFl', e.target.value);
          }
          if (!values.nameShort) {
            formApi.setFieldValue('nameShort', e.target.value);
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
      label: '标签',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {
          const values = await formApi.getValues();
          if (!values.nameFl) {
            formApi.setFieldValue('nameFl', e.target.value);
          }
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
              existCode(values.code, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'nameShort',
      label: '简称',
      component: 'Input',
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
      tabGroup: 'home',
      fieldName: 'show',
      label: '',
      component: '',
    },
    {
      tabGroup: 'home',
      fieldName: 'attributeMap.type',
      label: '快速颜色类型',
      defaultValue: 'info',
      component: 'PgRadioGroup',
      componentProps: {
        type: 'button',
        options: [
          { label: '默认', value: 'default' },
          // {label: '中', value: 'primary'},
          { label: '蓝色', value: 'info' },
          { label: '绿色', value: 'success' },
          { label: '橘黄', value: 'warning' },
          { label: '红色', value: 'error' },
        ],
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'attributeMap.bordered',
      label: '是否有边框',
      defaultValue: true,
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '是', value: true },
          { label: '否', value: false },
        ],
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
        placeholder: '标签颜色，设置该项后　type 无效',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'attributeMap.size',
      label: '尺寸',
      defaultValue: 'medium',
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '小', value: 'small' },
          { label: '中', value: 'medium' },
          { label: '大', value: 'large' },
        ],
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'attributeMap.round',
      label: '圆角',
      defaultValue: false,
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '否', value: false },
          { label: '是', value: true },
        ],
      },
      rules: 'required',
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
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      if (values) {
        console.log('values', values);
        if (parent) {
          values.parentId = parent.id;
        }
        formApi.setValues({
          ...values,
        });
        //console.log('formApi......',formApi.getValues());
      }

      drawerApi.setState({
        title: `标签：${isUpdate ? '编辑' : '新增'}`,
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
  drawerApi.setState({ loading: true });
  try {
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    let data = {
      ...values,
      attributeMap: {},
    };
    data.attributeMap = {
      type: data['attribute.type'],
      bordered: data['attribute.bordered'],
      strong: data['attribute.strong'],
      round: data['attribute.round'],
      color: data['attribute.color'],
      size: data['attribute.size'],
    };
    saveOrUpdate(data, isUpdate).then((d) => {
      setTimeout(() => {
        emit('ok', data);
        drawerApi.setState({ loading: false });
        drawerApi.close();
      }, 900);
    });
  } catch (error) {
    drawerApi.setState({ loading: false });
    console.error(error);
  }
}

function jsonColorCov(row) {
  console.log('obj', row);
  if ('{}' == row) {
    return undefined;
  }
  if (!row) {
    return undefined;
  }
  if (undefined === row) {
    return undefined;
  }
  try {
    let obj = JSON.parse(row);
    return obj;
  } catch (e) {
    console.error(e);
  }
  return undefined;
}

const attributeMapComputed = computed(async () => {
  const values = await formApi.getValues();
  console.log('attributeMapComputed', values);
  let data = {
    ...values,
    attributeMap: {
      bordered: true,
      round: false,
      size: 'medium',
      type: 'info',
    },
  };
  if (values.attributeMap) {
    if (Object.prototype.hasOwnProperty.call(values.attributeMap, 'bordered')) {
      data.attributeMap.bordered = values.attributeMap.bordered;
    }
    if (Object.prototype.hasOwnProperty.call(values.attributeMap, 'round')) {
      data.attributeMap.round = values.attributeMap.round;
    }
    if (Object.prototype.hasOwnProperty.call(values.attributeMap, 'size')) {
      data.attributeMap.size = values.attributeMap.size;
    }
    if (Object.prototype.hasOwnProperty.call(values.attributeMap, 'type')) {
      data.attributeMap.type = values.attributeMap.type;
    }
  }
  console.log('attributeMapComputed.data', data);
  return data;
});
</script>
<template>
  <Drawer class="w-[900px]">
    <Form>
      <template #show>
        <n-divider>
          <n-tag
            :type="attributeMapComputed['attributeMap.type']"
            :bordered="attributeMapComputed['attributeMap.bordered']"
            :size="attributeMapComputed['attributeMap.size']"
            :strong="attributeMapComputed['attributeMap.strong']"
            :round="attributeMapComputed['attributeMap.round']"
            :color="jsonColorCov(attributeMapComputed['attributeMap.color'])"
          >
            {{ attributeMapComputed.name }}
          </n-tag>
        </n-divider>
      </template>
    </Form>
  </Drawer>
</template>
