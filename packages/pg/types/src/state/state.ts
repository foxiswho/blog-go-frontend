/**
 * 显示隐藏
 */
export const show = [
  { key: 1, label: '显示', value: 1 },
  { key: 2, label: '隐藏', value: 2 },
];

/**
 * 显示隐藏
 */
export const showFormatter = ({ cellValue }) => {
  const item = show.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
/**
 * 状态
 */
export const state = [
  { key: 2, label: '停用', value: 2 },
  { key: 1, label: '有效', value: 1 },
  { key: 12, label: '弃置', value: 12 },
  { key: 11, label: '取消', value: 11 },
];

/**
 * 状态
 */
export const stateFormatter = ({ cellValue }) => {
  const item = state.find((item) => item.value === cellValue);
  return item ? item.label : '';
};

/**
 * 状态
 */
export const stateYesNoOption = [
  { key: 2, label: '停用', value: 2 },
  { key: 1, label: '有效', value: 1 },
];
/**
 * 状态
 */
export const stateYesNoOptionFormatter = ({ cellValue }) => {
  const item = stateYesNoOption.find((item) => item.value === cellValue);
  return item ? item.label : '';
};

/**
 * 客户端
 */
export const client = [
  { key: 'default', label: '默认', value: 'default' },
  { key: 'desktopApp', label: '桌面app', value: 'desktopApp' },
  { key: 'clientOfWeb', label: '桌面web', value: 'clientOfWeb' },
  { key: 'clientOfMobileApp', label: '移动app', value: 'clientOfMobileApp' },
  { key: 'clientOfMobileWeb', label: '移动web', value: 'clientOfMobileWeb' },
  {
    key: 'clientOfMobileAppMini',
    label: '移动app内',
    value: 'clientOfMobileAppMini',
  },
];

/**
 * 客户端
 */
export const clientFormatter = ({ cellValue }) => {
  const item = client.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
