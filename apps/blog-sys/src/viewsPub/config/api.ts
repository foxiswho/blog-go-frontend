import { useAccessStore } from "@vben/stores";

import { requestClient } from '#/api/request';

enum Api {
  config = '/pg2lq/pub/config',
}

/**
 * 详情
 * @param data
 */
export const config = () => {
  return requestClient.get(Api.config);
};

export const configInitializer = (pubPreState: any) => {
  const accessStore = useAccessStore();
  config().then((res) => {
    if (res) {
      pubPreState.setLoginEncrypt(res.loginEncrypt);
      if(res?.menuRouter){
        if(res.menuRouter?.data){
          pubPreState.setRouterList(res.menuRouter.data);
        }
        if(res.menuRouter?.otherAuth){
          pubPreState.setRouterOtherAuth(res.menuRouter.otherAuth);
        }
        if(res.menuRouter?.dataCodes){
          accessStore.setAccessCodes(res.menuRouter.dataCodes);
        }
      }
      if(res?.pubPrive){
        pubPreState.setLoginPubNo(res.pubPrive.no);
        pubPreState.setLoginPub(res.pubPrive.publicKey);
        // pubPreState.setLoginPub("0435053a7a91b2fc473405f475ac66cd12cf9201f82630d96cd983ce1e4200dfb31a50dca2f3428bbc55c8d2de96668c3dc82ee3427ff6d7b53310792b7585c85d");
      }
    }
  });
};
