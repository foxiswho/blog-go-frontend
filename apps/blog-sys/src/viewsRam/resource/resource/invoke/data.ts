import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from 'vxe-table';

import {
  HttpMethodFormatter,
  RamResourceTypeAttrFormatter,
  RamResourceTypeFormatter,
} from '@pg/types';

/**
 * 搜索表单 Schema
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'wd',
      label: '关键词',
      componentProps: {
        placeholder: '请输入',
        clearable: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'state',
      label: '状态',
      componentProps: {
        clearable: true,
        options: [
          { label: '停用', value: '2' },
          { label: '有效', value: '1' },
          { label: '弃置', value: '12' },
          { label: '取消', value: '11' },
        ],
      },
    },
  ];
}

/**
 * 表格列配置
 */
export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', width: 34 },
  { field: 'name', title: '名称', minWidth: 160, visible: false },
  {
    field: 'nameAll',
    title: '名称',
    slots: { default: 'nameAll' },
  },
  { field: 'path', title: '路径', minWidth: 160, visible: false },
  {
    field: 'method',
    title: '方法',
    width: 80,
    formatter: HttpMethodFormatter,
  },
  { field: 'code', title: '资源标识', width: 100, visible: false },
  {
    field: 'typeSys',
    title: '类型',
    width: 80,
    formatter: RamResourceTypeFormatter,
    visible: false,
  },
  {
    field: 'typeAttr',
    title: '属性',
    width: 80,
    formatter: RamResourceTypeAttrFormatter,
    visible: false,
  },
];
