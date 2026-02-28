/**
 * 语言
 */
export const lang = [
  { key: 'go', label: 'go', value: 'go' },
  { key: 'java', label: 'java', value: 'java' },
  { key: 'ts', label: 'ts', value: 'ts' },
];

/**
 * 语言
 */
export const langFormatter = ({ cellValue }) => {
  const item = lang.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
/**
 * 加载位置
 */
export const loadingLocation = [
  { key: 'startLoading', label: '启动加载', value: 'startLoading' },
  { key: 'loadAfterStartup', label: '启动后加载', value: 'loadAfterStartup' },
  {
    key: 'lazyLoadingAfterStartup',
    label: '启动后延迟加载',
    value: 'lazyLoadingAfterStartup',
  },
  { key: 'appStartsLoading', label: '应用启动加载', value: 'appStartsLoading' },
];

/**
 * 加载位置
 */
export const loadingLocationFormatter = ({ cellValue }) => {
  const item = loadingLocation.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
/**
 * 缓存
 */
export const cache = [
  { key: 'memory', label: '内存', value: 'memory' },
  { key: 'redis', label: 'redis', value: 'redis' },
  { key: 'l2', label: '2级缓存', value: 'l2' },
];

/**
 * 缓存
 */
export const cacheFormatter = ({ cellValue }) => {
  const item = cache.find((item) => item.value === cellValue);
  return item ? item.label : '';
};
