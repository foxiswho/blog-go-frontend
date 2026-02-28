import { isObject } from '@vue/shared';

export const PaymentOptions = [
  { key: 'balance', label: '余额' },
  { key: 'alipay', label: '支付宝支付' },
  { key: 'wechatPay', label: '微信支付' },
  { key: 'unionPay', label: '银联支付' },
  { key: 'points', label: '积分支付' },
  { key: 'offline', label: '线下支付' },
];

export const PaymentOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = PaymentOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
