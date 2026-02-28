import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 120 },
  { field: 'name', title: '名称' },
  { field: 'code', title: '编码', width: 160 },
  { field: 'nameFl', title: '英文', width: 120 },
  { field: 'description', title: '描述', minWidth: 200 },
  {
    field: 'createAt',
    title: '创建时间',
    width: 160,
    visible: false,
    formatter({ cellValue }) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd');
    },
  },
];

export const formSchema = [];
