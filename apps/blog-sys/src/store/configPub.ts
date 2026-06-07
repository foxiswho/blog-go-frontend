import type { RouteRecordStringComponent } from '@vben/types';

import { acceptHMRUpdate, defineStore } from 'pinia';

interface ConfigPubState {
  /**
   * 加密登陆
   */
  loginEncrypt: boolean;
  /**
   * 登陆密钥
   */
  loginPub: string;
  /**
   * 密钥编号
   */
  loginPubNo: string;
  routerOtherAuth: 'allow'|'deny';
  /**
   *
   */
  routerList: RouteRecordStringComponent[];
  /**
   * 是否启用
   */
  menuAuth: boolean;
}

/**
 * 公共配置
 */
export const useConfigPubStore = defineStore('configPubState', {
  actions: {
    isLoginEncrypt() {
      return true;
    },
    setLoginEncrypt(bool: boolean) {
      this.loginEncrypt = bool;
    },
    getLoginPub() {
      return this.loginPub;
    },
    setLoginPub(loginPub: string) {
      this.loginPub = loginPub;
    },
    setLoginPubNo(no: string) {
      this.loginPubNo = no;
    },
    setRouterOtherAuth(str: string) {
      // @ts-ignore
      this.routerOtherAuth = str;
    },
    setRouterList(data:RouteRecordStringComponent[]) {
      this.routerList = data;
    },
    setMenuAuth(menuAuth:any) {
      this.routerList = menuAuth.data;
      this.routerOtherAuth = menuAuth.otherAuth;
      this.menuAuth = true;
      if(menuAuth.hasOwnProperty('menuAuth') && menuAuth.menuAuth != null) {
          this.menuAuth = !!menuAuth.menuAuth;
        }
    },
    getMenuData(){
      return {
        otherAuth:this.routerOtherAuth,
        data:this.routerList,
        menuAuth:this.menuAuth,
      }
    }
  },
  persist: {
    // 持久化
    pick: [
      'loginEncrypt',
      'routerOtherAuth',
      'routerList',
      'menuAuth',
      'loginPub',
      'loginPubNo',
    ],
  },
  state: (): ConfigPubState => ({
    loginEncrypt: false,
    loginPub: '',
    loginPubNo: '',
    routerOtherAuth: 'allow',
    routerList: [],
    menuAuth: true,
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useConfigPubStore, hot));
}
