import { isObject } from '@vue/shared';

/**
 * 审批状态
 */
export const approvedOptions = [
  { label: '未审批', value: 'notApproved', tagType: 'default' },
  { label: '通过', value: 'approved', tagType: 'success' },
  { label: '不通过', value: 'approvalFailed', tagType: 'error' },
  { label: '提交', value: 'submit', tagType: 'info' },
];

export const approvedOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = approvedOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const approvedOptionsFormatterTagType = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = approvedOptions.find((item) => item.value === value);
  return item ? item.tagType : '';
};
