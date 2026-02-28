import { isObject } from '@vue/shared';

export const WorkingPageOptions = [
  { label: '本地页面', value: 'localPage' },
  { label: '不显示', value: 'headless' },
];
export const WorkingPageOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = WorkingPageOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const KernelOptions = [
  { label: 'chromium', value: 'chromium' },
  { label: 'blink', value: 'blink' },
  { label: 'gecko', value: 'gecko' },
  { label: 'quantum', value: 'quantum' },
];
export const KernelOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = KernelOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
