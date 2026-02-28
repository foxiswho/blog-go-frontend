import { isObject } from '@vue/shared';

/**
 * 类型
 */
export const SkuMappingType = [
  { label: '上游', value: 'upstream' },
  { label: '下游', value: 'downstream' },
];
export const SkuMappingTypeFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = SkuMappingType.find((item) => item.value === value);
  return item ? item.label : '';
};
/**
 * 类型
 */
export const SkuMappingTypeSku = [
  { label: '商品', value: 'goods' },
  { label: 'sku', value: 'sku' },
];

export const typeSkuFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = SkuMappingTypeSku.find((item) => item.value === value);
  return item ? item.label : '';
};
