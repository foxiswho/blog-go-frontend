<script setup lang="ts">
import type { RowVO } from '@pg/types';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import {IconifyIcon, Plus} from '@vben/icons';
import { useDataDictionaryStore } from '#/store';

import { MenuBadge } from '@vben-core/menu-ui';

import { VbenTableAction } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteIds, queryAll } from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import DrawerEditBatch from './components/DrawerEditBatch.vue';
import { columns } from './data';
import {ref} from "vue";

// 数据字典
const dataDictionaryStore = useDataDictionaryStore();
// 数据字典-加载
dataDictionaryStore.requestAllSet(['terminalCode']);
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
});
const [DrawerBatch, drawerApiBatch] = useVbenDrawer({
  connectedComponent: DrawerEditBatch,
});
const terminalCode = ref<string>('system');

/**
 * 编辑
 * @param row
 */
const onEdit = (row: RowVO) => {
  drawerApi
    .setData({
      // 表单值
      values: row,
      isUpdate: true,
    })
    .open();
};
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
 * 添加下级
 * @param row
 */
function onAppendBatch(row: any) {
  drawerApiBatch
    .setData({
      values: null,
      isUpdate: false,
      parent: row,
    })
    .open();
}/**
 * 添加下级
 * @param row
 */
function onAppendCopy(row: any) {
  drawerApi
    .setData({
      values: null,
      isUpdate: false,
      parent: null,
      copy: row,
      copyToChild: true,
    })
    .open();
}

/**
 * 创建
 */
function onCreate(row: any={}) {
  drawerApi
    .setData({
      values: null,
      isUpdate: false,
      copy: Object.assign({},row)
    })
    .open();
}

/**
 * 删除
 * @param row
 */
const onDelete = async (row: RowVO) => {
  deleteIds([row.id])
    .then(() => {
      onRefresh();
    })
    .catch(() => {
      onRefresh();
    });
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {},
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    loading: false,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      // showLoading: true,
      ajax: {
        query: async (_params) => {
          // 延迟加载，让页面先完成渲染再请求
          // await new Promise((resolve) => setTimeout(resolve, 2000));
          // gridApi.setLoading(true);
          try {
            return await queryAll({terminalCode:terminalCode.value});
          } finally {
            // gridApi.setLoading(false);
          }
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
  } as any,
});

/**
 * 重新加载
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
function onUpdateValue(tabName: string) {
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
          type="card" size="small" animated style="margin-top: -2px;"
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
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 shrink-0" v-if="row.type === 'button' || row.icon">
            <IconifyIcon
              v-if="row.type === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.icon"
              :icon="row.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ row.metaTitle ? row.metaTitle : row.name }}</span>
          <div class="items-center justify-end"></div>
        </div>
        <MenuBadge
          v-if="row.metaBadgeType"
          class="menu-badge"
          :badge="row.metaBadge"
          :badge-type="row.metaBadgeType"
          :badge-variants="row.metaBadgeVariants"
        />
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
              onClick: () => onCreate(row),
            },
            {
              tooltip: {
                content: '编辑',
              },
              icon: 'lucide:edit',
              onClick: () => onEdit(row),
            },

          ]"
          :dropdown-actions="[
            {
              text: '删除',
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: `确定删除 [${row.name}] 吗？`,
                confirm: () => onDelete(row),
              },
            },
            {
              text: '批量添加下级',
              onClick: () => onAppendBatch(row),
            },
            {
              text: '复制到下级',
              onClick: () => onAppendCopy(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
    <Drawer @ok="onRefresh" />
    <DrawerBatch @ok="onRefresh" />
  </Page>
</template>

<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}

:deep(.ajsMenu.n-tabs .n-tabs-nav.n-tabs-nav--top.n-tabs-nav--card-type .n-tabs-pad) {
  border-bottom: unset;
}
</style>
