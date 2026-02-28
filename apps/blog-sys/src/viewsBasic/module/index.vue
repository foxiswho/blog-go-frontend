<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useVbenDrawer } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';

import { selectPublic } from './api';
import Edit from './components/edit.vue';
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
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Edit,
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
          formDrawerApi.setData({
            // 表单值
            values: {},
            parent: opt?.data,
            isUpdate: false,
          });
          formDrawerApi.open();
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
        formDrawerApi.setData({
          // 表单值
          values: {},
          isUpdate: false,
        });
        formDrawerApi.open();
      },
    },
  },
];
</script>

<template>
  <NLayout class="h-full p-2" has-sider>
    <NLayoutSider class="min-w-[200px]">
      <PgTree
        :api="selectPublic"
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
            <TabForm :data="currenData" @ok="reloadTable" :is-update="true" />
          </n-tab-pane>
        </n-tabs>
        <div v-else style="padding-top: 40px">
          <n-empty description="尚未选择" />
        </div>
      </NLayoutContent>
    </NLayout>
    <FormDrawer @ok="reloadTable" />
  </NLayout>
</template>

<style scoped></style>
