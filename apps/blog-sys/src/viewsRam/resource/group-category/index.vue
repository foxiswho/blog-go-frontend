<script lang="ts" setup>
import type {
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { VbenTableAction } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { useDataDictionaryStore } from '#/store';
import { $t } from '#/locales';

import { deleteIds, queryAllCategory } from '../group/api';
import Form from './components/DrawerEdit.vue';
import { columns } from './data';
import {ref} from "vue";

// 数据字典
const dataDictionaryStore = useDataDictionaryStore();
// 数据字典-加载
dataDictionaryStore.requestAllSet(['terminalCode']);
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});
const terminalCode = ref<string>('system');

/**
 * 编辑
 * @param row
 */
function onEdit(row: any) {
  drawerApi.setData({ values: row, isUpdate: true }).open();
}

/**
 * 添加下级
 * @param row
 */
function onAppend(row: any) {
  drawerApi
    .setData({
      values: null,
      isUpdate: false,
      parent: row,
    })
    .open();
}
/**
 * 复制
 * @param row
 */
function onCopy(row: any) {
  drawerApi
    .setData({
      values: null,
      isUpdate: false,
      copy: row,
    })
    .open();
}
/**
 * 创建
 */
function onCreate() {
  drawerApi
    .setData({
      values: null,
      isUpdate: false,
    })
    .open();
}

/**
 * 删除
 * @param row
 */
function onDelete(row: any) {
  deleteIds([row.id])
    .then(() => {
      onRefresh();
    })
    .catch(() => {
      onRefresh();
    });
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {},
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          return await queryAllCategory({terminalCode:terminalCode.value});
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'parentNo',
      rowField: 'no',
      transform: true,
      expandAll: true,
      showLine: true,
    },
  } as VxeTableGridOptions,
});

/**
 * 刷新表格
 */
async function onRefresh() {
  gridApi.setLoading(true);
  try {
    await gridApi.query();
    await gridApi.grid.setAllTreeExpand(true);
  } finally {
    gridApi.setLoading(false);
  }
}
async function onUpdateValue(tabName: string) {
  console.log('onBeforeLeave=',tabName);
  if(terminalCode.value!=tabName) {
    terminalCode.value = tabName;
    onRefresh();
  }
}
</script>
<template>
  <Page auto-content-height content-class="p-2">
    <Grid>
      <template #toolbar-actions>
        <n-tabs
          type="card"
          size="small"
          animated
          style="margin-top: -2px;"
          class="ajsMenu"
          @update:value="onUpdateValue"
        >
          <template #prefix>
            终端类型
          </template>
          <n-tab v-for="item in dataDictionaryStore.get('terminalCode')" :name="item.value" :tab="item.label" />
        </n-tabs>
      </template>
      <template #toolbar-tools>
        <VbenButton
          class="pg-button-size-small"
          type="primary"
          @click="onCreate">
          <Plus class="size-5" />
          新增
        </VbenButton>
      </template>
      <template #operate="{ row }">
        <VbenTableAction
          :actions="[
            {
              tooltip: {
                content: '添加下级',
              },
              text: '添加下级',
              onClick: () => onAppend(row),
            },
            {
              tooltip: {
                content: '复制',
              },
              icon: 'lucide:copy',
              onClick: () => onCopy(row),
            },
            {
              tooltip: {
                content: '编辑',
              },
              icon: 'lucide:edit',
              onClick: () => onEdit(row),
            },
            {
              tooltip: {
                content: '删除',
              },
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: `确定删除 [${row.name}] 吗？`,
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
    <Drawer @ok="onRefresh" />
  </Page>
</template>
<style lang="scss" scoped>


:deep(.ajsMenu.n-tabs .n-tabs-nav.n-tabs-nav--top.n-tabs-nav--card-type .n-tabs-pad) {
  border-bottom: unset;
}
</style>
