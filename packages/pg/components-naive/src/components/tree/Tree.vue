<script lang="ts" setup>
import type { Recordable } from '@vben-core/typings';
import type { DropdownOption, TreeOption } from 'naive-ui';
import { NDropdown, NTree, NInput } from 'naive-ui';

import { computed, onMounted, ref, unref, watch } from 'vue';

import { isFunction } from '@vben/utils';

import { RiMore2Fill } from '@pg/icons';
import { getTreeAll, useNode } from '@pg/utils';
import { get } from 'xe-utils';

import { pgTreeSelectProps, pgTreeSelectPropsDefault } from './props';

const props = defineProps({
  ...pgTreeSelectProps,
});

const emit = defineEmits([
  'ok',
  'overload',
  'update:checked-keys',
  'update:selected-keys',
  'result:data',
]);

const treeData = ref<Recordable<any>[]>([]);
const treeIds = ref<string[]>([]);
const isFirstLoaded = ref<Boolean>(false);
const loading = ref(false);
const checkedAll = ref(false);
const selectedKeys = ref([]);

const pattern = ref('');
const showDropdownRef = ref(false);
const menuOptionsRef = ref<DropdownOption[]>([
  {
    key: '刷新',
    label: '刷新',
    props: {
      onClick: () => {
        handlerReload();
        emit('overload');
      },
    },
  },
  {
    key: '展开/收起',
    label: '展开/收起',
    props: {
      onClick: () => {
        expandAll();
      },
    },
  },
  {
    key: '取消/选择',
    label: '取消/选择',
    props: {
      onClick: () => {
        checkedAllHandle();
      },
    },
  },
]);
const optionsRef = ref<DropdownOption[]>([]);
const xRef = ref(0);
const yRef = ref(0);

const getAttrs = computed(() => {
  Object.keys(pgTreeSelectPropsDefault).forEach((key) => {
    if (!props.props.hasOwnProperty(key)) {
      // eslint-disable-next-line vue/no-mutating-props
      props.props[key] = pgTreeSelectPropsDefault[key];
    }
  });
  return {
    ...(props.api ? { options: unref(treeData) } : {}),
    ...props.props,
  };
});

const handleSelect = () => {
  showDropdownRef.value = false;
};
const handleClickOutside = () => {
  showDropdownRef.value = false;
};
const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick() {
      emit('ok', option);
    },
    onContextmenu(e: MouseEvent): void {
      // 开启右键菜单
      if (props.rightClickMenu) {
        if (
          props.rightClickMenuOptions &&
          isFunction(props.rightClickMenuOptions)
        ) {
          optionsRef.value = props.rightClickMenuOptions({ e, option });
        }
        showDropdownRef.value = true;
        xRef.value = e.clientX;
        yRef.value = e.clientY;
        // console.log(e.clientX, e.clientY)
        e.preventDefault();
      }
    },
  };
};
// 菜单
if (
  props.hasOwnProperty('menuDropdownOptions') &&
  Object.values(props.menuDropdownOptions).length > 0
) {
  props.menuDropdownOptions.forEach((item) => {
    menuOptionsRef.value.push(item);
  });
}
const afterFetchDefault = (result) => {
  return useNode({
    data: result,
    // key 字段名称
    keyField: 'id',
    // label 字段名称
    labelField: 'name',
  }).getTreeData;
};
const afterFetchDefaultNodeAll = (result) => {
  return useNode({
    data: result,
    // key 字段名称
    keyField: 'id',
    // label 字段名称
    labelField: 'label',
    isNodeAll: true,
  }).getTreeData;
};
/**
 * 读取树
 */
