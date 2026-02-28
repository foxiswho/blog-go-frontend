import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

export const columns: VxeGridPropTypes.Columns = [
  {
    field: 'createAt',
    title: '创建时间',
    width: 160,
    visible: true,
    formatter({ cellValue }) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd HH:MM');
    },
  },
  {
    field: 'tags',
    title: '标签',
    slots: {
      default: 'tags',
    },
  },
  { title: '操作', width: 160, field: 'right', slots: { default: 'operate' } },
];

export const formSchema = [];
