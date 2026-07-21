<script lang="ts" setup>

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { VbenTableAction } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteIds, queryAll } from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns } from './data';

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {},
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
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
      showRootLine: true,
    },
  } as any,
});

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
/**
 * 重新查询
 */
async function gridQuery(params: Record<string, any> = {}) {
  try {
    await gridApi.query(params);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}
/**
 * 刷新表格
 */
async function onRefresh() {
  try {
    if (gridApi.state?.formOptions) {
      const formValues = await gridApi.formApi.getValues();
      gridApi.formApi.setLatestSubmissionValues(formValues);
      await gridQuery(formValues);
    } else {
      await gridQuery();
    }
    setTimeout(() => {
      gridApi.grid.setAllTreeExpand(true);
    }, 900);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}
</script>
<template>
  <Page auto-content-height content-class="p-2">
    <Grid>
      <template #toolbar-actions>
        <VbenButton
          type="primary"
          size="sm"
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
