import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { existName, setDefaulted, setStateEnableDisable } from './api';

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 40 },
  { field: 'tenantName', title: '租户' },
  { field: 'name', title: '名称' },
  { field: 'code', title: '域名', width: 260 },
  { field: 'tenantNo', title: '租户', visible: false },
  { field: 'description', title: '描述', minWidth: 200 },
  {
    field: 'defaulted',
    title: '默认',
    // slots: { default: 'state' },
    width: 90,
    cellRender: {
      name: 'PgStateYesNoInt',
      field: 'defaulted',
      events: {
        // 状态更新
        click: ($table, record, e) => {
          const sourceValue = record.defaulted;
          const newStatus = e.value === 1 ? 1 : 2;
          setDefaulted(record.id, newStatus)
            .then(() => {
              record.defaulted = newStatus;
              if ($table) {
                $table.isUpdateByRow(record);
              }
            })
            .catch(() => {
              record.defaulted = sourceValue;
              if ($table) {
                $table.isUpdateByRow(record);
              }
            });
        },
      },
    },
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
  { title: '操作', width: 160, field: 'right', slots: { default: 'operate' } },
];

export const formSchema = [];
