<script lang="ts" setup>
import { ref, watch } from 'vue';

import { type ContextMenuItem } from './props';

interface Props {
  menuItems: ContextMenuItem[];
}

const props = defineProps<Props>();
const visible = ref(false);
const rightClickItem = ref(null);
const position = ref({
  top: 0,
  left: 0,
});

const openMenu = (e: MouseEvent, item: any, node: any) => {
  const menuCount = props.menuItems.length;
  const windowHeight = window.innerHeight;
  visible.value = true;
  // position.value.top = Math.min(e.pageY, windowHeight - 40 - menuCount * 32);
  position.value.top = e.pageY;
  position.value.left = e.pageX;
  rightClickItem.value = { event: e, item: item, node: node };
};

const closeMenu = () => {
  visible.value = false;
};

watch(visible, () => {
  if (visible.value) {
    document.body.addEventListener('click', closeMenu);
  } else {
    document.body.removeEventListener('click', closeMenu);
  }
});

defineExpose({ openMenu, closeMenu });
</script>
<template>
  <div
    v-show="visible"
    :style="{
      left: `${position.left}px`,
      top: `${position.top}px`,
      display: visible ? 'block' : 'none',
    }"
    class="context-menu"
  >
    <div
      v-for="(item, i) in menuItems"
      :key="i"
      class="menu-item"
      @click="item.click(rightClickItem)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<style scoped lang="less">
.context-menu {
  margin: 0;
  background: #fff;
  z-index: 2;
  position: fixed;
  list-style-type: none;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.3);

  .menu-item {
    padding: 0 15px;
    height: 32px;
    line-height: 32px;
    color: rgb(29, 33, 41);
    cursor: pointer;
  }
  .menu-item:hover {
    background: var(--el-color-primary-light-9);
    border-radius: 4px;
  }
}
</style>
