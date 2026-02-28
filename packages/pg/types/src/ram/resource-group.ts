/**
 * 资源组分类
 */
export const RamResourceGroupTypeCategory = [
  { label: '普通', value: 'general' },
  { label: '系统', value: 'system' },
  { label: 'api', value: 'api' },
];
/**
 * 资源组分类
 */
export const RamResourceGroupTypeCategoryFormatter = ({ cellValue }) => {
  const item = RamResourceGroupTypeCategory.find(
    (item) => item.value === cellValue,
  );
  return item ? item.label : '';
};

/**
 * 资源属性
 */
export const RamResourceTypeAttr = [
  { label: '菜单', value: 'menu' },
  { label: '资源', value: 'resource' },
];
/**
 * 资源属性
 */
export const RamResourceTypeAttrFormatter = ({ cellValue }) => {
  const item = RamResourceTypeAttr.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
