<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { toRaw } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { GoTenantAccount } from '#/tools/router';

import Account from '../account/invoke/account.vue';
import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
} from './api';
import { columns, useGridFormSchema } from './data';
import drawerEdit from './modules/drawerEdit.vue';

const router = useRouter();

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: drawerEdit,
  destroyOnClose: true,
});

const [DrawerAccount, DrawerApiAccount] = useVbenDrawer({
  connectedComponent: Account,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await List({
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
  } as VxeTableGridOptions,
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
  const formValues = await gridApi.formApi.getValues();
  gridApi.formApi.setLatestSubmissionValues(formValues);
  gridQuery(formValues);
}

/**
 * 新增
 */
function onCreate() {
  drawerApi.setData({ values: {}, isUpdate: false }).open();
}

/**
 * 编辑
 * @param row 行数据
 */
function onEdit(row: any) {
  drawerApi.setData({ values: row, isUpdate: true }).open();
}

/**
 * 删除
 * @param row 行数据
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
    if (item.state === 1) {
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
 * 跳转租户账号
 * @param row 行数据
 */
function rowEventGoTenantAccount(row: any) {
  GoTenantAccount(router, { tenantNo: row.no });
}

/**
 * 添加创始人
 * @param row 行数据
 */
const rowEventFounder = (row: any) => {
  DrawerApiAccount.setData({
    parent: row,
    isUpdate: false,
  });
  DrawerApiAccount.open();
};

/**
 * 编辑创始人
 * @param row 行数据
 */
const rowEventFounderEdit = (row: any) => {
  DrawerApiAccount.setData({
    values: { id: row.founder },
    parent: row,
    isUpdate: true,
  });
  DrawerApiAccount.open();
};
</script>

<template>
  <Page auto-content-height>
    <Drawer @ok="onRefresh" />
    <DrawerAccount @ok="onRefresh" />
    <Grid>
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
          size="small"
          danger
          @click="onPhysicalDeletion"
        >
          物理删除
        </VbenButton>
      </template>
      <template #founderAll="{ row }">
        <div v-if="row.founder">
          <div>
            {{ row.founderName }} (
            <span
              class="text-blue-500 cursor-pointer"
              @click="rowEventGoTenantAccount(row)"
            >
              {{ row.founder }}
            </span>
            )
          </div>
        </div>
      </template>
      <template #operate="{ row }">
        <VbenTableAction
          :actions="[
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
  </Page>
</template>
