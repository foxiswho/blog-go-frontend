import { isObject } from '@vue/shared';

export const basicOptionsType = [
  { label: '系统', value: 'system' },
  { label: '普通', value: 'general' },
];
export const basicTypeFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = basicOptionsType.find((item) => item.value === value);
  return item ? item.label : '';
};
export const basicTypeDomain = [
  { label: '系统', value: 'system' },
  { label: '平台', value: 'platform' },
  { label: '商户', value: 'merchant' },
  { label: '租户', value: 'tenant' },
  { label: '店铺', value: 'shop' },
  { label: '其他', value: 'other' },
];
export const basicTypeDomainFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = basicTypeDomain.find((item) => item.value === value);
  return item ? item.label : '';
};
