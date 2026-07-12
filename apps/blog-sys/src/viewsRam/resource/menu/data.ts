import type { VxeGridPropTypes } from 'vxe-table';

import { stateTrueFalseFormatter } from '@pg/types';
import _XEUtils_ from 'xe-utils';

import { confirmSwitch } from '#/adapter/vxe-table';
import { useDataDictionaryStore } from '#/store';
import { typeCodePublic } from '#/viewsBasic/data-dict/dict/api';

import { setStateEnableDisable } from './api';
// 数据字典
const dataDictionaryStore = useDataDictionaryStore();
dataDictionaryStore.requestSet(typeCodePublic, { typeCode: 'typeMenu' });
//
export const typeMenuOptions = () => {
  const dataNew: any[] = [];
  const typeMenu = dataDictionaryStore.get('typeMenu');
  typeMenu.forEach((item) => {
    const obj = {
      color: undefined,
      ...item,
    };
    if (obj?.value) {
      if (obj?.value == 'catalog') {
        obj.color = {
          color: '#e6f6ff',
          textColor: '#006be6',
          borderColor: '#7ac6ff',
        };
      } else if (obj?.value == 'button') {
        obj.color = {
          color: '#fff0f0',
          textColor: '#ff3860',
          borderColor: '#ffb3ba',
        };
      } else if (obj?.value == 'link') {
        obj.color = {
          color: '#fffdf0',
          textColor: '#efbd48',
          borderColor: '#fff4c7',
        };
      } else if (obj?.value == 'embedded') {
        obj.color = {
          color: '#f0fff3',
          textColor: '#57d188',
          borderColor: '#dff7e6',
        };
      }
    }
    // console.log('obj=>', obj);
    dataNew.push(obj);
  });
  return dataNew;
};

export const columns: VxeGridPropTypes.Columns = [
  // { type: 'seq', width: 70,fixed: 'left', },
  {
    field: 'name',
    title: '名称',
    fixed: 'left',
    align: 'left',
    treeNode: true,
    slots: { default: 'title' },
    minWidth: 250,
  },
  {
    align: 'center',
    cellRender: {
      name: 'CellTag',
      options: typeMenuOptions(),
      props: { size: 'small' },
    },
    field: 'typeMenu',
    title: '类型',
    width: 80,
  },
  {
    field: 'authCode',
    title: '授权码',
    width: 200,
  },
  { field: 'path', title: '路由地址', width: 160 },
  { field: 'component', title: '页面组件', width: 160 },
  {
    field: 'terminalCode',
    title: '终端类型',
    width: 90,
    visible: false,
  },
  {
    field: 'terminalCodeName',
    title: '终端类型',
    width: 90,
  },
  {
    field: 'state',
    title: '状态',
    // slots: { default: 'state' },
    width: 90,
    cellRender: {
      name: 'CellSwitchPg',
      attrs: {
        beforeChange: async (
          newStatus: number | string,
          record: any,
          $table,
        ) => {
          try {
            await confirmSwitch(record.name, newStatus);
            await setStateEnableDisable(record.id, newStatus);
            return true;
          } catch {
            return false;
          }
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

export const columnsRouter: VxeGridPropTypes.Columns = [
  { type: 'seq', width: 80, fixed: 'left' },
  {
    field: 'label',
    title: '名称',
    fixed: 'left',
    treeNode: true,
    slots: { default: 'title' },
    minWidth: 250,
  },
  {
    align: 'center',
    cellRender: {
      name: 'CellTag',
      options: typeMenuOptions(),
      props: { size: 'small' },
    },
    field: 'typeMenu',
    title: '类型',
    width: 80,
  },
  {
    field: 'authCode',
    title: '授权码',
    width: 200,
  },
  { field: 'path', title: '路由地址', width: 160 },
  { field: 'component2', title: '页面组件', width: 160 },
  { field: 'component', title: '页面组件', width: 160, visible: false },
  {
    field: 'meta.hideInMenu',
    title: '隐藏菜单',
    width: 80,
    visible: true,
    formatter: stateTrueFalseFormatter,
  },
  {
    field: 'meta.hideInBreadcrumb',
    title: '在面包屑中隐藏',
    width: 80,
    visible: true,
    formatter: stateTrueFalseFormatter,
  },
  {
    field: 'meta.hideChildrenInMenu',
    title: '隐藏子菜单',
    width: 80,
    visible: true,
    formatter: stateTrueFalseFormatter,
  },
  {
    field: 'meta.hideInTab',
    title: '在标签栏中隐藏',
    width: 80,
    visible: true,
    formatter: stateTrueFalseFormatter,
  },
  {
    field: 'meta.keepAlive',
    title: '缓存标签页',
    width: 80,
    visible: true,
    formatter: stateTrueFalseFormatter,
  },
  {
    field: 'meta.ignoreAccess',
    title: '忽略权限',
    width: 80,
    visible: true,
    formatter: stateTrueFalseFormatter,
  },
  {
    field: 'meta.openInNewWindow',
    title: '新窗口打开',
    width: 80,
    visible: true,
    formatter: stateTrueFalseFormatter,
  },
  {
    title: '操作',
    width: 160,
    field: 'right',
    slots: { default: 'operate' },
    visible: false,
  },
];
