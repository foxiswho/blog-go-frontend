export interface UploadGroupItem {
  // 说明
  description?: string;
  // 是否是 html格式
  descriptionIsHtml?: boolean;
  // 标题扩展内容
  headerExtra?: string;
  // 高度
  height?: number | string;
  // 键
  key: string;
  // 最大数量
  maxNumber?: number;
  // 最大 MB
  maxSize?: number;
  // 名称
  name: string;
  // 宽度
  width?: number | string;
  group?: Object;
  params?: Record<string, any>;
}

// 定义 uploadFn 第二个参数的类型
export type UploadFnOptionType =
  | 'default'
  | 'qr'
  | 'list'
  | 'urlByOwner'
  | 'urlByOwnerDel';

export interface UploadFnSettingOptions {
  url?: string;
  type?: UploadFnOptionType; // 可选，默认值可在业务里定义
  config?: any;
}
// 你要的 AnyFn 类型
export type AnyUploadFn = (
  param: Record<string, any>, // 第一个参数：自定义对象
  setting: UploadFnSettingOptions, // 第二个参数：严格格式
) => any; // 返回值任意
// 占位函数
export const emptyUploadFn: AnyUploadFn = () => {};
export interface UploadDataItem {
  // 是否编辑
  edit?: boolean;
  // 名称
  name: string;
  // 原始名称
  sourceName: string;
  // 网址
  url: string;
}

export interface Fetch {
  // header 对象
  header?: object;
  // 参数
  params?: object;
  // url
  url?: string;
  // 上传函数
  uploadFn: AnyUploadFn;
  // 模块
  module?: string;
}

export interface Category {
  func: () => Promise<any>;
  key: string;
  name: string;
}
