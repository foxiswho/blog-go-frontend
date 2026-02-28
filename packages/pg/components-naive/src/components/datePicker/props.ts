import type { PropType } from 'vue';

import type { DatePickerProps } from 'naive-ui/lib/date-picker';

export const pgDatePickerPropsDefault: DatePickerProps = {
  formattedValue: {
    type: [String, Array] as PropType<[string, string] | string>,
  },
  // 是否是时间戳
  isTimestamp: {
    default: true,
    type: Boolean as PropType<boolean>,
  },
  shortcuts: {
    昨天: () => Date.now() - 24 * 60 * 60 * 1000,
  },
  type: 'datetime',
  // 值
  value: {
    type: [String, Number, Array] as PropType<
      [string, string] | string | number
    >,
  },
  valueFormat: 'yyyy-MM-dd HH:mm:ss',
};

export const pgDatePickerProps = {
  formattedValue: {
    type: [String, Array] as PropType<[string, string] | string>,
  },
  // 是否是时间戳
  isTimestamp: {
    default: true,
    type: Boolean as PropType<boolean>,
  },
  props: {
    default: pgDatePickerPropsDefault,
    type: Object as PropType<Partial<DatePickerProps>>,
  },
  // 值
  value: { type: [Number] as PropType<number> },
};
