import { isObject } from '@vue/shared';

/**
 * 库存类型
 */
export const inventoryType = [
  { label: '营销', value: 'promotion' },
  { label: '普通', value: 'general' },
];

export const inventoryTypeFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = inventoryType.find((item) => item.value === value);
  return item ? item.label : '';
};
