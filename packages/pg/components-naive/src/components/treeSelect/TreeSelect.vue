<script lang="ts" setup>
import type { Recordable } from '@vben-core/typings';

import {
  computed,
  nextTick,
  onMounted,
  ref,
  unref,
  useAttrs,
  watch,
} from 'vue';

import { VbenButton } from '@vben/common-ui';
import { isFunction } from '@vben/utils';

import { type NodeProps, useNode } from '@pg/utils';
import { NTreeSelect } from 'naive-ui';
import { get } from 'xe-utils';

import {
  nodeFieldDefault,
  pgTreeSelectProps,
  pgTreeSelectPropsDefault,
} from './props';

const props = defineProps({
  ...pgTreeSelectProps,
});

const emit = defineEmits(['update:value', 'ok']);

const attrs = useAttrs();
// console.log('props-PgInput',props)
const treeData = ref<Recordable<any>[]>([]);
const isFirstLoaded = ref<Boolean>(false);
const loading = ref(false);
const treeSelect = ref(null);

const getAttrs = computed(() => {
  Object.keys(pgTreeSelectPropsDefault).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(props.props, key)) {
      // eslint-disable-next-line vue/no-mutating-props
      props.props[key] = pgTreeSelectPropsDefault[key];
    }
  });
  // 异步查询
  if (props.filterQueryAsync) {
    return {
      ...attrs,
      options: unref(treeData),
      ...props.props,
      filter,
    };
  }
  return {
    ...attrs,
    ...(props.api ? { options: unref(treeData) } : {}),
    ...props.props,
  };
});
// 上一次触发时间
const filterTime = ref(0);
const intervalTime = 2;
const filterWd = ref({});
const filterThis = ref('');
const filterResult = ref(0);
// 定时器 30秒 初始化 存储的字段
window.setInterval(() => {
  // console.log('filterWd.value',filterWd.value)
  filterWd.value = {};
  delete props.params.wd;
  // isFirstLoaded.value = false
}, 5000);
// 异步查询
const filter = (pattern: string, option) => {
  // console.log('pattern',pattern)
  props.params.wd = pattern;
  // console.log('props.params',props.params)
  const now = Date.now();

  if (filterTime.value == 0 || now - filterTime.value > intervalTime) {
    // 重置上一次点击时间，intervalTime是我自己设置的间隔时间，根据自己的需要传参
    filterTime.value = now;
    filterThis.value = pattern;
    if (!filterWd.value[pattern]) {
      filterWd.value[pattern] = 1;
    }
    //
    // console.log('treeData.value',treeData.value)
    if (filterWd.value[pattern] == 1) {
      fetch();

      // Object.keys(filterWd.value).forEach((key) => {
      //   if(!filterWd.value[key]){
      //     delete filterWd.value[key]
      //   }
      // })
    }
    // console.log('间隔大于intervalTime秒，触发方法',(now-filterTime.value));
    // //添加自己要调用的方法
    // console.log('now',now)
    // console.log('now',filterTime.value)
  } else {
    console.log('不触发');
  }
  // isFirstLoaded.value = false
  //
  return filterResult.value > 0;
};
// 清空查询，并重载
function handlerFilterClear() {
  filterWd.value = {};
  filterTime.value = 0;
  filterResult.value = 0;
  filterThis.value = '';
  delete props.params.wd;
  handlerReload();
}

const getMultiple = computed(() => {
  if (props.hasOwnProperty('props') && props.props.hasOwnProperty('multiple')) {
    return props.props.multiple;
  }
  return false;
});

const getValue = computed(() => {
  let multiple = false;
  if (props.props.hasOwnProperty('multiple')) {
    multiple = props.props.multiple;
  }
  if (!multiple) {
    return props?.value;
  }

  if (props?.value && !Array.isArray(props?.value)) {
    return props?.value.split(',');
  } else if (props?.value && Array.isArray(props?.value)) {
    return props?.value;
  }
  return [];
});

watch(
  () => props.params,
  () => {
    // console.log('watch。props.params',props.params)
    !unref(isFirstLoaded) && fetch();
  },
  { deep: true },
);

