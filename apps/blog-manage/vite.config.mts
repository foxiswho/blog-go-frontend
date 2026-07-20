import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { defineConfig } from '@vben/vite-config';

const require = createRequire(import.meta.url);

/**
 * 需要离线化的图标集及其图标名
 * 路由/组件中使用 icon: 'prefix:name' 字符串引用的图标都应在此列出
 * 新增图标时，只需在此处添加对应条目即可
 */
const offlineIcons: Record<string, string[]> = {
  'pixel': ['management'],
  'mdi': [
    'account-multiple',
    'account',
    'account-key',
    'account-circle',
    'account-settings',
    'button-cursor',
    'chemical-weapon',
    'github',
    'shield-key-outline',
    'store',
    'store-cog-outline',
  ],
  'lucide': [
    'area-chart',
    'book-open-text',
    'check-circle',
    'copyright',
    'copy',
    'edit',
    'layout-dashboard',
    'plus',
    'trash-2',
    'user',
    'user-plus',
  ],
  'carbon': [
    'circle-dash',
    'logo-github',
    'security',
    'software-resource',
    'user-role',
    'workspace',
  ],
  'mingcute': ['department-fill'],
  'arcticons': ['tenantcloud-pro'],
  'hugeicons': ['group-01', 'new-job'],
  'material-symbols': [
    'attachment',
    'category',
    'dictionary',
    'mail',
    'rule',
    'sms',
    'task',
  ],
  'gridicons': ['domains', 'product'],
  'system-uicons': ['version', 'versions'],
  'fluent': ['device-eq-16-regular', 'mail-list-16-regular'],
  'boxicons': ['area', 'component'],
  'qlementine-icons': ['sms-16', 'snapshot-16'],
  'streamline-block': ['basic-ui-dashboard'],
  'streamline-freehand': ['human-resources-hierarchy'],
  'gis': ['search-country'],
  'tdesign': ['module'],
  'eos-icons': ['namespace'],
  'grommet-icons': ['resources'],
  'ri': ['team-fill'],
  'mdi-light': ['menu'],
  'clarity': ['router-line'],
  'ic': ['baseline-view-in-ar'],
};

/**
 * Vite 插件：编译时从 @iconify/json 提取图标数据，通过虚拟模块打包进 bundle
 * 运行时用 addCollection 注册，不再从远程 API (api.iconify.design) 拉取
 */
function iconifyOfflinePlugin() {
  const virtualModuleId = 'virtual:iconify-offline';
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name: 'iconify-offline',
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id: string) {
      if (id !== resolvedVirtualModuleId) return;

      const collections: Record<
        string,
        {
          prefix: string;
          icons: Record<string, unknown>;
          aliases?: Record<string, unknown>;
          [key: string]: unknown;
        }
      > = {};

      for (const [prefix, iconNames] of Object.entries(offlineIcons)) {
        try {
          const collectionPath = require.resolve(
            `@iconify/json/json/${prefix}.json`,
          );
          const collection = JSON.parse(
            readFileSync(collectionPath, 'utf-8'),
          );

          const filteredIcons: Record<string, unknown> = {};
          const filteredAliases: Record<string, unknown> = {};

          for (const name of iconNames) {
            if (collection.icons?.[name]) {
              filteredIcons[name] = collection.icons[name];
            }
            if (collection.aliases?.[name]) {
              filteredAliases[name] = collection.aliases[name];
              // 别名的父图标也需要包含
              const parent = collection.aliases[name].parent;
              if (parent && collection.icons?.[parent]) {
                filteredIcons[parent] ??= collection.icons[parent];
              }
            }
          }

          const entry: Record<string, unknown> = {
            prefix: collection.prefix,
            icons: filteredIcons,
          };
          // 保留集合级别的尺寸信息
          for (const key of ['width', 'height', 'lastModified']) {
            if (collection[key] !== undefined) {
              entry[key] = collection[key];
            }
          }
          if (Object.keys(filteredAliases).length > 0) {
            entry.aliases = filteredAliases;
          }

          collections[prefix] = entry as never;
        } catch {
          console.warn(`[iconify-offline] 无法加载图标集: ${prefix}`);
        }
      }

      return `export const collections = ${JSON.stringify(collections)};`;
    },
  };
}

export default defineConfig(async () => {
  return {
    // 强制所有资源本地打包
    build: {
      // 所有资源都打包成文件，不内联
      assetsInlineLimit: 0,

      rollupOptions: {
        output: {
          minify: {
            compress: {
              dropConsole: true, // 开启后，会移除所有 console.* 语句
            },
          },
        },
        // 不排除任何包 -> 全部打进本地
        external: [],
      },
    },

    // 核心：禁止任何远程 http/https 导入（Vite 8 专用）
    plugins: [
      {
        name: 'forbid-remote-imports',
        enforce: 'pre',
        resolveId(id) {
          if (id.startsWith('http://') || id.startsWith('https://')) {
            new Error(`❌ 禁止使用远程资源，请换成本地文件：${id}`)
          }
          return null
        },
      },
    ],
    application: {},
    vite: {
      plugins: [iconifyOfflinePlugin()],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
          '/xianfu': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/xianfu/, ''),
            // 博客目标地址
            target: 'http://localhost:9981/xianfu',
            ws: true,
          },
        },
      },
    },
  };
});
