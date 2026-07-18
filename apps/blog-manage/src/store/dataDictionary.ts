import { acceptHMRUpdate, defineStore } from 'pinia';
import {typeCodeAllPublic, typeCodePublic} from '#/viewsBasic/data-dict/dict/api';
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
export const useDataDictionaryStore = defineStore('dataDictionaryStore', {
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
    getLabel(type: string, value: string) {
      const dict = this.get(type)
      const data = dict?.find(item => item.value === value)
      return data?.label || null
    },
    async requestAllSet(params: string[]): void {
      const that = this;
      await typeCodeAllPublic(params).then((data: any) => {
        if (data) {
          for(var key in data) {
            that.set(key, data[key]);
          }
        }
      });
    },
    async requestSet(code: string): void {
      const that = this;
      await typeCodePublic(code).then((data: any) => {
        if (data) {
          that.set(code, data);
        }
      });
    },
    async getCacheOrApi(code: string): any {
      if(this.has(code)) {
        return this.get(code);
      }
      const that = this;
      await typeCodePublic(code).then((data: any) => {
        if (data) {
          that.set(code, data);
        }
      });
      return that.get(code);
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
