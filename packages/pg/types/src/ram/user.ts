import { isObject } from '@vue/shared';
/**
 * 性别
 */
export const SexOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '未知', value: 'unknown' },
];
/**
 * 性别
 */
export const SexOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = SexOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
/**
 * 身份类型
 */
export const IdentityTypeOptions = [
  { label: '普通', value: 'general' },
  { label: '经理', value: 'manager' },
  { label: '副经理', value: 'assistant_manager' },
];
/**
 * 身份类型
 */
export const IdentityTypeFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = IdentityTypeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

/**
 * 账号类型/字段类型
 */
export const TypeFieldOptions = [
  { label: '用户名', value: 'username' },
  { label: '手机号', value: 'phone' },
  { label: '邮箱', value: 'mail' },
  { label: '密码', value: 'password' },
  { label: '名称', value: 'name' },
];
/**
 * 字段类型/账号类型
 */
export const TypeFieldFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TypeFieldOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
/**
 * 表达式类型
 */
export const TypeExprOptions = [
  { label: '普通', value: 'general' },
  { label: '正则', value: 'regular' },
];
/**
 * 表达式类型
 */
export const TypeExprFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = TypeExprOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
