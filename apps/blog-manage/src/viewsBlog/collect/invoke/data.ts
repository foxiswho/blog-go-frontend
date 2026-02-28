import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { existName, setStateEnableDisable } from '../api';

export const columns: VxeGridPropTypes.Columns = [
  {
    type: 'expand',
    slots: {
      content: 'expandContent',
    },
    width: 40,
  },
  { type: 'checkbox', title: 'ID', width: 40 },
  { field: 'tenantNo', title: '租户编号', width: 120, visible: false },
  { field: 'tenantNoName', title: '租户', width: 120 },
  { field: 'name', title: '名称', visible: false },
  { field: 'nameAll', title: '名称', slots: { default: 'nameAll' } },
  { field: 'no', title: '编码', width: 160, visible: false },
  {
    field: 'description',
    title: '描述',
    maxWidth: 400,
    minWidth: 160,
    visible: false,
  },
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
