import type { Recordable } from '@vben-core/typings';
import type { Fn } from '@vueuse/core';
import type { TreeSelectProps } from 'naive-ui/lib/tree-select';

import type { NodeField } from './type';

import type { PropType } from 'vue';

import { propTypes } from '@pg/utils';

export const pgTreeSelectPropsDefault: TreeSelectProps = {
  // 是否可清除
  clearable: true,
  // 默认展开全部
  defaultExpandAll: true,
  // key 字段名称
  keyField: 'key',
  // label 字段名称
  labelField: 'label',
  // 是否在选择器中显示选项路径
  showPath: true,
};

export const nodeFieldDefault: NodeField = {
  // key 字段名称
  keyField: 'key',
  // label 字段名称
  labelField: 'label',
  parentField: 'parentId',
  selectLast: false,
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
  // 转换 树
  convertNode: {
    default: true,
    type: Boolean,
  },
  // 转换 树 参数字段
  convertNodeField: {
    default: nodeFieldDefault,
    type: Object as PropType<Partial<NodeField>>,
  },
  // 异步查询
  filterQueryAsync: {
    default: false,
    type: Boolean,
  },
  // 立即
  immediate: {
    default: true,
    type: Boolean,
  },
  // 接口参数
  params: {
    default: {},
    type: Object,
  },
  props: {
    default: pgTreeSelectPropsDefault,
    type: Object as PropType<Partial<TreeSelectProps>>,
  },
  // 返回值
  resultField: propTypes.string.def(''),
  // 值
  value: { type: [Array, String] as PropType<[] | string> },
};
