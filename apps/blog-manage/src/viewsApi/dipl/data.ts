import type { VxeGridPropTypes } from 'vxe-table';

import {
  basicTypeFormatter,
  HttpMethodFormatter,
  RamResourceTypeAttrFormatter,
  RamResourceTypeFormatter,
} from '@pg/types';
import _XEUtils_ from 'xe-utils';

import { setStateEnableDisable } from './api';

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 40 },
  { field: 'name', title: '名称', minWidth: 160 },
  { field: 'code', title: '标记', minWidth: 160 },
  {
    field: 'typeSys',
    title: '类型',
    width: 80,
    formatter: basicTypeFormatter,
  },
  { field: 'typeCategoryName', title: '分类', minWidth: 160, visible: false },
  {
    field: 'state',
    title: '状态',
    // slots: { default: 'state' },
    width: 90,
    cellRender: {
      name: 'PgState',
      events: {
        // 状态更新
        click: ($table, record, e) => {
          const sourceValue = record.state;
          const newStatus = e.value === 1 ? 1 : 2;
          setStateEnableDisable(record.id, newStatus)
            .then(() => {
              record.state = newStatus;
              if ($table) {
                $table.isUpdateByRow(record);
              }
            })
            .catch(() => {
              record.state = sourceValue;
              if ($table) {
                $table.isUpdateByRow(record);
              }
            });
        },
      },
    },
  },
  { field: 'description', title: '描述', width: 200, visible: false },
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
