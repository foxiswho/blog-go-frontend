import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { setStateEnableDisable } from './api';
import { basicOptionsType } from '@pg/types';

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
      componentProps: {
        allowClear: true,
        options: [
          { label: '停用', value: '2' },
          { label: '有效', value: '1' },
        ],
      },
      fieldName: 'state',
      label: '状态',
    },
  ];
}

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', width: 34 },
  { field: 'name', title: '名称', minWidth: 200, treeNode: true },
  { field: 'areaCode', title: '区号', width: 160 },
  { field: 'zipCode', title: '邮编', minWidth: 120 },
  { field: 'countryIdName', title: '国家', width: 160, visible: false },
  { field: 'source', title: '源', width: 160, visible: false },
  { field: 'type', title: '类型', width: 160, formatter: basicOptionsType },
  {
    field: 'createAt',
    title: '创建时间',
    width: 160,
    visible: false,
    formatter({ cellValue }) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd');
    },
  },
  { title: '操作', width: 160, field: 'right', slots: { default: 'operate' } },
];
