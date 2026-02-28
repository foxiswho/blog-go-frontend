import { isObject } from '@vue/shared';

export const typesGoods = [
  {
    label: '普通商品',
    value: 'general',
    description: '描述',
  },
  {
    label: '卡密/网盘',
    value: 'cardKey',
    description: '描述',
  },
  {
    label: '优惠券',
    value: 'promotion',
    description: '描述',
  },
  {
    label: '虚拟商品',
    value: 'virtual',
    description: '描述',
  },
  {
    label: '浏览器扩展',
    value: 'browserExtension',
    description: '描述',
  },
];

export const typesGoodsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = typesGoods.find((item) => item.value === value);
  return item ? item.label : '';
};

/**
 * 规格类型
 */
export const typeSpecifications = [
  { label: '单规格', value: 'single' },
  { label: '多规格', value: 'more' },
];

export const typeSpecificationsSingle = 'single';

/**
 * 规格类型
 */
export const typeSpecificationsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = typeSpecifications.find((item) => item.value === value);
  return item ? item.label : '';
};

/**
 * 物流方式
 */
export const logisticsMethod = [
  { label: '快递', value: 'express', key: 'express' },
  {
    label: '到店核销',
    value: 'verificationInStore',
    key: 'verificationInStore',
  },
];

/**
 * 用户类型属性
 */
export const userTypeAttr = [
  { label: '付费会员专属', value: 'PaidExclusive', key: 'PaidExclusive' },
  { label: '新用户', value: 'NewUsers', key: 'NewUsers' },
];

/**
 * 组合类型
 */
export const combinatorial = [
  { label: '单品', value: 'single' },
  { label: '组合商品', value: 'combinatorial' },
];

/**
 * 组合类型
 */
export const combinatorialFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = combinatorial.find((item) => item.value === value);
  return item ? item.label : '';
};
