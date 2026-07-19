<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import ModalEditTpl from './invoke/ModalEdit.vue';
import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
} from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns, useGridFormSchema } from './data';

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
  destroyOnClose: true,
});

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ModalEditTpl,
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
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    sortConfig: {
      trigger: 'cell',
      remote: true,
    },
    filterConfig: {
      remote: true,
    },
    pagerConfig: {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      sort: true,
      filter: true,
      response: {
        result: 'data',
        total: 'total',
      },
      ajax: {
        query: async ({ page, sorts, filters }, formValues) => {
          const queryParams: any = { ...formValues };
          const firstSort = sorts?.[0];
          if (firstSort) {
            queryParams.sort = firstSort.field;
            queryParams.order = firstSort.order;
          }
          if (filters) {
            filters.forEach(({ field, values }: any) => {
              queryParams[field] = values.join(',');
            });
          }
          queryParams.pageSize = page.pageSize;
          queryParams.pageNum = page.currentPage;
          return await List(queryParams);
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    checkboxConfig: {
      labelField: 'id',
      reserve: true,
      highlight: true,
      range: true,
    },
  } as VxeTableGridOptions,
});

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
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
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
function onBatchPhysicalDeletion() {
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
 * 添加文章到话题
 */
function onAddArticle() {
  modalApi
    .setData({
      values: {},
      isUpdate: false,
    })
    .open();
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <Drawer @ok="onRefresh" />
    <Modal @ok="onRefresh" />
    <Grid>
      <template #toolbar-actions>
        <VbenButton
          type="primary"
          class="pg-button-size-small"
          @click="onAddArticle"
        >
          <Plus class="size-5" />
          添加文章
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
          @click="onBatchPhysicalDeletion"
        >
          物理删除
        </VbenButton>
      </template>
      <template #operate="{ row }">
        <VbenTableAction
          :actions="[
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
                title: `确定删除 [${row.name}] 吗？`,
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
      <template #nameAll="{ row }">
        <div>
          <h2 class="text-3xl font-medium">{{ row.name }}</h2>
        </div>
        <div>
          {{ row.description }}
        </div>
      </template>
      <template #expandContent="{ row }">
        <dl class="expandContent m-2">
          <dd class="title">
            <n-tag
              v-if="row.typeContent === 'original'"
              type="success"
              size="small"
            >
              原
            </n-tag>
            <n-tag
              v-if="row.typeContent === 'repost'"
              type="error"
              size="small"
            >
              转
            </n-tag>
            <n-tag
              v-if="row.typeContent === 'translation'"
              type="error"
              size="small"
            >
              译
            </n-tag>

            <n-tag
              v-if="row.typeReading === 'unread'"
              size="small"
              class="mt-2"
            >
              未读
            </n-tag>
            <n-tag
              v-if="row.typeReading === 'warning'"
              type="info"
              size="small"
              class="mt-2"
            >
              读中
            </n-tag>
            <n-tag
              v-if="row.typeReading === 'completed'"
              type="info"
              size="small"
              class="mt-2"
            >
              已读
            </n-tag>
          </dd>
          <dd class="content">
            <n-grid x-gap="12" :cols="1" class="ml-2">
              <n-gi> 标签：{{ row.tags }} </n-gi>
              <n-gi> 操作时间：{{ row.operationTime }} </n-gi>
            </n-grid>
          </dd>
        </dl>
      </template>
    </Grid>
  </Page>
</template>

<style scoped>
.grid2 .vxe-tools--wrapper {
  margin-right: 0.8em;
}
.goods,
.goods dd {
  padding: 0px;
  margin: 0px;
}
.goods {
  display: flex;
}
.goods .image {
  margin-right: 10px;
}
dl.expandContent {
  display: flex;
}
dl.expandContent dd {
  padding: 0px;
  margin: 0px;
}
dl.expandContent dd.content {
  width: 100%;
}
dl.expandContent dd.title {
  flex: 0 0 60px;
  text-align: center;
  border-right: 1px solid #dbd4d4;
}
</style>
