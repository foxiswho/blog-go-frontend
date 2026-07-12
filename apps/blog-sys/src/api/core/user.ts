import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/xianfu/sys/public/info');
}

/**
 * 获取用户信息
 */
export async function getUserInfoApiPublic() {
  return requestClient.get('/xianfu/sys/public/infoPublic');
}
