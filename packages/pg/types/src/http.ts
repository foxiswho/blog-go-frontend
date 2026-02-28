/**
 * 方法
 */
export const HttpMethod = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PUT', value: 'PUT' },
  { label: 'ALL', value: 'ALL' },
];
/**
 * 方法
 */
export const HttpMethodFormatter = ({ cellValue }) => {
  const item = HttpMethod.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
