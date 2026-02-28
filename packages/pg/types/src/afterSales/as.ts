import { isObject } from '@vue/shared';

export enum ApprovedEnum {
  // 审批通过
  Approved = 'approved',
  // 未审批
  NotApproved = 'notApproved',
  // 审批不通过,驳回
  Rejected = 'rejected',
  // 提交
  Submit = 'submit',
}

export const ApprovedOptions = [
  {
    key: ApprovedEnum.NotApproved,
    label: '未审批',
    value: ApprovedEnum.NotApproved,
  },
  {
    key: ApprovedEnum.Approved,
    label: '审批通过',
    value: ApprovedEnum.Approved,
  },
  { key: ApprovedEnum.Rejected, label: '驳回', value: ApprovedEnum.Rejected },
  { key: ApprovedEnum.Submit, label: '提交', value: ApprovedEnum.Submit },
];

export const ApprovedOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = ApprovedOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const ContentTypeOptions = [
  { key: 'all', label: '全部退款', value: 'all' },
  { key: 'single', label: '单个商品退款', value: 'single' },
];

export const ContentTypeOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = ContentTypeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
