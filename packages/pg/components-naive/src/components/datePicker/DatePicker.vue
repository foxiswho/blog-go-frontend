<script lang="ts" setup>
import { computed, unref, useAttrs } from 'vue';

import { pgDatePickerPropsDefault } from './props';

const props = defineProps({
  ...pgDatePickerPropsDefault,
});

const emit = defineEmits(['update:formattedValue', 'update:value']);

const attrs = useAttrs();

const getAttrs = computed(() => {
  return {
    ...unref(attrs),
    ...props,
    value: null,
  };
});
const formattedValue = computed(() => {
  return props.value;
});
const getValue = computed(() => props.value);
function onUpdateFormattedValue(value: any) {
  emit('update:formattedValue', value);
  emit('update:value', value);
}
function onUpdateValue(value: any) {
  emit('update:value', value);
}
</script>
<template>
  <n-date-picker
    v-if="!props.isTimestamp"
    v-bind="getAttrs"
    v-model:formatted-value="formattedValue"
    :value-format="props.valueFormat"
    @update:formatted-value="onUpdateFormattedValue"
  >
    <template v-for="item in Object.keys($slots)" :key="item" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
  </n-date-picker>
  <n-date-picker
    v-else
    v-bind="getAttrs"
    v-model:value="getValue"
    @update:value="onUpdateValue"
  >
    <template v-for="item in Object.keys($slots)" :key="item" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
  </n-date-picker>
</template>

<style scoped></style>
