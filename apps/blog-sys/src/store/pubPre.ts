import { acceptHMRUpdate, defineStore } from 'pinia';
import { useConfigPubStore } from './configPub';

interface PubPreState {
  /**
   * 登陆密钥
   */
  loginPub: string;
}

/**
 * 密钥相关
 */
export const usePubPreStore = defineStore('pubPreState', {
  actions: {
    isEnable() {
      return useConfigPubStore().isLoginEncrypt();
    },
    getLoginPub() {
      return this.loginPub;
    },
    setLoginPub(loginPub: string) {
      this.loginPub = loginPub;
    },
  },
  persist: {
    // 持久化
    pick: ['loginPub'],
  },
  state: (): PubPreState => ({
    loginPub: '',
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(usePubPreStore, hot));
}
