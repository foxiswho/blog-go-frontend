import type { RouteRecordStringComponent } from '@vben/types';

export interface RamMenuAuth {
  data: RouteRecordStringComponent[];
  otherAuth: 'allow'|'deny';
  /**
   * 是否启用
   */
  menuAuth: boolean;
}
