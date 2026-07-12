<script setup lang="ts">
import type { RowVO } from '@pg/types';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import {IconifyIcon, Plus} from '@vben/icons';

import { VbenTableAction } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { MenuBadge } from '@vben-core/menu-ui';

import { deleteIds, queryAll } from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns } from './data';
import {$t} from "@vben/locales";

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
});

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
const onDelete = async (row: RowVO) => {
  deleteIds([row.id])
    .then(() => {
      refreshGrid();
    })
    .catch(() => {
      refreshGrid();
    });
};

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
          return await queryAll({});
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
function refreshGrid() {
  gridApi.query({});
}
</script>
<template>
  <Page auto-content-height content-class="p-2">
    <Grid>
      <template #toolbar-tools>
        <VbenButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增
        </VbenButton>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 shrink-0" v-if="row.type === 'button'||row.icon">
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
          <span class="flex-auto">{{ row.metaTitle?row.metaTitle:row.name}}</span>
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
    <Drawer @ok="refreshGrid" />
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
</style>
