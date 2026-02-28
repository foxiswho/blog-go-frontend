<script lang="ts" setup>
import type { RadioGroupOptions } from './typing';

interface Props {
  options: RadioGroupOptions[];
  // 值
  value: number | string | boolean;
}
const props = withDefaults(defineProps<Props>(), {
  // eslint-disable-next-line vue/require-valid-default-prop
  options: [],
});
const emit = defineEmits(['update:value', 'ok', 'update:checked']);

const OnUpdateValue = (e, option, meta) => {
  emit('update:value', e);
  emit('ok', e);
};

const OnUpdateChecked = (e, option, meta) => {
  emit('update:checked', e);
  emit('ok', e);
};
</script>
<template>
  <NRadioGroup
    v-bind="$attrs"
    @update:checked="OnUpdateChecked"
    @update:value="OnUpdateValue"
  >
    <template v-for="item in Object.keys($slots)" :key="item" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
    <template v-for="item in props.options" :key="`${item.value}`">
      <NRadioButton
        v-if="$attrs.type === 'button'"
        v-model:value="item.value"
        v-bind="item"
        :class="{ 'n-radio-button--checked': item.value === props.value }"
      >
        {{ item.label }}
      </NRadioButton>
      <NRadio v-else v-model:value="item.value" v-bind="item">
        {{ item.label }}
      </NRadio>
    </template>
  </NRadioGroup>
</template>

<style scoped></style>
