import { type Category, type Fetch, type UploadGroupItem } from './type';

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
  fetchSetting: {
    default: {},
    type: Object as PropType<Fetch>,
  },
  group: {
    default: [],
    type: Array<UploadGroupItem>,
  },
  modelValue: {
    default: {},
    type: Object,
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
