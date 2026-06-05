import type { Category, Fetch, UploadGroupItem } from './type';

export const UploadGroupItemDefault: UploadGroupItem = {
  // 高度
  height: '100px',
  // 最大数量
  maxNumber: 20,
  // 最大 MB
  maxSize: 30,
  // 宽度
  width: '100px',
};
export const UploadGroupProps = {
  category: {
    default: [],
    type: Array<Category>,
  },
  enabled: {
    default: true,
    type: Boolean,
  },
  // 是否返回
  isReturn: {
    default: false,
    type: Boolean,
  },
  // 是否独立使用
  isStandalone: {
    default: false,
    type: Boolean,
  },
  fetchSetting: {
    default: {},
    type: Object as PropType<Fetch>,
  },
  group: {
    default: [],
    type: Array<UploadGroupItem>,
  },
  modelValue: {
    default: null,
    type: [Object, String],
  },
};

export const UploadProps = {
  fetch: {
    default: {},
    type: Object as PropType<Fetch>,
  },
  uploadSetting: {
    default: {},
    type: Object as PropType<UploadGroupItem>,
  },
};
