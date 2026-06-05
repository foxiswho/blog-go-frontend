import type { CSSProperties, VNodeChild } from 'vue';
import type { VueTypesInterface, VueTypeValidableDef } from 'vue-types';

import { createTypes } from 'vue-types';
import type { JSX } from 'vue/jsx-runtime';

export type VueNode = JSX.Element | VNodeChild;

// 自定义 style 校验器
const styleValidator = (value: any): value is CSSProperties => {
  return (
    typeof value === 'string' || (value !== null && typeof value === 'object')
  );
};

// 自定义 VNodeChild 校验器（总是通过，因为VNode类型较复杂）
const vnodeChildValidator = (): boolean => {
  return true;
};

type PropTypes = VueTypesInterface & {
  readonly style: VueTypeValidableDef<CSSProperties>;
  readonly VNodeChild: VueTypeValidableDef<VueNode>;
};

// 创建基础类型集合，并通过对象展开添加自定义校验器
const baseTypes = createTypes({
  bool: undefined,
  func: undefined,
  integer: undefined,
  number: undefined,
  object: undefined,
  string: undefined,
}) as VueTypesInterface;

// ES6+ 方式：直接构建包含自定义类型的对象
const propTypes = {
  ...baseTypes,
  style: (): VueTypeValidableDef<CSSProperties> => ({
    type: [String, Object],
    validator: styleValidator,
    __type: 'style', // 可选，便于识别
  }),
  VNodeChild: (): VueTypeValidableDef<VueNode> => ({
    validator: vnodeChildValidator,
    __type: 'VNodeChild',
  }),
} as unknown as PropTypes;

export { propTypes };
