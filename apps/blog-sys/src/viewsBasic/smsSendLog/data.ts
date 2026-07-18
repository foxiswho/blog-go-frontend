import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from 'vxe-table';

import _XEUtils_ from 'xe-utils';

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
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '停用', value: '2' },
          { label: '有效', value: '1' },
          { label: '弃置', value: '12' },
          { label: '取消', value: '11' },
        ],
      },
      fieldName: 'state',
      label: '状态',
    },
  ];
}

export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', width: 34 },
  { field: 'receiverPhone', title: '手机号', width: 160 },
  { field: 'traceNo', title: '全局no', width: 160 },
  { field: 'templateCode', title: '系统内部模板编码', width: 160 },
  { field: 'spCode', title: '服务商', width: 160 },
  { field: 'spTemplateCode', title: '服务商模板', width: 160 },
  { field: 'renderedContent', title: '完整内容', width: 160 },
  { field: 'smsLength', title: '短信字数', width: 160 },
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
