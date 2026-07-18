import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { existName, setStateEnableDisable } from './api';
import {h} from "vue";
import {confirmSwitch} from "#/adapter/vxe-table";

export const columns: VxeGridPropTypes.Columns = [
  // { type: 'checkbox', title: 'ID', width: 120 },
  { field: 'name', title: '名称', minWidth: 200, treeNode:true, align: 'left' },
  { field: 'code', title: '码值', width: 200 },
  {
    field: 'state',
    title: '状态',
    // slots: { default: 'state' },
    width: 90,
    cellRender: {
      name: 'CellSwitchPg',
      attrs: { beforeChange: async(newStatus: number|string, record: any,$table)=>{
          try {
            await confirmSwitch(record.name,newStatus);
            await setStateEnableDisable(record.id, newStatus);
            return true;
          } catch {
            return false;
          }
        }
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
