/**
 * 资源类型
 */
export const RamResourceType = [
  { label: '普通', value: 'general' },
  { label: '系统', value: 'system' },
  { label: 'api', value: 'api' },
];
/**
 * 资源类型
 */
export const RamResourceTypeFormatter = ({ cellValue }) => {
  const item = RamResourceType.find((item) => item.value === cellValue);
  return item ? item.label : '';
};

/**
 * 资源属性
 */
export const RamResourceTypeAttr = [
  { label: '分类', value: 'category' },
  { label: '最后一级分类', value: 'categoryLast' },
  { label: '资源', value: 'resource' },
];
/**
 * 资源属性
 */
export const RamResourceTypeAttrFormatter = ({ cellValue }) => {
  const item = RamResourceTypeAttr.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
/**
 * 资源属性
 */
export const RamMenuTypeAttr = [
  { label: '分类', value: 'category' },
  { label: '菜单', value: 'menu' },
  { label: '资源', value: 'resource' },
];
/**
 * 资源属性
 */
export const RamMenuTypeAttrFormatter = ({ cellValue }) => {
  const item = RamMenuTypeAttr.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
