import type { RouteRecordStringComponent } from '@vben/types';

import { acceptHMRUpdate, defineStore } from 'pinia';

interface ConfigPubState {
  /**
   * 加密登陆
   */
  loginEncrypt: boolean;
  /**
   * 加载一次
   */
  loadOnce: boolean;
  /**
   * 登陆密钥
   */
  loginPub: string;
  /**
   * 密钥编号
   */
  loginPubNo: string;
  routerOtherAuth: 'allow'|'deny';
  tenantId: string;
  /**
   * token 唯一 令牌
   */
  tokenJti: string;
  /**
   *
   */
  routerList: RouteRecordStringComponent[];
  /**
   * 是否启用
   */
  menuAuth: boolean;

  dataCodes: string[];
}

/**
 * 公共配置
 */
export const useConfigPubStore = defineStore('configPubState', {
  actions: {
    isLoadOnce() {
      return this.loadOnce;
    },
    isLoginEncrypt() {
      return true;
    },
    getLoginPub() {
      return this.loginPub;
    },
    setLoginEncrypt(bool: boolean) {
      this.loginEncrypt = bool;
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
    setTenantId(tenantId: string) {
      this.tenantId = tenantId;
    },
    setTokenJti(tokenJti: string) {
      this.tokenJti = tokenJti;
    },
    setData(item:any) {
      this.loadOnce = true;
      this.loginEncrypt = item.loginEncrypt;
      if(item.login) {
        this.loginPub = item.login.publicKey;
        if(item.login.no) {
          this.loginPubNo = item.login.no;
        }
      }
      if(item.menu) {
        if(item.menu.otherAuth) {
          this.routerOtherAuth = item.menu.otherAuth;
        }
        if (item.menu.dataCodes) {
          this.dataCodes = item.menu.dataCodes;
        }
        if (item.menu.data) {
          this.routerList = item.menus.data;
        }
      }
      this.menuAuth = true;
      if(item.hasOwnProperty('menuAuth') && item.menuAuth != null) {
        this.menuAuth = !!item.menuAuth;
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
      'loadOnce',
      'loginEncrypt',
      'routerOtherAuth',
      'routerList',
      'menuAuth',
      'loginPub',
      'loginPubNo',
      'dataCodes',
      'tenantId',
      'tokenJti',
    ],
  },
  state: (): ConfigPubState => ({
    loadOnce: false,
    loginEncrypt: false,
    routerOtherAuth: 'allow',
    routerList: [],
    dataCodes: [],
    menuAuth: true,
    loginPub: '',
    loginPubNo: '',
    tenantId: '',
    tokenJti: '',
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useConfigPubStore, hot));
}
