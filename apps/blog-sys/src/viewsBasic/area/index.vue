<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  queryAll,
} from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import {columns} from './data';

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    rowConfig: {
      keyField: 'id',
      isHover: true,
      isCurrent: true,
    },
    treeConfig: {
      parentField: 'parentNo',
      rowField: 'no',
      transform: true,
      expandAll: true,
      showLine: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    checkboxConfig: {
      highlight: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await queryAll({
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            ...formValues,
          });
        },
      },
    },
    pagerConfig: {
      enabled: false,
    },
  } as any,
});

/**
 * 重新查询
 */
async function gridQuery(params: Record<string, any> = {}) {
  try {
    gridApi.query(params);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}

/**
 * 刷新表格
 */
async function onRefresh() {
  try {
    const formValues = await gridApi.formApi.getValues();
    gridApi.formApi.setLatestSubmissionValues(formValues);
    gridQuery(formValues);
    setTimeout(() => {
      const $grid = gridApi.grid;
      if ($grid) {
        $grid.setAllTreeExpand(true);
      }
    }, 900);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}

/**
 * 新增
 */
function onCreate() {
  drawerApi.setData({ values: {}, isUpdate: false }).open();
}

/**
 * 新增下级
 */
function onCreateChild(row: any) {
  drawerApi.setData({ parent: row || {}, values: {}, isUpdate: false }).open();
}

/**
 * 编辑
 */
function onEdit(row: any) {
  drawerApi.setData({ values: row, isUpdate: true }).open();
}

/**
 * 删除
 */
function onDelete(row: any) {
  deleteIds([row.id]).then(() => {
    onRefresh();
  });
}

/**
 * 批量有效
 */
function onBatchEnable() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    if (item.state === 2) {
      ids.push(item.id);
    } else {
      $grid.setCheckboxRow(item, false);
    }
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectEnable(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 批量停用
 */
function onBatchDisable() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    if (item.state == 1) {
      ids.push(item.id);
    } else {
      $grid.setCheckboxRow(item, false);
    }
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectDisable(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 删除恢复
 */
function onRecovery() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    if (item.state > 10) {
      ids.push(item.id);
    } else {
      $grid.setCheckboxRow(item, false);
    }
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectRecovery(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 物理删除
 */
function onPhysicalDeletion() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    if (item.state > 10) {
      ids.push(item.id);
    } else {
      $grid.setCheckboxRow(item, false);
    }
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectPhysicalDeletion(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 右键菜单事件
 */
function onMenuClick({ menu, row, column }) {
  const $grid = gridApi.grid;
  if (!$grid) return;
  switch (menu.code) {
    case 'expand': {
      $grid.setTreeExpand(row, true);
      break;
    }
    case 'contract': {
      $grid.setTreeExpand(row, false);
      break;
    }
    case 'create': {
      onCreateChild(row);
      break;
    }
  }
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <Drawer @ok="onRefresh" />
    <Grid @menu-click="onMenuClick">
      <template #toolbar-actions>
        <VbenButton
          type="primary"
          class="pg-button-size-small"
          @click="onCreate"
        >
          <Plus class="size-5" />
          新增
        </VbenButton>
      </template>
      <template #toolbar-tools>
        <VbenButton
          class="ml-2 pg-button-size-small"
          size="sm"
          @click="onBatchEnable"
        >
          批量有效
        </VbenButton>
        <VbenButton
          class="ml-2 pg-button-size-small"
          size="sm"
          @click="onBatchDisable"
        >
          批量停用
        </VbenButton>
        <VbenButton
          class="ml-2 pg-button-size-small"
          size="sm"
          @click="onRecovery"
        >
          删除恢复
        </VbenButton>
        <VbenButton
          class="ml-2 pg-button-size-small"
          size="sm"
          danger
          @click="onPhysicalDeletion"
        >
          物理删除
        </VbenButton>
      </template>
      <template #operate="{ row }">
        <VbenTableAction
          :actions="[
            {
              tooltip: { content: '新增下级' },
              icon: 'lucide:plus',
              onClick: () => onCreateChild(row),
            },
            {
              tooltip: { content: '编辑' },
              icon: 'lucide:edit',
              onClick: () => onEdit(row),
            },
            {
              tooltip: { content: '删除' },
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: `确定删除 [${row.label}] 吗？`,
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
