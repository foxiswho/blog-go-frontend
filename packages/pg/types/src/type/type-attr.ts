import { isObject } from '@vue/shared';
/**
 * 类别属性
 */
export const TypeAttr = [
  // { label: '分类', value: 'category' },
  { label: '最后一级分类', value: 'categoryLast' },
  { label: '资源', value: 'resource' },
];
/**
 * 类别属性
 */
export const TypeAttrFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TypeAttr.find((item) => item.value === value);
  return item ? item.label : '';
};
