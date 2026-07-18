<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { HttpMethod, RamResourceType, RamResourceTypeAttr } from '@pg/types';

import { useVbenForm } from '#/adapter';

import { saveOrUpdate, selectCategory } from '../api';
import { typeCodePublic } from '#/viewsBasic/data-dict/dict/api';

const emit = defineEmits(['ok']);
const [Form, formApi] = useVbenForm({
  wrapperClass: 'grid-cols-2',
  schema: [
    // 公共参数
    {
      fieldName: 'terminalCode',
      label: '终端类型',
      component: 'ApiRadioGroup',
      componentProps: {
        api: typeCodePublic,
        params: { typeCode: 'terminalCode' },
        autoSelect: 'first',
        optionType: 'button',
        buttonStyle: 'solid',
      },
      formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      fieldName: 'parentNo',
      label: '上级',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectCategory,
        params: { typeAttr: 'categoryLast' },
        convertNode: true,
        props: {
          placeholder: '如果为空,则是一级',
          filterable: true,
        },
      },
      formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      fieldName: 'typeSys',
      label: '类型',
      defaultValue: 'general',
      component: 'PgRadioGroup',
      componentProps: {
        type: 'button',
        options: RamResourceType,
      },
      formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      fieldName: 'typeAttr',
      label: '属性',
      defaultValue: 'resource',
      component: 'PgRadioGroup',
      componentProps: {
        placeholder: '请选择',
        type: 'button',
        options: RamResourceTypeAttr,
      },
      formItemClass: 'col-span-2',
      rules: 'required',
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
      label: '名称-查找字符',
      defaultValue: '部门',
      component: 'Input',
      componentProps: {
        placeholder: '需要替换的字符',
      },
      formItemClass: 'col-span-1',
    },
    {
      fieldName: 'nameReplace',
      label: '名称-替换为',
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
      fieldName: 'codeFind',
      label: '码值-查找字符',
      defaultValue: 'sys:department',
      component: 'Input',
      componentProps: {
        placeholder: '需要替换的字符',
      },
      formItemClass: 'col-span-1',
    },
    {
      fieldName: 'codeReplace',
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
              const find = values.codeFind;
              const replace = values.codeReplace ?? '';
              if (!find) return;
              const items = values.items || [];
              items.forEach((item: any, index: number) => {
                const val = item?.code ?? '';
                formApi.setFieldValue(
                  `items[${index}].code`,
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
      label: '资源列表',
      labelWidth: 60,
      formItemClass: 'col-span-2',
      defaultValue: [],
      componentProps: {
        min: 1,
        max: 50,
        addButtonText: '添加一行资源',
        createRow: () => ({
          name: null,
          code: null,
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
            fieldName: 'code',
            label: '码值',
            rules: 'required',
            componentProps: { placeholder: '请输入码值' },
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
      const { values, isUpdate, parent,terminalCode } =
        drawerApi.getData<Record<string, any>>();
      if (values) {
        let data = {
          ...values,
        };
        if(terminalCode) {
          data['terminalCode'] = terminalCode;
        }
        if (parent) {
          data.parentNo = parent.no;
          data.terminalCode = parent.terminalCode;
          data.nameReplace = parent.name;
          data.codeReplace = parent.terminalCode+':department';
          title = title + parent.name;
        }
        data.items =[
          { name: '部门:全部权限', code: 'sys:department:all',},
          { name: '部门:新增/更新/详情', code: 'sys:department:createUpdateDetail', },
          { name: '部门:启用禁用', code: 'sys:department:enableDisable',},
          { name: '部门:删除', code: 'sys:department:delete', },
          { name: '部门:列表', code: 'sys:department:query'},
        ];
        formApi.setValues(data);
      }

      drawerApi.setState({
        title: `资源：批量新增` +title,
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
  const { terminalCode, parentNo, typeSys, typeAttr, items } = values;

  if (!items || items.length === 0) {
    return false;
  }

  drawerApi.lock();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });

    // 循环创建每个资源，合并公共参数
    const promises = items.map((item: Record<string, any>) => {
      const data = {
        ...item,
        terminalCode,
        parentNo,
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
