import type { VxeGridPropTypes } from 'vxe-table';

import {
  basicTypeDomainFormatter,
  FounderOptionsFormatter,
  IdentityTypeFormatter,
  SexOptionsFormatter
} from '@pg/types';
import _XEUtils_ from 'xe-utils';

import { existName, setStateEnableDisable } from './api';

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: '', width: 40 },
  { field: 'id', title: 'ID', width: 80 },
  { field: 'name', title: '名称', visible: false },
  { field: 'account', title: '账号', visible: false },
  { field: 'accountAll', title: '账号', slots: { default: 'accountAll' } },
  { field: 'nameAll', title: '名称时间', slots: { default: 'nameAll' } },
  { field: 'merchantAll', title: '商户', slots: { default: 'merchantAll' } },
  { field: 'tenantId', title: '商户', visible: false },
  { field: 'tenantIdName', title: '商户', visible: false },
  { field: 'merchantIdName', title: '商户', visible: false },
  { field: 'osAll', title: '组织', slots: { default: 'osAll' }, visible: false },
  { field: 'jobAll', title: '职位', slots: { default: 'jobAll' }, visible: false },
  { field: 'mail', title: '邮箱', width: 160, visible: false },
  { field: 'phone', title: '手机号', width: 160, visible: false },
  { field: 'code', title: '代号', width: 160, visible: false },
  { field: 'typeIdentity', title: '身份', width: 100, visible: false, formatter: IdentityTypeFormatter },
  { field: 'typeDomain', title: '域', width: 100, visible: false, formatter: basicTypeDomainFormatter },
  { field: 'founder', title: '创始人', width: 100, formatter: FounderOptionsFormatter },
  { field: 'typeDomainAll', title: '域|身份', width: 100, slots: { default: 'typeDomainAll' }, visible: false },
  {
    field: 'sex',
    title: '性别',
    formatter: SexOptionsFormatter,
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
  { title: '操作', width: 160, field: 'right', slots: { default: 'operate' } },
];

export const formSchema = [];
