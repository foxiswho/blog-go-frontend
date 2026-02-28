import type { PropType } from 'vue';
import { UploadProps } from 'naive-ui/lib/upload';

export const uploadPropsDefault: UploadProps = {
  accept: '.jpg,.png,.jpeg,.svg,.gif,.xlsx',
};

export const basicProps = {
  props: {
    type: Object as PropType<Partial<UploadProps>>,
    default: uploadPropsDefault,
  },
  //接受的文件类型
  accept: {
    type: String,
    default: '.jpg,.png,.jpeg,.svg,.gif,.xlsx',
  },
  //返回值类型 string , array
  type: {
    type: String,
    default: 'array',
  },
  //是否显示 帮助说明
  helpShow: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  //其他帮助说明
  helpText: {
    type: String as PropType<string>,
    default: '',
  },
  maxSize: {
    type: Number as PropType<number>,
    default: 5,
  },
  maxNumber: {
    type: Number as PropType<number>,
    default: 999,
  },
  value: {
    type: [Array, String] as PropType<string[] | string>,
    default: () => '',
  },
  width: {
    type: Number as PropType<number>,
    default: 104,
  },
  height: {
    type: Number as PropType<number>,
    default: 104, //建议不小于这个尺寸 太小页面可能显示有异常
  },
  //自定义确认上传 是否
  submitCustom: {
    type: Boolean,
    default: false,
  },
  //自定义确认上传
  model: {
    type: Object as PropType<Recordable<any>>,
    default: {},
  },
};
