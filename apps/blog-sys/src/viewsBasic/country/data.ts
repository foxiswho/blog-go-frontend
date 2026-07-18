import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { setStateEnableDisable } from './api';

import { YesNoOptionsFormatter } from '@pg/types/src/basic/yes-no';
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
          { label: '弃置', value: '12' },
          { label: '取消', value: '11' },
        ],
      },
      fieldName: 'state',
      label: '状态',
    },
  ];
}

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', width: 34 },
  { field: 'name', title: '名称', minWidth: 200 },
  { field: 'nameFl', title: '英文', minWidth: 120 },
  { field: 'code', title: '编码', width: 160 },
  { field: 'continent', title: '所属洲', width: 160, visible: false },
  { field: 'iso3', title: 'ISO三字代码', width: 160 },
  { field: 'countryCode', title: '国际区号', width: 160 },
  { field: 'phoneUse', title: '区号使用', width: 160,
    formatter: YesNoOptionsFormatter,
  },
  { field: 'domainSuffix', title: '域名后缀', width: 80, visible:false },
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
