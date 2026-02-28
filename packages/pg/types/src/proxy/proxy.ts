import { isObject } from '@vue/shared';

export const ProxyMethodOptions = [
  { key: 'no', label: '无', value: 'no' },
  { key: 'customize', label: '自定义', value: 'customize' },
  { key: 'apiGet', label: '代理Api', value: 'apiGet', disabled: true },
];

export const ProxyMethodOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = ProxyMethodOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const ProxyTypeOptions = [
  { key: 'http', label: 'http', value: 'http' },
  { key: 'https', label: 'https', value: 'https' },
  { key: 'socks5', label: 'socks5', value: 'socks5' },
  { key: 'ssh', label: 'ssh', value: 'ssh' },
  { key: 'dynamic', label: '动态代理', value: 'dynamic', disabled: true },
];

export const ProxyTypeOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = ProxyTypeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};

export const IpTypeOptions = [
  { key: 'ipv4', label: 'ipv4', value: 'ipv4' },
  { key: 'ipv6', label: 'ipv6', value: 'ipv6' },
];

export const IpTypeOptionsFormatter = (opt: any) => {
  const value = isObject(opt) ? opt.cellValue : opt;
  const item = IpTypeOptions.find((item) => item.value === value);
  return item ? item.label : '';
};
