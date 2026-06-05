import { acceptHMRUpdate, defineStore } from 'pinia';

/**
 * 数据字典
 */
interface DataDictionaryState {
  /**
   * 数据字典
   */
  mapData: Record<string, any>;
}

/**
 * 数据字典
 */
export const useDataDictionaryStore = defineStore('dataDictionaryState', {
  actions: {
    set(key: string, val: any) {
      this.mapData[key] = val;
    },
    get(key: string): any {
      return this.mapData[key];
    },
    /**
     * 删除
     * @param key
     */
    delete(key: string) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.mapData[key];
    },
    /**
     * 是否存在
     * @param key
     */
    has(key: string): boolean {
      return key in this.mapData;
    },
    async requestSet(fn: any, params: { typeCode: string }): void {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      await fn(params).then((data: any) => {
        //console.log('DataDictionary=>', params, data);
        if (data) {
          that.set(params.typeCode, data);
        }
      });
    },
  },
  persist: {
    // 持久化
    pick: ['mapData'],
  },
  state: (): DataDictionaryState => ({
    mapData: {},
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useDataDictionaryStore, hot));
}
