import type { VxeTableDefines } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { existName, setStateEnableDisable } from './api';
import {basicOptionsType} from "@pg/types";

export const columns: VxeTableDefines.ColumnInfo = [
  { type: 'checkbox', field: 'name', title: '名称', treeNode: true },
  { field: 'areaCode', title: '区号', width: 160 },
  { field: 'zipCode', title: '邮编', minWidth: 120 },
  { field: 'countryIdName', title: '国家', width: 160, visible: false },
  { field: 'source', title: '源', width: 160, visible: false },
  { field: 'type', title: '类型', width: 160,
    formatter: basicOptionsType,
  },
  // {
  //   field: 'state',
  //   title: '状态',
  //   // slots: { default: 'state' },
  //   width: 90,
  //   visible: false,
  //   cellRender: {
  //     name: 'PgState',
  //     events: {
  //       // 状态更新
  //       click: ($table, record, e) => {
  //         const sourceValue = record.state;
  //         const newStatus = e.value === 1 ? 1 : 2;
  //         setStateEnableDisable(record.id, newStatus)
  //           .then(() => {
  //             record.state = newStatus;
  //             if ($table) {
  //               $table.isUpdateByRow(record);
  //             }
  //           })
  //           .catch(() => {
  //             record.state = sourceValue;
  //             if ($table) {
  //               $table.isUpdateByRow(record);
  //             }
  //           });
  //       },
  //     },
  //   },
  // },
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

export const formSchema = [
];
