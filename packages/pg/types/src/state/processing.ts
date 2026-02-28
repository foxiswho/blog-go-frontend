import { isObject } from '@vue/shared';

/**
 * 审批状态
 */
export const TypeProcessingOptions = [
  { label: '未处理', value: 'notProcessed', tagType: 'default' },
  { label: '处理完成', value: 'processingComplete', tagType: 'success' },
  { label: '处理中', value: 'processing', tagType: 'warning' },
  { label: '提交', value: 'submit', tagType: 'info' },
  { label: '处理失败', value: 'processingFailed', tagType: 'error' },
];

export const TypeProcessingFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TypeProcessingOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const TypeProcessingFormatterTagType = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TypeProcessingOptions.find((item) => item.value === value);
  return item ? item.tagType : '';
};
