/**
 * 类型属性
 */
export const RamMenuTypeRelation = [
  { label: '资源组', value: 'group' },
  { label: '资源', value: 'resource' },
];
/**
 * 类型属性
 */
export const RamMenuTypeRelationFormatter = ({ cellValue }) => {
  const item = RamMenuTypeRelation.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
