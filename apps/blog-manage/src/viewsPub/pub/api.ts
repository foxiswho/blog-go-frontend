import { dialog, message } from '#/adapter';
import { requestClient } from '#/api/request';

enum Api {
  updatePassword = '/pg2lq/manage/public/password',
  envInfoPublic = '/pg2lq/manage/public/envInfoPublic',
}

/**
 * 更新密码
 */
export const updatePassword = (params: any) =>
  requestClient.post(Api.updatePassword, params, {
    errorMessageMode: 'message',
    successMessageMode: 'message',
  });
/**
 * 详情
 * @param data
 */
export const envInfoPublic = () => {
  return requestClient.get(Api.envInfoPublic);
};
