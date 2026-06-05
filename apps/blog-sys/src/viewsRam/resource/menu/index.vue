<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useVbenDrawer } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';

import { selectNodeAll } from './api';
import DrawerEditTpl from './components/DrawerEdit.vue';
import TabForm from './components/TabForm.vue';
import TabRule from './components/TabRule.vue';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTree = ref(false);
const reloadTreeComputed = computed(() => reloadTree.value);
onMounted(() => {});

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
};
/**
 * 重新加载
 */
function reloadTable() {
  reloadTree.value = true;
  setTimeout(() => {
    reloadTree.value = true;
  }, 2000);
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {};
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
});
/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = (opt: any) => {
  return [
    {
      label: '添加下级',
      key: '添加下级',
      props: {
        onClick: () => {
          drawerApi.setData({
            // 表单值
            values: {},
            parent: opt?.option?.data,
            isUpdate: false,
          });
          drawerApi.open();
        },
      },
    },
  ];
};
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [
  {
    label: '添加',
    key: '添加',
    props: {
      onClick: () => {
        drawerApi.setData({
          // 表单值
          values: {},
          isUpdate: false,
        });
        drawerApi.open();
      },
    },
  },
];
</script>

<template>
  <NLayout class="h-full p-2 w-[300px]" has-sider>
    <PgTree
      :api="selectNodeAll"
      :is-node-all="true"
      :menu-dropdown-options="menuDropdownOptions"
      :reload="reloadTreeComputed"
      :right-click-menu="true"
      :right-click-menu-options="rightClickMenuOptions"
      @ok="treeChang"
      @overload="treeOverload"
    />
    <Drawer @ok="reloadTable" />
  </NLayout>
</template>

<style scoped></style>