watch(
  () => props.immediate,
  (v) => {
    v && !isFirstLoaded.value && fetch();
  },
);

onMounted(() => {
  props.immediate && fetch();
});

async function fetch() {
  const { afterFetch, api, filterQueryAsync } = props;
  if (filterQueryAsync) {
    if (!filterWd.value[filterThis.value]) {
      filterWd.value[filterThis.value] = 1;
    }
    filterWd.value[filterThis.value]++;
  }
  if (!api || !isFunction(api)) return;
  loading.value = true;
  treeData.value = [];
  let result;
  try {
    result = await api(props.params);
  } catch (error) {
    console.error(error);
  }
  if (afterFetch && isFunction(afterFetch)) {
    result = afterFetch(result);
  }
  loading.value = false;
  if (!result) return;
  if (!Array.isArray(result)) {
    result = get(result, props.resultField);
  }
  if (props.convertNode) {
    const nodeParam: NodeProps = {
      data: undefined,
      keyField: '',
      labelField: '',
      parentField: '',
      selectLast: false,
    };
    nodeParam.data = result;
    if (props?.convertNodeField)
      Object.keys(props.convertNodeField).forEach((key) => {
        nodeParam[key] = props.convertNodeField[key];
      });
    Object.keys(nodeFieldDefault).forEach((key) => {
      if (!props.convertNodeField.hasOwnProperty(key)) {
        nodeParam[key] = nodeFieldDefault[key];
      }
    });
    if (nodeParam && Array.isArray(nodeParam.data)) {
      result = await useNode(nodeParam).getTreeData;
    }
  }
  treeData.value = (result as Recordable<any>[]) || [];
  isFirstLoaded.value = true;
  // emit('update:value', treeData.value);
  // 如果是异步查询，最后清空关键词
  if (filterQueryAsync) {
    // console.log('filterWd.value',filterWd.value)
    // console.log('filterQueryAsync.params',props.params)
    // console.log('filterQueryAsync.treeData.value',treeData.value)
    // delete props.params['wd']
    filterResult.value = treeData.value.length;
  }
}

/**
 * 刷新
 */
const handlerReload = () => {
  fetch();
};
const OnUpdateValue = (e, option, meta) => {
  // console.log('OnUpdateValue.e',e)
  // console.log('OnUpdateValue.opt',option)
  // console.log('OnUpdateValue.meta',meta)
  // console.log('OnUpdateValue.treeSelectRef1',treeSelect.value.$el)
  emit('update:value', e);
  nextTick(() => {
    // console.log('OnUpdateValue.treeSelectRef2',treeSelect.value.$el.getElementsByClassName('n-base-selection-input__content')[0].innerText)
    let text = '';
    if (treeSelect.value && treeSelect.value.$el) {
      const elIput = treeSelect.value.$el.querySelectorAll(
        '.n-base-selection-input__content',
      );
      const elSelection = treeSelect.value.$el.querySelectorAll(
        '.n-base-selection-overlay__wrapper',
      );
      // console.log('elIput',elSelection)
      if (elIput.length > 0) {
        text = elIput[0].innerText;
      } else if (elSelection.length > 0) {
        text = elSelection[0].innerText;
      }
    }
    emit('ok', { option, text, value: e });
  });
};
</script>
<template>
  <div class="" style="width: inherit">
    <n-tree-select
      ref="treeSelect"
      v-bind="getAttrs"
      :loading="loading"
      :multiple="getMultiple"
      :value="getValue"
      @update:value="OnUpdateValue"
    >
      <template v-for="item in Object.keys($slots)" :key="item" #[item]="data">
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
      <template #action>
        <slot name="action">
          <slot name="action_left"></slot>
          <n-button size="tiny" type="info" @click="handlerReload"
            >刷新</n-button
          >
          <n-button
            v-if="props.filterQueryAsync"
            size="tiny"
            type="info"
            @click="handlerFilterClear"
            class="ml-2"
          >
            清空查询
          </n-button>
          <slot name="action_right"></slot>
        </slot>
      </template>
    </n-tree-select>
  </div>
</template>

<style scoped></style>
