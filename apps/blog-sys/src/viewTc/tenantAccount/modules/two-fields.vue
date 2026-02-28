<script lang="ts" setup>
import { ref } from 'vue';
import { NInput, NSelect } from 'naive-ui';
import { selectPublicCountryCode } from '#/viewsBasic/country/api';

const emit = defineEmits(['blur', 'change']);
const dataArr = ref(['', '']);
const modelValue = defineModel<[string, string]>({
  default: () => ['', ''],
});
const options = ref([{ label: '中国 +86', value: '86' }]);
selectPublicCountryCode({}).then((d) => {
  //console.log('selectPublicCountryCode =>', d);
  if (d) {
    options.value = d;
  }
});

dataArr.value[0] = modelValue.value[0];
dataArr.value[1] = modelValue.value[1];
function onChange() {
  emit('change', dataArr.value);
}
function updateValue(opt) {
  modelValue.value[0] = opt;
  dataArr.value[0] = opt;
  emit('change', dataArr.value);
}
function updateValueInput(opt) {
  modelValue.value[1] = opt;
  dataArr.value[1] = opt;
  emit('change', dataArr.value);
}
</script>
<template>
  <div class="flex w-full gap-1">
    <NSelect
      v-model:value="modelValue[0]"
      class="w-[110px]"
      placeholder="区号"
      :class="{ 'valid-success': !!modelValue[0] }"
      :options="options"
      @update:value="updateValue"
    />
    <NInput
      placeholder="请输入11位手机号码"
      class="flex-1"
      clearable
      v-model:value="modelValue[1]"
      :maxlength="11"
      type="text"
      @change="onChange"
      @update:value="updateValueInput"
    />
  </div>
</template>
