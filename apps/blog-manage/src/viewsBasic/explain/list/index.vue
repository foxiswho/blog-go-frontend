<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import { PgTree } from '@pg/components-n';

import { selectPublic } from '../category/api';
import {
  batchSelectDelete,
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  List,
} from './api';
import Edit from './components/edit.vue';
import { columns, useGridFormSchema } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const categoryId = ref('');

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record?.data;
  categoryId.value = record.key;
  gridQuery();
};
/**
 * 重新加载
 */
function reloadTree() {
  reloadTreeState.value = true;
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {
  currenRecord.value = false;
  currenData.value = {};
  categoryId.value = '';
  gridQuery();
};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Edit,
  destroyOnClose: true,
});

/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [];

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
      pageSize: 9999,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await List({
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            categoryId: categoryId.value,
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
  } as any,
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
 * 创建
 */
function onCreate() {
  formDrawerApi.setData({
    values: {},
    parent: currenData.value,
    isUpdate: false,
  }).open();
}

/**
 * 删除
 */
function onDelete(row: any) {
  batchSelectPhysicalDeletion([row.id], () => {
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
 * 批量物理删除
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
    ids.push(item.id);
    $grid.setCheckboxRow(item, false);
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
 * 删除
 */
function onBatchDelete() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    ids.push(item.id);
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectDelete(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [];
};
</script>

<template>
  <div>
    <NLayout class="h-full p-2" has-sider>
      <NLayoutSider class="min-w-[160px]" width="160">
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
      <NLayout class="w-[calc(100%-160px)]">
        <NLayoutContent>
          <Grid>
            <template #toolbar-actions>
              <VbenButton
                type="primary"
                class="pg-button-size-small"
                @click="onCreate"
              >
                <Plus class="size-5" />
                创建
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
                @click="onPhysicalDeletion"
              >
                批量物理删除
              </VbenButton>
              <VbenButton
                class="ml-2 pg-button-size-small"
                danger
                @click="onBatchDelete"
              >
                删除
              </VbenButton>
            </template>
            <template #nameAll="{ row }">
              <div>
                {{ row.name }}
              </div>
              <div>
                {{ row.path }}
              </div>
            </template>
            <template #operate="{ row }">
              <VbenTableAction
                :actions="[
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
          </Grid>
        </NLayoutContent>
      </NLayout>
      <FormDrawer @ok="onRefresh" />
    </NLayout>
  </div>
</template>

<style scoped></style>
