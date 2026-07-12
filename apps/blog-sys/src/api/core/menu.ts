import type { RouteRecordStringComponent } from '@vben/types';

import type {RamMenuAuth} from "#/models/RamMenu";

import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/xianfu/menu/all');
}

/**
 * 设置用户菜单权限
 */
export async function getAllMenusApiAuth() {
  return requestClient.get<RamMenuAuth>('/xianfu/menu/auth');
}
