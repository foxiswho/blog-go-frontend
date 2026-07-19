import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { existName, setStateEnableDisable } from './api';
import { h } from 'vue';
import { YesNoOptionsFormatter } from '@pg/types/src/basic/yes-no';

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
      component: 'Input',
      fieldName: 'topicNo',
      label: '话题编号',
      componentProps: {
        placeholder: '请输入',
        clearable: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'articleNo',
      label: '文章编号',
      componentProps: {
        placeholder: '请输入',
        clearable: true,
      },
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: [
          { label: '停用', value: '2' },
          { label: '有效', value: '1' },
          { label: '弃置', value: '12' },
          { label: '取消', value: '11' },
        ],
      },
      fieldName: 'state',
      label: '状态',
    },
  ];
}

/**
 * 表格列配置
 */
export const columns: VxeGridPropTypes.Columns = [
  {
    type: 'expand',
    slots: {
      content: 'expandContent',
    },
    width: 40,
  },
  { type: 'checkbox', title: 'ID', width: 40 },
  { field: 'tenantNo', title: '租户编号', width: 120, visible: false },
  { field: 'tenantNoName', title: '租户', width: 120, visible: false },
  { field: 'name', title: '名称', visible: true },
  {
    field: 'nameAll',
    title: '名称',
    visible: false,
    slots: { default: 'nameAll' },
  },
  { field: 'articleNo', title: '文章编号', width: 190, visible: true },
  { field: 'topicNo', title: '话题编号', width: 190, visible: true },
  {
    field: 'description',
    title: '描述',
    maxWidth: 400,
    minWidth: 160,
    visible: false,
  },
  {
    field: 'createAt',
    title: '创建时间',
    width: 160,
    visible: true,
    formatter({ cellValue }) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd');
    },
  },
  { title: '操作', width: 160, field: 'right', slots: { default: 'operate' } },
];
