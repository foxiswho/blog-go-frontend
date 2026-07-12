<script lang="ts" setup>
import { computed, h } from 'vue';

import {useVbenDrawer, useVbenModal, z} from '@vben/common-ui';
import { VbenButton } from '@vben/common-ui';

import { HttpMethod, RamMenuTypeAttr, RamResourceType } from '@pg/types';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import { useVbenForm } from '#/adapter';
import { typeCodePublic } from '#/viewsBasic/data-dict/dict/api';
import ResourceList from "#/viewsRam/resource/resource/invoke/list.vue";
import ModalLocalRouterTpl from "./ModalLocalRouter.vue";

import { existName, saveOrUpdate, selectNodeAll } from '../api';
import { SystemMenuApi } from '../type';
const emit = defineEmits(['ok']);
const breakpoints = useBreakpoints(breakpointsTailwind);
const isHorizontal = computed(() => breakpoints.greaterOrEqual('md').value);
const [FormModalResource, formModalApiResource] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ResourceList,
});
const [ModalLocalRouter, modalApiLocalRouter] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ModalLocalRouterTpl,
});
const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  schema: [
    {
      fieldName: 'terminalCode',
      label: '终端类型',
      component: 'ApiRadioGroup',
      componentProps: {
        api: typeCodePublic,
        params: {typeCode:'terminalCode'},
        autoSelect: 'first',
        optionType: 'button',
        buttonStyle: 'solid',
      },
      formItemClass: 'col-span-2 md:col-span-2',
      rules: 'required',
    },
    {
      component: 'ApiRadioGroup',
      componentProps: {
        // 菜单接口
        api: typeCodePublic,
        params: { typeCode: 'typeMenu' },
        autoSelect: 'first',
        optionType: 'button',

        buttonStyle: 'solid',
      },
      defaultValue: 'menu',
      fieldName: 'typeMenu',
      formItemClass: 'col-span-2 md:col-span-2',
      label: '菜单类型',
      rules: 'required',
    },
    {
      fieldName: 'name',
      label: '菜单名称',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
        onBlur: async (e) => {
          const values = await formApi.getValues();
          if (!values.metaTitle) {
            formApi.setFieldValue('metaTitle', e.target.value);
          }
        },
      },
      rules: 'required',
      suffix: () =>
        h(
          VbenButton,
          {
            class:'pg-button-size-small',
            class:'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existName(values.name, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      fieldName: 'parentNo',
      label: '上级',
      defaultValue: '',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectNodeAll,
        params: {},
        props: {
          placeholder: '如果为空,则是一级',
          filterable: true,
        },
      },
    },
    {
      fieldName: 'metaTitle',
      label: '标题',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
      rules: 'required',
    },
    {
      fieldName: 'path',
      label: '路由地址',
      component: 'Input',
      rules: 'required',
      dependencies: {
        show: (values) => {
          return ['catalog', 'embedded', 'menu'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      formItemClass: 'col-span-2 md:col-span-2',
      suffix: () =>
        h(
          VbenButton,
          {
            class:'pg-button-size-small',
            onClick: async (e) => {
              //
              modalApiLocalRouter.setData({
                // 表单值
                values: {},
                isUpdate: false,
              });
              modalApiLocalRouter.open();
            },
          },
          () => h('span', { class: 'font-normal' }, '选择'),
        ),
    },
    {
      fieldName: 'activePath',
      label: '激活路径',
      component: 'Input',
      formItemClass: 'col-span-2 md:col-span-2',
    },
    {
      component: 'IconPicker',
      componentProps: {
        prefix: 'carbon',
      },
      dependencies: {
        show: (values) => {
          return ['catalog', 'embedded', 'link', 'menu'].includes(
            values.typeMenu,
          );
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'icon',
      label: '图标',
    },
    {
      component: 'IconPicker',
      componentProps: {
        prefix: 'carbon',
      },
      dependencies: {
        show: (values) => {
          return ['catalog', 'embedded', 'menu'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaActiveIcon',
      label: '激活图标',
    },
    {
      fieldName: 'component',
      label: '页面组件',
      component: 'Input',
      dependencies: {
        rules: (values) => {
          return values.typeMenu === 'menu' ? 'required' : null;
        },
        show: (values) => {
          return values.typeMenu === 'menu';
        },
        triggerFields: ['typeMenu'],
      },
    },
    {
      fieldName: 'linkSrc',
      label: '链接地址',
      component: 'Input',
      dependencies: {
        show: (values) => {
          return ['embedded', 'link'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      rules: z.string().url('请输入有效的链接'),
    },
    {
      fieldName: 'authCode',
      label: '权限标识',
      defaultValue: '',
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
      dependencies: {
        rules: (values) => {
          return values.typeMenu === 'button' ? 'required' : null;
        },
        show: (values) => {
          return ['button', 'catalog', 'embedded', 'menu'].includes(
            values.typeMenu,
          );
        },
        triggerFields: ['typeMenu'],
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: [
          { label: '点', value: 'dot' },
          { label: '文字', value: 'normal' },
        ],
      },
      dependencies: {
        show: (values) => {
          return values.typeMenu !== 'button';
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaBadgeType',
      label: '徽标类型',
    },
    {
      component: 'Input',
      componentProps: (values) => {
        return {
          allowClear: true,
          class: 'w-full',
          disabled: values.metaBadgeType !== 'normal',
        };
      },
      dependencies: {
        show: (values) => {
          return values.typeMenu !== 'button';
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaBadge',
      label: '徽章内容',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: SystemMenuApi.BadgeVariants.map((v) => ({
          label: v,
          value: v,
        })),
      },
      dependencies: {
        show: (values) => {
          return values.typeMenu !== 'button';
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaBadgeVariants',
      label: '徽标样式',
    },
    {
      fieldName: 'typeSys',
      label: '类型',
      defaultValue: 'general',
      component: 'PgRadioGroup',
      componentProps: {
        type: 'button',
        options: RamResourceType,
        placeholder: '',
        size: 'small',
      },
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
      rules: 'required',
    },
    {
      fieldName: 'typeAttr',
      label: '属性',
      defaultValue: 'menu',
      component: 'PgRadioGroup',
      componentProps: {
        placeholder: '请选择',
        type: 'button',
        options: RamMenuTypeAttr,
        size: 'small',
      },
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
      rules: 'required',
    },
    {
      fieldName: 'description',
      label: '描述',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '描述',
      },
      formItemClass: 'col-span-2 md:col-span-2',
    },
    {
      component: 'Divider',
      dependencies: {
        show: (values) => {
          return !['button', 'link'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'divider1',
      formItemClass: 'col-span-2 md:col-span-2 pb-0',
      hideLabel: true,
      renderComponentContent() {
        return {
          default: () => '其它设置',
        };
      },
    },
    {
      component: 'Checkbox',
      componentProps: {
        checkedValue: '1',
        uncheckedValue: '2',
      },
      dependencies: {
        show: (values) => {
          return ['menu'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaKeepAlive',
      renderComponentContent() {
        return {
          default: () => '缓存标签页',
        };
      },
    },
    {
      component: 'Checkbox',
      componentProps: {
        checkedValue: '1',
        uncheckedValue: '2',
      },
      dependencies: {
        show: (values) => {
          return ['embedded', 'menu'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaAffixTab',
      renderComponentContent() {
        return {
          default: () => '固定在标签',
        };
      },
    },
    {
      component: 'Checkbox',
      componentProps: {
        checkedValue: '1',
        uncheckedValue: '2',
      },
      dependencies: {
        show: (values) => {
          return !['button'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaHideInMenu',
      renderComponentContent() {
        return {
          default: () => '隐藏菜单',
        };
      },
    },
    {
      component: 'Checkbox',
      componentProps: {
        checkedValue: '1',
        uncheckedValue: '2',
      },
      dependencies: {
        show: (values) => {
          return ['catalog', 'menu'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaHideChildrenInMenu',
      renderComponentContent() {
        return {
          default: () => '隐藏子菜单',
        };
      },
    },
    {
      component: 'Checkbox',
      componentProps: {
        checkedValue: '1',
        uncheckedValue: '2',
      },
      dependencies: {
        show: (values) => {
          return !['button', 'link'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaHideInBreadcrumb',
      renderComponentContent() {
        return {
          default: () => '在面包屑中隐藏',
        };
      },
    },
    {
      component: 'Checkbox',
      componentProps: {
        checkedValue: '1',
        uncheckedValue: '2',
      },
      dependencies: {
        show: (values) => {
          return !['button', 'link'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'metaHideInTab',
      renderComponentContent() {
        return {
          default: () => '在标签栏中隐藏',
        };
      },
    },
    {
      component: 'Divider',
      dependencies: {
        show: (values) => {
          return !['button', 'link'].includes(values.typeMenu);
        },
        triggerFields: ['typeMenu'],
      },
      fieldName: 'divider1',
      formItemClass: 'col-span-2 md:col-span-2 pb-0',
      hideLabel: true,
      renderComponentContent() {
        return {
          default: () => '关联后端接口',
        };
      },
    },
    {
      fieldName: 'method',
      label: '后端方法',
      defaultValue: 'POST',
      // rules: 'required',
      component: 'PgRadioGroup',
      componentProps: {
        placeholder: '请选择',
        type: 'button',
        options: HttpMethod,
        size: 'small',
      },
      dependencies: {
        show: true,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
      formItemClass: 'col-span-2 md:col-span-2',
    },
    {
      fieldName: 'api',
      label: '后端api',
      component: 'Input',
      formItemClass: 'col-span-2 md:col-span-2',
      description: () =>
        h(
          VbenButton,
          {
            class:'pg-button-size-small',
            size: 'small',
            class: 'pg-button-size-small',
            onClick: async (e) => {
              formModalApiResource.setData({
                // 表单值
                values: {},
                rows: [],
                isUpdate: false,
              });
              formModalApiResource.open();

            },
          },
          () => '选择',
        ),
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
  wrapperClass: 'grid-cols-2 gap-x-4',
  showDefaultActions: false,
});
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues({
          ...values,
        });
      }
      if (parent) {
        formApi.setFieldValue('parentNo', parent.no);
      }

      drawerApi.setState({
        title: `菜单：${isUpdate ? '编辑' : '新增'}`,
        loading: false,
      });
    }
  },
  title: '',
});

/**
 * 提交
 */
async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  drawerApi.lock();
  const values = await formApi.getValues<Omit<Record<string, any>,'id'>>();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    console.log('values', values);
    saveOrUpdate(values, isUpdate).then((d) => {
      setTimeout(() => {
        emit('ok', values);
        drawerApi.setState({ loading: false });
        drawerApi.close();
      }, 500);
    });
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}

function okSelectResource(rows) {
  console.log(rows);
  if(rows) {
    const item = rows[0];
    formApi.setFieldValue('api', item.path);
    formApi.setFieldValue('method', item.method);
  }
}
function okSelectRouter(row) {
  console.log(row);
  const values = formApi.getValues<Omit<Record<string, any>,'id'>>();
  if(values) {
    if(!values.name) {
      formApi.setFieldValue('name', row.name);
    }
    formApi.setFieldValue('metaTitle', row.name);
    if(row.typeMenu!='link' && row.typeMenu!='embedded'){
      formApi.setFieldValue('component', row.component2);
    }
  }
  if(row.activePath) {
    formApi.setFieldValue('activePath', row.activePath);
  }
  if(row.path) {
    formApi.setFieldValue('path', row.path);
  }
  if(row.typeMenu) {
    formApi.setFieldValue('typeMenu', row.typeMenu);
  }
  if(row.meta.icon) {
    formApi.setFieldValue('icon', row.meta.icon);
  }
  if(row.meta.hideInMenu) {
    formApi.setFieldValue('metaHideInMenu', row.meta.hideInMenu);
  }
  if(row.meta.hideInBreadcrumb) {
    formApi.setFieldValue('metaHideInBreadcrumb', row.meta.hideInBreadcrumb);
  }
  if(row.meta.hideChildrenInMenu) {
    formApi.setFieldValue('metaHideChildrenInMenu', row.meta.hideChildrenInMenu);
  }
  if(row.meta.hideInTab) {
    formApi.setFieldValue('metaHideInTab', row.meta.hideInTab);
  }
  if(row.meta.keepAlive) {
    formApi.setFieldValue('metaKeepAlive', row.meta.keepAlive);
  }
  // if(row.meta.ignoreAccess) {
  //   formApi.setFieldValue('metaHideInMenu', row.meta.ignoreAccess);
  // }
}
</script>
<template>
  <Drawer class="w-full max-w-200">
    <Form class="mx-4" :layout="isHorizontal ? 'horizontal' : 'vertical'" />
    <FormModalResource @ok="okSelectResource" />
    <ModalLocalRouter @ok="okSelectRouter" />
  </Drawer>
</template>
<style lang="scss" scoped>

</style>
