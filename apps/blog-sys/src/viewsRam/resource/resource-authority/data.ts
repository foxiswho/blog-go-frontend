import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { existName, setStateEnableDisable } from './api';
import {h} from "vue";
import {
  HttpMethodFormatter,
  RamResourceTypeAttrFormatter,
  RamResourceTypeFormatter
} from "@pg/types";

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 120 },
  { field: 'name', title: '名称', minWidth: 160, visible: false },
  {
    field: 'nameAll',
    title: '名称',
    slots: { default: 'nameAll' },
  },
  { field: 'path', title: '路径', minWidth: 160, visible: false },
  {
    field: 'method',
    title: '方法',
    width: 80,
    formatter: HttpMethodFormatter,
  },
  { field: 'code', title: '资源标识', width: 100, visible: false },
  {
    field: 'typeSys',
    title: '类型',
    width: 80,
    formatter: RamResourceTypeFormatter,
    visible: false,
  },
  {
    field: 'typeAttr',
    title: '属性',
    width: 80,
    formatter: RamResourceTypeAttrFormatter,
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
  { title: '操作', width: 160, field: 'right', slots: { default: 'operate' } },
];

export const formSchema = [
];
