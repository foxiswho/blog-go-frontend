<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
} from './api';
import DrawerEditTpl from './components/edit.vue';
import { columns, useGridFormSchema } from './data';

const currenData = ref<Recordable<any>>({});
// 当前字典类型编码，作为查询条件透传给接口
const typeCode = ref('');

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
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
            typeCode: typeCode.value,
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
    const formValues = await gridApi.formApi.getValues();
    gridApi.formApi.setLatestSubmissionValues(formValues);
    await gridQuery(formValues);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}

/**
 * 新增
 */
function onCreate() {
  drawerApi
    .setData({
      values: {},
      parent: currenData.value,
      isUpdate: false,
    })
    .open();
}

/**
 * 编辑
 * @param row 行数据
 */
function onEdit(row: any) {
  drawerApi
    .setData({
      values: row,
      parent: currenData.value,
      isUpdate: true,
    })
    .open();
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

const [DrawerList, drawerApiList] = useVbenDrawer({
  onCancel() {
    drawerApiList.close();
  },
  onConfirm: async () => {},
  onOpenChange(isOpen: boolean) {
    drawerApiList.setState({
      loading: true,
      confirmLoading: false,
      closeOnClickModal: false, // 点击遮罩关闭弹窗
      destroyOnClose: true, // 关闭时销毁
    });
    currenData.value = {};
    typeCode.value = '';
    if (isOpen) {
      const { values } = drawerApiList.getData<Record<string, any>>();
      console.log('values=', values);
      if (values) {
        currenData.value = values;
        typeCode.value = values.code;
      }
      drawerApiList.setState({
        title: `数据字典：${currenData.value.name} ( 码值：${currenData.value.code} )`,
        loading: false,
      });

      if (!currenData.value) {
        message.warning('你没有选择任何数据');
        setTimeout(() => {
          drawerApiList.close();
        }, 2000);
      }
    }
  },
  title: '',
});
</script>

<template>
  <DrawerList class="w-[1100px]">
    <Drawer @ok="onRefresh" />
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
                okText: '确认',
                cancelText: '取消',
                title: `确定删除 [${row.name}] 吗？`,
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </DrawerList>
</template>

<style scoped></style>
