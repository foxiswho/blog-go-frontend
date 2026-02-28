import { isObject } from '@vue/shared';

export const TypeReadingOptions = [
  { key: 'unread', label: '未看', value: 'unread' },
  { key: 'reading', label: '在看', value: 'reading' },
  { key: 'completed', label: '已看', value: 'completed' },
];

export const TypeReadingOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TypeReadingOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const TypeContentOptions = [
  { key: 'original', label: '原创', value: 'original' },
  { key: 'translation', label: '翻译', value: 'translation' },
  { key: 'repost', label: '转载', value: 'repost' },
];

export const TypeContentOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TypeContentOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const TypeSourceOptions = [
  { key: 'handwritten', label: '手写', value: 'handwritten' },
  { key: 'collection', label: '采集', value: 'collection' },
];

export const TypeSourceOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TypeSourceOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const TypeDataSourceOptions = [
  { key: 'platform', label: '平台', value: 'platform' },
  { key: 'external', label: '外部', value: 'external' },
];

export const TypeDataSourceOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TypeDataSourceOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
