// eslint-disable-next-line n/no-extraneous-import
import type { ComputedRef, Ref } from 'vue';

export type DynamicProps<T> = {
  [P in keyof T]: ComputedRef<T[P]> | Ref<T[P]> | T[P];
};
