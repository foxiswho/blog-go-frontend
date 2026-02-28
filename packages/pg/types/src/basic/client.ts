import { isObject } from '@vue/shared';

export const ClientOptions = [
  { label: 'app', value: 'app', key: 'app' },
  { label: 'mini', value: 'mini', key: 'mini' },
  { label: 'h5', value: 'h5', key: 'h5' },
  { label: 'pc', value: 'pc', key: 'pc' },
  { label: '全部', value: 'all', key: 'all' },
];
export const ClientOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = ClientOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
