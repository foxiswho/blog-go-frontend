import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { decodePaseto } from "@pg/utils";
import { defineStore } from 'pinia';

import { notification } from '#/adapter/naive';
import { getUserInfoApiPublic, loginApi, logoutApi} from '#/api';
import { $t } from '#/locales';
import { useConfigPubStore } from "#/store/configPub";
import { SmUtil } from '#/tools/smUtil';


export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const configPubStore = useConfigPubStore();
  const router = useRouter();

  const loginLoading = ref(false);
  const sm = new SmUtil();
  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      //
      if (
        configPubStore.isLoginEncrypt() &&
        configPubStore.getLoginPub() &&
        params['password']
      ) {
        sm.setPublicKey(configPubStore.getLoginPub());
        params.password = sm.encryptHex(params.password);
        params['encrypt'] = 'encrypt';
      }
      params['account'] = params['username'];
      //
      const { accessToken, authCode, refreshToken } = await loginApi(params);
      const { payload } = decodePaseto(accessToken);

      // 如果成功获取到 accessToken
      if (accessToken) {
        // 将 accessToken 存储到 accessStore 中
        accessStore.setAccessToken(accessToken);
        accessStore.setRefreshToken(refreshToken);
        configPubStore.setTenantId(payload.tno)
        configPubStore.setTokenJti(payload.jti)
        // 获取用户信息并存储到 accessStore 中
        // const [fetchUserInfoResult, accessCodes] = await Promise.all([
        //   fetchUserInfo(),
        //   getAccessCodesApi(),
        // ]);
        // userInfo = fetchUserInfoResult;
        // userInfo = await fetchUserInfo();
        accessStore.setAccessCodes(authCode);
        //
        const infoPublic = await fetchUserInfoPublic();
        // console.log('InfoPublic',infoPublic)
        if(infoPublic?.menuRouter) {
          configPubStore.setRouterOtherAuth(infoPublic.menuRouter.otherAuth);
          // 菜单
          configPubStore.setRouterList(infoPublic.menuRouter.data);
          // 按钮权限码
          if (infoPublic.menuRouter?.dataCodes){
            accessStore.setAccessCodes(infoPublic.menuRouter?.dataCodes);
          }
        }
        userInfo = infoPublic.info;

        userStore.setUserInfo(infoPublic.info);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          notification.success({
            content: $t('authentication.loginSuccess'),
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3000,
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    // const userInfo = await getUserInfoApi();
    const infoPublic = await getUserInfoApiPublic();
    console.log('fetchUserInfo=',infoPublic)
    userStore.setUserInfo(infoPublic.info);
    if(infoPublic?.menuRouter) {
      configPubStore.setData(infoPublic.menuRouter);
    }
    return infoPublic.info;
  }
  async function fetchUserInfoPublic() {
    const infoPublic = await getUserInfoApiPublic();
    userStore.setUserInfo(infoPublic.info);
    return infoPublic;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
