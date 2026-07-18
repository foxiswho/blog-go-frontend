import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { setStateEnableDisable } from './api';
import {confirmSwitch} from "#/adapter/vxe-table";

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
  { type: 'checkbox',width: 34 },
  { field: 'name', title: '名称', minWidth: 200, sortable: true },
  { field: 'code', title: '码值', width: 160 },
  { field: 'categoryNo', title: '分类编号', width: 160, visible: false },
  { field: 'priorityName', title: '优先级', width: 160, visible: false },
  { field: 'spCode', title: '服务商代码', width: 80 },
  { field: 'spTemplateCode', title: '服务商模版', width: 160 },
  { field: 'contentTemplate', title: '原始内容', width: 200 },
  { field: 'param', title: '参数', width: 160, visible: false },
  { field: 'description', title: '描述', width: 160, visible: false },
  {
    field: 'state',
    title: '状态',
    width: 90,
    cellRender: {
      name: 'CellSwitchPg',
      attrs: {
        beforeChange: async (
          newStatus: number | string,
          record: any,
          $table: any,
        ) => {
          try {
            await confirmSwitch(record.name, newStatus);
            await setStateEnableDisable(record.id, newStatus);
            return true;
          } catch {
            return false;
          }
        },
      },
    },
  },
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
