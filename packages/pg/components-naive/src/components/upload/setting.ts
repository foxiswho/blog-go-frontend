export const upload = {
  //考虑接口规范不同
  apiSetting: {
    // 集合字段名
    infoField: 'data',
    // 图片地址字段名
    imgField: 'url',
  },
  //图片上传类型
  fileType: [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  // 最大上传图片大小
  maxSize: 2,
};

export function isImage(url) {
  return /\.(gif|jpg|jpeg|png|GIF|JPG|PNG|svg|SVG|webp|WEBP)$/.test(url);
}
