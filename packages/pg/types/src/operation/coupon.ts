import { isObject } from '@vue/shared';

/**
 * 售前退款
 */
export const RefundBeforeSalesOptions = [
  { label: '不返还', value: 'notReturn', key: 'notReturn' },
  { label: '全额退款返还', value: 'fullRefundReturn', key: 'fullRefundReturn' },
];
export const RefundBeforeSalesOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = RefundBeforeSalesOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const RefundAfterSalesOptions = [
  { label: '不返还', value: 'notReturn', key: 'notReturn' },
  { label: '全额退款返还', value: 'fullRefundReturn', key: 'fullRefundReturn' },
];
export const RefundAfterSalesOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = RefundAfterSalesOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const CouponRemindOptions = [
  { label: '领取成功提醒', value: 'received', key: 'received' },
  { label: '即将过期提醒', value: 'expiration', key: 'expiration' },
  { label: '领取多少天未使用提醒', value: 'unused', key: 'unused' },
];
export const CouponRemindOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = CouponRemindOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const CouponUndertakeOptions = [
  // { label: '平台', value: 'platform' },
  { label: '店铺', value: 'store', key: 'store' },
  { label: '渠道', value: 'channel', key: 'channel' },
  { label: '一起承担', value: 'and', key: 'and' },
];
export const CouponUndertakeOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = CouponUndertakeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const CouponWhenTypeOptions = [
  { label: '固定', value: 'fixed' },
  { label: '动态', value: 'changing', disabled: true },
];
export const CouponWhenTypeOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = CouponWhenTypeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const CouponWhatOptions = [
  { label: '无限制使用', value: 'all', key: 'all' },
  { label: '与活动不能同享', value: 'notAndActivity', key: 'notAndActivity' },
  { label: '与优惠不能同享', value: 'notAndCoupon', key: 'notAndCoupon' },
  // { label: '规则', value: 'otherRule', key: 'otherRule' },
];
export const CouponWhatOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = CouponWhatOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
export const CouponWhereOptions = [
  { label: '所有', value: 'all', key: 'all' },
  // { label: '单品', value: 'singleProduct', key: 'singleProduct' },
  { label: '指定商品', value: 'selectedGoods', key: 'selectedGoods' },
  { label: '类目', value: 'goodsCategory', key: 'goodsCategory' },
  { label: '品牌', value: 'goodsBrand', key: 'goodsBrand' },
  // { label: '指定渠道', value: 'selectedChannel', key: 'selectedChannel' },
  { label: '指定活动', value: 'selectedActivity', key: 'selectedActivity' },
  // { label: '指定用户', value: 'selectedUser', key: 'selectedUser' },
  {
    label: '指定用户等级',
    value: 'selectedUserLevel',
    key: 'selectedUserLevel',
  },
  // { label: '指定事件', value: 'selectedEvent', key: 'selectedEvent' },
  // { label: '指定项目', value: 'selectedProject', key: 'selectedProject' },
  // { label: '指定平台', value: 'selectedPlatform', key: 'selectedPlatform' },
  // { label: '指定店铺', value: 'selectedStore', key: 'selectedStore' },
];
export const CouponWhereOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = CouponWhereOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
export const CouponHowOptions = [
  { label: '自主领取', value: 'selfCollection', key: 'selfCollection' },
  { label: '专属领取/兑换', value: 'exclusive', key: 'exclusive' },
  { label: '系统自动发放', value: 'automated', key: 'automated' },
  { label: '后台指定发放', value: 'background', key: 'background' },
];
export const CouponHowOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = CouponHowOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const CouponWhoOptions = [
  { label: '所有', value: 'all', key: 'all' },
  { label: '新用户', value: 'newUser', key: 'newUser' },
  { label: '老用户', value: 'oldUser', key: 'oldUser' },
  { label: '指定用户', value: 'selectUser', key: 'selectUser' },
  { label: '指定用户类型', value: 'selectUserType', key: 'selectUserType' },
  { label: '指定用户级别', value: 'selectLevel', key: 'selectLevel' },
  { label: '没有订单的用户', value: 'NotOrder', key: 'NotOrder' },
];
export const CouponWhoOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = CouponWhoOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
