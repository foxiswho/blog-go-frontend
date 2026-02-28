import type { Recordable } from '@vben-core/typings';
import type { Fn } from '@vueuse/core';
import type { DropdownOption } from 'naive-ui';
import type { TreeProps } from 'naive-ui/lib/tree';

import type { PropType } from 'vue';

import { propTypes } from '@pg/utils';

export const pgTreeSelectPropsDefault: TreeProps = {
  // 节点整行撑开
  blockLine: false,
  // 如果设定则 checked 状态受控
  checkedKeys: undefined,
  // 默认展开全部
  defaultExpandAll: true,
  // 如果设定则展开受控
  expandedKeys: undefined,
  // key 字段名称
  keyField: 'key',
  // label 字段名称
  labelField: 'label',
  // 是否在搜索状态显示和搜索无关的节点
  showIrrelevantNodes: false,
};

export const pgTreeSelectProps = {
  // 后续逻辑处理
  afterFetch: { type: Function as PropType<Fn> },
  // 接口回调
  api: {
    type: Function as PropType<
      (arg?: Recordable<any>) => Promise<Recordable<any>>
    >,
  },
  // 头部显示
  headerShow: {
    default: true,
    type: Boolean,
  },
  // 立即
  immediate: {
    default: true,
    type: Boolean,
  },
  // 树菜单 扩展
  menuDropdownOptions: {
    default: [],
    type: Array as PropType<DropdownOption[]>,
  },
  // 接口参数
  params: {
    default: {},
    type: Object,
  },
  props: {
    default: pgTreeSelectPropsDefault,
    type: Object as PropType<Partial<TreeProps>>,
  },
  // 刷新 重载
  reload: {
    default: false,
    type: Boolean,
  },
  // 返回值
  resultField: propTypes.string.def(''),
  // 右键菜单
  rightClickMenu: {
    default: false,
    type: Boolean,
  },
  // 右键菜单 扩展
  rightClickMenuOptions: {
    type: Function as PropType<({ e, option }) => DropdownOption[]>,
  },
  // 空的情况
  slotEmpty: {
    default: false,
    type: Boolean,
  },
  // 使用 node all 节点
  isNodeAll: {
    default: false,
    type: Boolean,
  },
};
export interface ContextMenuItem {
  click: (rightClickItem: any) => void;
  icon?: string;
  name: string;
}
