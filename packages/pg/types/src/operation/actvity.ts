import { isObject } from '@vue/shared';

/**
 * 活动-预告
 */
export const ActivityTypePreviewOptions = [
  { label: '创建后', value: 'createAfter' },
  { label: '活动开始前', value: 'startBefore' },
  { label: '没有预告', value: 'not' },
];
export const ActivityTypePreviewOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = ActivityTypePreviewOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
