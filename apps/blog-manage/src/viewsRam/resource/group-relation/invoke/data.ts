import type { VxeGridPropTypes } from 'vxe-table';

import {
  HttpMethodFormatter,
  RamResourceTypeAttrFormatter,
  RamResourceTypeFormatter,
} from '@pg/types';

export const columns: VxeGridPropTypes.Columns = [
  { field: 'name', title: '名称', minWidth: 160, visible: false },
  {
    field: 'nameAll',
    title: '资源组对应的资源',
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

export function useGridFormSchema(): any[] {
  return [
    {
      fieldName: 'parentId',
      label: '隐藏',
      defaultValue: null,
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
