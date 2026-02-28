import { isObject } from '@vue/shared';

export const triggerTypeOptions = [
  { label: '手动', value: 'manual' },
  { label: '间隔/循环', value: 'loop' },
  { label: '指定', value: 'specified' },
];
export const triggerTypeOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = triggerTypeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const cronTypeOptions = [
  { label: '手动', value: 'manual' },
  { label: '间隔/循环', value: 'loop' },
  { label: '指定', value: 'specified' },
];
export const cronTypeOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = cronTypeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const loopTypeOptions = [
  { label: '秒', value: 'second', key: 'second' },
  { label: '分', value: 'minute', key: 'minute' },
  { label: '时', value: 'hour', key: 'hour' },
  { label: '天', value: 'day', key: 'day' },
  { label: '周', value: 'week', key: 'week' },
  { label: 'cron表达式', value: 'cron', key: 'cron' },
];
export const loopTypeOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = loopTypeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
export const specifiedTypeOptions = [
  { label: '秒', value: 'second', key: 'second' },
  { label: '分', value: 'minute', key: 'minute' },
  { label: '时', value: 'hour', key: 'hour' },
  { label: '天', value: 'day', key: 'day' },
  { label: '周', value: 'week', key: 'week' },
  { label: '日期', value: 'date', key: 'date' },
  { label: 'cron表达式', value: 'cron', key: 'cron' },
];
export const specifiedTypeOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = specifiedTypeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
/**
 * 是否有多个触发器
 */
export const TriggerYesNoStringOptions = [
  { label: '多个', value: 'yes' },
  { label: '手动', value: 'no' },
];
export const TriggerYesNoStringOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TriggerYesNoStringOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
