import { requestClient } from '#/api/request';

enum Api {
  publicPrivateKey = '/pg2lq/auth/publicPrivateKey',
}

/**
 * 公钥获取
 * @param data
 */
export const publicPrivateKey = (data?: any) => {
  return requestClient.post(Api.publicPrivateKey, data);
};
