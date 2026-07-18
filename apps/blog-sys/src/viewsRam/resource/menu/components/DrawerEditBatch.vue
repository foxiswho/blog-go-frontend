<script lang="ts" setup>
import { computed, h, ref } from 'vue';


import { useVbenDrawer, VbenButton, z } from '@vben/common-ui';

import { HttpMethod, RamMenuTypeAttr, RamResourceType } from '@pg/types';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import { useVbenForm } from '#/adapter';
import { typeCodePublic } from '#/viewsBasic/data-dict/dict/api';

import { saveOrUpdate, selectNodeAll } from '../api';
import { SystemMenuApi } from '../type';

const terminalCode = ref('system');
const emit = defineEmits(['ok']);
const [Form, formApi] = useVbenForm({
  wrapperClass: 'grid-cols-2',
  schema: [
    // 公共参数
    {
      fieldName: 'terminalCode',
      label: '终端类型',
      defaultValue: 'system',
      component: 'ApiRadioGroup',
      componentProps: {
        api: typeCodePublic,
        params: { typeCode: 'terminalCode' },
        autoSelect: 'first',
        optionType: 'button',
        buttonStyle: 'solid',
        onChange: (opt,two) => {
          console.log('opt=', opt);
          console.log('opt.value=', opt.target?.value);
          if (opt.target?.value) {
            terminalCode.value = opt.target.value;
          }
        },
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
      defaultValue: 'button',
      fieldName: 'typeMenu',
      formItemClass: 'col-span-2 md:col-span-2',
      label: '菜单类型',
      rules: 'required',
    },
    {
      fieldName: 'parentNo',
      label: '上级',
      defaultValue: '',
      component: 'PgTreeSelect',
      componentProps: {
        // api: selectNodeAll,
        // params: {},
        props: {
          placeholder: '如果为空,则是一级',
          filterable: true,
        },
      },
      dependencies: {
        show: (values)=> values.terminalCode,
        triggerFields: ['terminalCode'],
        componentProps(values) {
          return {
            api: selectNodeAll,
            params: {
              terminalCode: values.terminalCode,
            },
          }
        }
      },
      formItemClass: 'col-span-2',
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
    },
    {
      fieldName: 'activePath',
      label: '激活路径',
      component: 'Input',
      formItemClass: 'col-span-2 md:col-span-2',
      dependencies: {
        show: false,
        triggerFields: ['typeMenu'],
      }
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
      formItemClass: 'col-span-2',
      dependencies: {
        show: false,
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
      formItemClass: 'col-span-2',
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
        show: false,
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
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
    // 模版功能
    {
      component: 'Divider',
      fieldName: 'templateDivider',
      hideLabel: true,
      formItemClass: 'col-span-2',
      renderComponentContent() {
        return {
          default: () => '模版功能（查找替换）',
        };
      },
    },
    {
      fieldName: 'nameFind',
      label: '名称',
      defaultValue: '部门',
      component: 'Input',
      componentProps: {
        placeholder: '需要替换的字符',
      },
      formItemClass: 'col-span-1',
    },
    {
      fieldName: 'nameReplace',
      label: '替换为',
      defaultValue: '部门',
      component: 'Input',
      componentProps: {
        placeholder: '替换后的新字符',
      },
      formItemClass: 'col-span-1',
      suffix: () =>
        h(
          VbenButton,
          {
            class: 'pg-button-size-small',
            onClick: async () => {
              const values =
                await formApi.getValues<Record<string, any>>();
              const find = values.nameFind;
              const replace = values.nameReplace ?? '';
              if (!find) return;
              const items = values.items || [];
              items.forEach((item: any, index: number) => {
                const val = item?.name ?? '';
                formApi.setFieldValue(
                  `items[${index}].name`,
                  val.split(find).join(replace),
                );
              });
            },
          },
          () => '应用',
        ),
    },
    {
      fieldName: 'authCodeFind',
      label: '授权码',
      defaultValue: 'sys:department',
      component: 'Input',
      componentProps: {
        placeholder: '需要替换的字符',
      },
      formItemClass: 'col-span-1',
    },
    {
      fieldName: 'authCodeReplace',
      label: '替换为',
      defaultValue: 'sys:department',
      component: 'Input',
      componentProps: {
        placeholder: '替换后的新字符',
      },
      formItemClass: 'col-span-1',
      suffix: () =>
        h(
          VbenButton,
          {
            class: 'pg-button-size-small',
            onClick: async () => {
              const values =
                await formApi.getValues<Record<string, any>>();
              const find = values.authCodeFind;
              const replace = values.authCodeReplace ?? '';
              if (!find) return;
              const items = values.items || [];
              items.forEach((item: any, index: number) => {
                const val = item?.authCode ?? '';
                formApi.setFieldValue(
                  `items[${index}].authCode`,
                  val.split(find).join(replace),
                );
              });
            },
          },
          () => '应用',
        ),
    },
    // 批量循环添加数组
    {
      component: 'VbenFormFieldArray',
      fieldName: 'items',
      label: '菜单列表',
      labelWidth: 60,
      formItemClass: 'col-span-2',
      defaultValue: [],
      componentProps: {
        min: 1,
        max: 50,
        addButtonText: '添加一行菜单',
        createRow: () => ({
          name: null,
          authCode: null,
        }),
        schema: [
          {
            component: 'Input',
            fieldName: 'name',
            label: '名称',
            rules: 'required',
            componentProps: { placeholder: '请输入名称' },
          },
          {
            component: 'Input',
            fieldName: 'authCode',
            label: '授权码',
            rules: 'required',
            componentProps: { placeholder: '请输入授权码' },
          },
        ],
      },
    },
  ],
  showDefaultActions: false,
});
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      let title = ' ';
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      let data = {
        ...values,
      };
      if (parent) {
        data.parentNo = parent.no;
        data.terminalCode = parent.terminalCode;
        data.nameReplace = parent.name;
        data.authCodeReplace = parent.terminalCode + ':department';
        title = title + parent.name;
      }
      data.items = [
        { name: '新增', authCode: 'sys:department:create' },
        { name: '批量有效', authCode: 'sys:department:batchState1' },
        { name: '批量停用', authCode: 'sys:department:batchState2' },
        { name: '批量删除', authCode: 'sys:department:batchDelete' },
        { name: '编辑', authCode: 'sys:department:edit' },
        { name: '删除', authCode: 'sys:department:delete' },
      ];
      formApi.setValues(data);

      drawerApi.setState({
        title: `菜单：批量新增` + title,
        loading: false,
      });
    }
  },
  title: '：',
});

/**
 * 提交
 */
async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values = await formApi.getValues<Record<string, any>>();
  const { terminalCode, typeMenu, parentNo, method, typeSys, typeAttr, items } = values;

  if (!items || items.length === 0) {
    return false;
  }

  drawerApi.lock();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });

    // 循环创建每个菜单，合并公共参数
    const promises = items.map((item: Record<string, any>) => {
      const data = {
        ...item,
        metaTitle: item.name,
        terminalCode,
        typeMenu,
        parentNo,
        method,
        typeSys,
        typeAttr,
        id: '0',
      };
      return saveOrUpdate(data, false);
    });

    await Promise.all(promises);

    setTimeout(() => {
      emit('ok', values);
      drawerApi.setState({ loading: false });
      drawerApi.close();
    }, 500);
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>
<template>
  <Drawer class="w-[1200px]">
    <Form />
  </Drawer>
</template>
