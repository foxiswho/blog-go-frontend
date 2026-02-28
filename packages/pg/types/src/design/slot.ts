import { isObject } from '@vue/shared';

export const SlotTargetOptions = [
  { label: '普通', value: 'general', key: 'general' },
  { label: '指定商品', value: 'goods', key: 'goods' },
  { label: '指定地址', value: 'url', key: 'url' },
];

export const SlotTargetOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = SlotTargetOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const SlotTypeSourceOptions = [
  {
    key: 'general',
    label: '普通',
    value: 'general',
  },
  {
    key: 'blank',
    label: '新窗口',
    value: 'blank',
  },
  { key: 'self', label: '当前窗口', value: 'self' },
];

export const SlotTypeSourceOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = SlotTypeSourceOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
