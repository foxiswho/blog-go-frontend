import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';
import { mapTree } from '@vben/utils';

import { message } from '#/adapter/naive';
import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';
import {useConfigPubStore} from "#/store";

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');
  const configPubStore = useConfigPubStore();

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  let authRoutes = options.routes;

  try {
    const { menuAuth, otherAuth, data: authList } = configPubStore.getMenuData();
    // 是否允许菜单权限
    if(menuAuth) {
      const authMap = new Map<string, Record<string, any>>();
      for (const item of authList) {
        if (item.path) {
          authMap.set(item.path, (item.meta as Record<string, any>) || {});
        }
      }

      authRoutes = mapTree(options.routes, (route) => {
        const routePath = route.path;

        if (authMap.has(routePath)) {
          const authMeta = authMap.get(routePath)!;
          const filteredMeta: Record<string, any> = {};
          for (const [key, value] of Object.entries(authMeta)) {
            if (value !== undefined && value !== null) {
              filteredMeta[key] = value;
            }
          }
          const mergedMeta = { ...route.meta, ...filteredMeta };
          const originalAuthority = (route.meta as Record<string, any>)?.authority;
          const newAuthority = filteredMeta.authority;
          if (Array.isArray(originalAuthority) && Array.isArray(newAuthority)) {
            mergedMeta.authority = [...new Set([...originalAuthority, ...newAuthority])];
          }
          return { ...route, meta: mergedMeta };
        }

        if (otherAuth === 'deny') {
          return {
            ...route,
            meta: { ...route.meta, hideInMenu: true, authority: ['no-body'] },
          };
        }

        return route;
      });
    }
  } catch {
    // ignore
  }

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    routes: authRoutes,
    fetchMenuListAsync: async () => {
      message.loading(`${$t('common.loadingMenu')}...`, {
        duration: 1.5,
      });
      return await getAllMenusApi();
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
