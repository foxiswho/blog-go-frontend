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
