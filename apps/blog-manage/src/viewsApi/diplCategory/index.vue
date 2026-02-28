<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useVbenDrawer } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';

import { selectNodeAllPublic } from './api';
import DrawerEditTpl from './components/drawerEdit.vue';
import TabForm from './components/TabForm.vue';

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
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {};
const [DrawerEdit, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
});
/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = (opt) => {
  return [
    {
      label: '添加下级',
      key: '添加下级',
      props: {
        onClick: () => {
          drawerApi.setData({
            // 表单值
            values: {},
            parent: opt?.option.data,
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
  <NLayout class="h-full p-2" has-sider>
    <NLayoutSider class="min-w-[200px]">
      <PgTree
        :api="selectNodeAllPublic"
        :is-node-all="true"
        :menu-dropdown-options="menuDropdownOptions"
        :reload="reloadTreeComputed"
        :right-click-menu="true"
        :right-click-menu-options="rightClickMenuOptions"
        @ok="treeChang"
        @overload="treeOverload"
      />
    </NLayoutSider>
    <NLayout class="w-[calc(100%-200px)]">
      <NLayoutContent>
        <n-tabs v-if="currenRecord" animated type="line">
          <n-tab-pane name="基本信息" tab="基本信息">
            <TabForm :data="currenData" :is-update="true" @ok="reloadTable" />
          </n-tab-pane>
          <n-tab-pane name="其他" tab="其他"> </n-tab-pane>
        </n-tabs>
        <div v-else style="padding-top: 40px">
          <n-empty description="尚未选择" />
        </div>
      </NLayoutContent>
    </NLayout>
    <DrawerEdit @ok="reloadTable" />
  </NLayout>
</template>

<style scoped></style>
