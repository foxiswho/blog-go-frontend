import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

import { setStateEnableDisable } from './api';

/**
 * 搜索表单 Schema
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'wd',
      label: '关键词',
      componentProps: {
        placeholder: '请输入',
        clearable: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'no',
      label: '文章编号',
      componentProps: {
        placeholder: '请输入',
        clearable: true,
      },
    },
    {
      fieldName: 'tagsQuery',
      label: '标签',
      component: '',
      componentProps: {
        filterable: true,
        multiple: true,
        tag: true,
        show: false,
      },
    },
    {
      component: 'Select',
      fieldName: 'state',
      label: '状态',
      componentProps: {
        clearable: true,
        options: [
          { label: '停用', value: '2' },
          { label: '有效', value: '1' },
          { label: '弃置', value: '12' },
          { label: '取消', value: '11' },
        ],
      },
    },
  ];
}

/**
 * 表格列配置
 */
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
  { field: 'tenantNoName', title: '租户', width: 120, visible: false },
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
  { title: '操作', width: 160, field: 'right', slots: { default: 'operate' } },
];