async function fetch() {
  const { afterFetch, api } = props;
  if (!api || !isFunction(api)) return;
  loading.value = true;
  treeData.value = [];
  treeIds.value = [];
  let result;
  try {
    result = await api(props.params);
  } catch (error) {
    console.error(error);
  }
  // console.log('result=>',result)
  if (props.isNodeAll) {
    result = await afterFetchDefaultNodeAll(result);
  } else if (afterFetch && isFunction(afterFetch)) {
    result = await afterFetch(result);
  } else {
    result = await afterFetchDefault(result);
  }
  // console.log('result',result)
  loading.value = false;
  if (!result) return;
  if (!Array.isArray(result)) {
    result = get(result, props.resultField);
  }
  // console.info('result=>', result);
  treeData.value = (result as Recordable<any>[]) || [];

  if (treeData.value && treeData.value.length > 0) {
    treeIds.value = getTreeAll(treeData.value);
  }
  if (!isFirstLoaded.value) {
    props.props.expandedKeys = treeIds.value as [];
  }
  isFirstLoaded.value = true;
  emit('result:data', treeData.value);
}

watch(
  () => props.params,
  () => {
    !unref(isFirstLoaded) && fetch();
  },
  { deep: true },
);
watch(
  () => props.reload,
  () => {
    if (props.reload) {
      handlerReload();
    }
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

/**
 * 刷新
 */
const handlerReload = () => {
  // if (props.props.checkedKeys) {
  //   props.props.checkedKeys = Array.isArray(props.props.checkedKeys)
  //     ? []
  //     : null;
  // }
  props.props.selectedKeys = undefined;
  emit('update:selected-keys', undefined);
  fetch();
};
function OnUpdateCheckedKeys(keys, meta) {
  props.props.checkedKeys = keys;
  emit('update:checked-keys', {
    keys,
    meta,
  });
}
/**
 * 展开全部
 */
const expandAll = () => {
  props.props.expandedKeys =
    props.props.expandedKeys && props.props.expandedKeys.length > 0
      ? []
      : (treeIds.value as []);
};
/**
 * 取消/全选
 */
function checkedAllHandle() {
  if (checkedAll.value) {
    props.props.checkedKeys = [];
    checkedAll.value = false;
  } else {
    props.props.checkedKeys = treeIds.value as [];
    checkedAll.value = true;
  }
}
const checkedKeysComputed = computed(() => {
  return props.props.checkedKeys;
});
const selectedKeysComputed = computed(() => {
  if (props.props?.selectedKeys) {
    return props.props.selectedKeys;
  }
  return selectedKeys.value;
});
/**
 * 全部
 */
function defaultAllHandle() {
  props.props.checkedKeys = [];
  selectedKeys.value = [];
  checkedAll.value = false;

  handlerReload();
  emit('overload');
}
</script>

<template>
  <div
    v-if="props.headerShow"
    :style="{ minHeight: `calc(100vh - 141px)` }"
    class="bg-background relative h-full overflow-hidden"
  >
    <div class="flex h-[34px] items-center">
      <n-input
        v-model:value="pattern"
        clearable
        placeholder="搜索"
        size="tiny"
      />
      <n-dropdown :options="menuOptionsRef" :show-arrow="true">
        <RiMore2Fill :size="29" />
      </n-dropdown>
    </div>
    <div
      class="flex h-[34px] cursor-pointer items-center"
      @click="defaultAllHandle"
    >
      全部
    </div>
    <n-tree
      @update:checked-keys="OnUpdateCheckedKeys"
      v-bind="getAttrs"
      :checked-keys="checkedKeysComputed"
      :data="treeData"
      :node-props="nodeProps"
      :pattern="pattern"
      :selected-keys="selectedKeysComputed"
    >
      <template v-if="props.slotEmpty" #empty>
        <slot name="empty"> </slot>
      </template>
    </n-tree>
    <n-dropdown
      :options="optionsRef"
      :show="showDropdownRef"
      :x="xRef"
      :y="yRef"
      placement="bottom-start"
      trigger="manual"
      @clickoutside="handleClickOutside"
      @select="handleSelect"
    />
  </div>
</template>
