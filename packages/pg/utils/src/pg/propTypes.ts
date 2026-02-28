import type { VueTypesInterface, VueTypeValidableDef } from 'vue-types';

import type { CSSProperties, VNodeChild } from 'vue';
import { createTypes } from 'vue-types';

export type VueNode = JSX.Element | VNodeChild;

type PropTypes = {
  readonly style: VueTypeValidableDef<CSSProperties>;
  readonly VNodeChild: VueTypeValidableDef<VueNode>;
} & VueTypesInterface;

const propTypes = createTypes({
  bool: undefined,
  func: undefined,
  integer: undefined,
  number: undefined,
  object: undefined,
  string: undefined,
}) as PropTypes;

propTypes.extend([
  {
    default: undefined,
    getter: true,
    name: 'style',
    type: [String, Object],
  },
  {
    getter: true,
    name: 'VNodeChild',
    type: undefined,
  },
]);
export { propTypes };
