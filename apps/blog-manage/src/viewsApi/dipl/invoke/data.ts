import type { VxeGridPropTypes } from 'vxe-table';

import {
  HttpMethodFormatter,
  RamResourceTypeAttrFormatter,
  RamResourceTypeFormatter,
} from '@pg/types';

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 40 },
  { field: 'name', title: '名称', minWidth: 160, visible: true },
  { field: 'code', title: '编号', width: 100, visible: true },
  {
    field: 'other',
    title: '',
    visible: true,
  },
];
