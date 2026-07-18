import type { IconifyJSON } from '@iconify/vue';

import { addCollection } from '@vben/icons';

import { collections } from 'virtual:iconify-offline';

/**
 * 注册离线图标数据
 * 数据由 Vite 插件 iconifyOfflinePlugin 在编译时从 @iconify/json 提取
 * 注册后运行时不再从远程 API 拉取图标
 */
for (const collection of Object.values(collections) as IconifyJSON[]) {
  addCollection(collection);
}
