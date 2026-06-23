<script setup lang="ts">
import type { RowVO } from '@pg/types';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { VbenTableAction } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteIds, queryAll } from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns } from './data';

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
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <VbenButton type="primary" @click="onCreate">
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
    <Drawer @success="refreshGrid" />
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
