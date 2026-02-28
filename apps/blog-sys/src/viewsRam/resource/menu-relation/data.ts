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

export const formSchema = [];
