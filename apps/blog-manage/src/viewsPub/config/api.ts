
import { requestClient } from '#/api/request';

enum Api {
  config = '/xianfu/pub/config',
}

/**
 * 详情
 * @param data
 */
export const config = () => {
  return requestClient.get(Api.config);
};

export const configInitializer = (configPub: any) => {
  config().then((res) => {
    if (res) {
      configPub.setData(res);
    }
  });
};
