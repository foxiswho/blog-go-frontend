import { isObject } from '@vue/shared';

export const YesNoOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];
export const YesNoOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = YesNoOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
export const YesNoStringOptions = [
  { label: '是', value: 'yes' },
  { label: '否', value: 'no' },
];
export const YesNoStringOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = YesNoStringOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
export const YesNoBoolOptions = [
  { label: '是', value: true },
  { label: '否', value: false },
];
export const YesNoBoolOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = YesNoBoolOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
/**
 * 创始人
 */
export const FounderOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 2 },
];
export const FounderOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = FounderOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
