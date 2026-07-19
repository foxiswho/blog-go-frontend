<script setup lang="ts">
import { ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { message } from '#/adapter';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  batchSelectDelete,
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
} from '../api';
import { columns, useGridFormSchema } from './data';

const emit = defineEmits(['ok']);

const currenData = ref<Recordable<any>>({});

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
      pageSize: 100,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await List({
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            typeCode: currenData.value.code,
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
    if (isOpen) {
      const { values } = drawerApiList.getData<Record<string, any>>();
      if (values) {
        currenData.value = values;
        drawerApiList.setState({ loading: false });
        gridQuery();
      }
      drawerApiList.setState({
        title: `事件选择`,
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
    <div class="h-full p-2">
      <Grid>
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
            物理删除
          </VbenButton>
          <VbenButton
            class="ml-2 pg-button-size-small"
            danger
            @click="onBatchDelete"
          >
            删除
          </VbenButton>
        </template>
      </Grid>
    </div>
  </DrawerList>
</template>

<style scoped></style>
