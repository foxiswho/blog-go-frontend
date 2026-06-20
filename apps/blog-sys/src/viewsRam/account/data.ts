import type { VxeGridPropTypes } from 'vxe-table';

import { basicTypeDomainFormatter, IdentityTypeFormatter, SexOptionsFormatter } from '@pg/types';
import _XEUtils_ from 'xe-utils';

import { existName, setStateEnableDisable } from './api';
import {confirmSwitch} from "#/adapter/vxe-table";

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 40 },
  { field: 'name', title: '名称', visible: false },
  { field: 'account', title: '账号', visible: false },
  { field: 'accountAll', title: '账号', slots: { default: 'accountAll' } },
  { field: 'nameAll', title: '名称时间', slots: { default: 'nameAll' } },
  { field: 'osAll', title: '组织', slots: { default: 'osAll' } },
  { field: 'jobAll', title: '职位', slots: { default: 'jobAll' } },
  { field: 'mail', title: '邮箱', width: 160, visible: false },
  { field: 'phone', title: '手机号', width: 160, visible: false },
  { field: 'code', title: '码值', width: 160, visible: false },
  { field: 'typeIdentity', title: '身份', width: 100, visible: false, formatter: IdentityTypeFormatter },
  { field: 'typeDomain', title: '域', width: 100, visible: false, formatter: basicTypeDomainFormatter },
  { field: 'typeDomainAll', title: '域|身份', width: 100, slots: { default: 'typeDomainAll' } },
  {
    cellRender: { name: 'CellImageKey' },
    field: 'avatar',
    title: '头像',
    width: 130,
  },
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
      attrs: { beforeChange: async(newStatus: number|string, record: any,$table)=>{
          try {
            await confirmSwitch(record.account,newStatus);
            await setStateEnableDisable(record.id, newStatus);
            return true;
          } catch {
            return false;
          }
        }
      },
      name: 'CellSwitchPg',
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
