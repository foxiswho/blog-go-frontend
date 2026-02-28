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
}

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
  url: string;
  urlLink?: string;
  // 列表
  urlList?: string;
  // 二维码url
  urlQr?: string;
  // 根据所有者获取
  urlByOwner?: string;
  // 根据所有者删除
  urlByOwnerDel?: string;
  // 模块
  module?: string;
}

export interface Category {
  func: () => Promise<any>;
  key: string;
  name: string;
}
