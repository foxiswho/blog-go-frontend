import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';
import {
  basicTypeDomainFormatter,
  IdentityTypeFormatter,
  SexOptionsFormatter,
} from '@pg/types';

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
  { field: 'no', title: '代号', width: 160, visible: false },
  {
    field: 'typeIdentity',
    title: '身份',
    width: 100,
    visible: false,
    formatter: IdentityTypeFormatter,
  },
  {
    field: 'typeDomain',
    title: '域',
    width: 100,
    visible: false,
    formatter: basicTypeDomainFormatter,
  },
  {
    field: 'typeDomainAll',
    title: '域|身份',
    width: 100,
    slots: { default: 'typeDomainAll' },
  },
  {
    field: 'sex',
    title: '性别',
    formatter: SexOptionsFormatter,
    visible: false,
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

export const formSchema = [];
