import { isObject } from '@vue/shared';

export const StateOrderOptions = [
  { key: 'create', label: '待付款', value: 'create' },
  { key: 'pendingApproval', label: '待审核', value: 'pendingApproval' },
  { key: 'pendingDispatch', label: '待发货', value: 'pendingDispatch' },
  { key: 'pending', label: '待处理', value: 'pending' },
  { key: 'shipped', label: '已发货', value: 'shipped' },
  { key: 'received', label: '已收货', value: 'received' },
  { key: 'success', label: '已完成', value: 'success' },
  { key: 'cancel', label: '交易取消', value: 'cancel' },
  { key: 'delete', label: '删除', value: 'delete' },
  { key: 'all', label: '全部', value: 'all' },
];

export const StateOrderOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = StateOrderOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
