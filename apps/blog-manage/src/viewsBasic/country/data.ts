import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { existName, setStateEnableDisable } from './api';
import {h} from "vue";
import {YesNoOptionsFormatter} from "@pg/types/src/basic/yes-no";

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 120 },
  { field: 'name', title: '名称' },
  { field: 'nameFl', title: '英文', minWidth: 120 },
  { field: 'code', title: '编码', width: 160 },
  { field: 'continent', title: '所属洲', width: 160, visible: false },
  { field: 'iso3', title: 'ISO三字代码', width: 160 },
  { field: 'countryCode', title: '国际区号', width: 160 },
  { field: 'phoneUse', title: '区号使用', width: 160,
    formatter: YesNoOptionsFormatter,
  },
  { field: 'domainSuffix', title: '域名后缀', width: 80, visible:false },
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

export const formSchema = [
];
