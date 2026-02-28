import { isObject } from '@vue/shared';

/**
 * 库存计数
 */
export const InventoryCounting = [
  { disabled: true, key: 'take', label: '拍下减库存', value: 'take' },
  { key: 'payment', label: '付款减库存', value: 'payment' },
  { disabled: true, key: 'cart', label: '加入购物车减库存', value: 'cart' },
];
/**
 * 库存计数
 */
export const InventoryCountingFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = InventoryCounting.find((item) => item.value === value);
  return item ? item.label : '';
};
/**
 * 有效期
 */
export const ExpiringType = [
  { label: '无', value: 'no' },
  { label: '存在', value: 'expiring' },
];
/**
 * 有效期
 */
export const ExpiringTypeFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = ExpiringType.find((item) => item.value === value);
  return item ? item.label : '';
};
/**
 * 过期单位
 */
export const ExpiringUnit = [
  { disabled: true, key: 'hour', label: '小时', value: 'hour' },
  { key: 'day', label: '天', value: 'day' },
];
/**
 * 过期单位
 */
export const ExpiringUnitFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = ExpiringUnit.find((item) => item.value === value);
  return item ? item.label : '';
};
/**
 * 库存计数
 */
export const PaymentMethod = [
  { key: 'fixedPrice', label: '1口价(普通交易模式)', value: 'fixedPrice' },
  {
    disabled: true,
    key: 'presaleMode',
    label: '预售模式',
    value: 'presaleMode',
  },
  {
    disabled: true,
    key: 'cashOnDelivery',
    label: '货到付款',
    value: 'cashOnDelivery',
  },
];
/**
 * 库存计数
 */
export const PaymentMethodFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = PaymentMethod.find((item) => item.value === value);
  return item ? item.label : '';
};
