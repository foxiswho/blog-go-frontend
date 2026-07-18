import type { VxeGridPropTypes } from 'vxe-table';

import { RamMenuTypeRelationFormatter } from '@pg/types';
import _XEUtils_ from 'xe-utils';

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 120 },
  { field: 'name', title: '名称', minWidth: 160, visible: false },
  {
    field: 'nameAll',
    title: '名称',
    slots: { default: 'nameAll' },
  },
  {
    field: 'type',
    title: '类型',
    width: 80,
    formatter: RamMenuTypeRelationFormatter,
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

export function useGridFormSchema(): any[] {
  return [
    {
      fieldName: 'menuId',
      label: '隐藏',
      defaultValue: '',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        triggerFields: ['wd'],
      },
    },
    {
      fieldName: 'typeCategory',
      label: '隐藏',
      defaultValue: 'group',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        triggerFields: ['wd'],
      },
    },
    {
      fieldName: 'wd',
      label: '关键词',
      component: 'Input',
      componentProps: { placeholder: '请输入', clearable: true },
    },
    {
      fieldName: 'state',
      label: '状态',
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
    },
  ];
}
