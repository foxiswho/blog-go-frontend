import { isObject } from '@vue/shared';

export const YesNoStringRandomCloseOptions = [
  { label: '是', value: 'yes' },
  { label: '否', value: 'no' },
];
export const YesNoStringRandomCloseOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = YesNoStringRandomCloseOptions.find(
    (item) => item.value === value,
  );
  return item ? item.label : '';
};

export const YesNoStringCustomizeCloseOptions = [
  { label: '是', value: 'yes' },
  { label: '否', value: 'no' },
];
export const YesNoStringCustomizeCloseOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = YesNoStringCustomizeCloseOptions.find(
    (item) => item.value === value,
  );
  return item ? item.label : '';
};
