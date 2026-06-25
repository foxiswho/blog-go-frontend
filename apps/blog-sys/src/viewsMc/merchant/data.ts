import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { confirmSwitch } from '#/adapter/vxe-table';

import { setStateEnableDisable } from './api';

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
  { type: 'checkbox', width: 40 },
  { field: 'name', title: '名称' },
  { field: 'code', title: '编码', width: 160 },
  { field: 'nameFl', title: '英文', width: 120 },
  { field: 'founder', title: '创始人Id', width: 120, visible: false },
  { field: 'founderName', title: '创始人', width: 120, visible: false },
  { field: 'founderAll', title: '创始人', slots: { default: 'founderAll' } },
  { field: 'description', title: '描述', minWidth: 200 },
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
