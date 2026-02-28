import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';


export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 120 },
  { field: 'name', title: '名称' },
  { field: 'url', title: '全路径', width: 160 },
  { field: 'sourceName', title: '原始名称', width: 160 },
  { field: 'module', title: '模块', width: 160 },
  { field: 'size', title: '大小', width: 160 },
  { field: 'value', title: '值id', width: 160 },
  { field: 'tag', title: '标签', width: 160 },
  { field: 'label', title: '标记', width: 160 },
  { field: 'description', title: '描述', width: 200 },
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

export const formSchema = [
];
