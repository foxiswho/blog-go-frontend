<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { PgTree } from '@pg/components-n';
import { stateYesNoOption } from '@pg/types';
import { useDataDictionaryStore } from '#/store';

import { dialog, message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectDelete,
  batchSelectRecovery,
  deleteIds,
  List,
  selectCategory,
} from './api';

import Category from './components/category.vue';
import Edit from './components/DrawerEdit.vue';
import DrawerEditBatchTpl from './components/DrawerEditBatch.vue';
import { columns } from './data';
import {MdiTickCircle} from "@pg/icons";

// 数据字典
const dataDictionaryStore = useDataDictionaryStore();
// 数据字典-加载
dataDictionaryStore.requestAllSet(['terminalCode']);
//
const terminalCode = ref<string>('system');
const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const selectTitle = ref<string>('');

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record.data;
  gridApi.formApi.setFieldValue('parentNo', record.key);
  selectTitle.value = `${currenData.value.name}`;
  onRefresh();
};
/**
 * 重新加载
 */
function reloadTree() {
  reloadTreeState.value++;
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (_e: any) => {
  gridApi.formApi.setFieldValue('parentNo', null);
  onRefresh();
};

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Edit,
});
const [DrawerBatch, drawerApiBatch] = useVbenDrawer({
  connectedComponent: DrawerEditBatchTpl,
});

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Category,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    commonConfig: {
      labelWidth: 50,
      // 所有表单项
      componentProps: {
        class: 'w-full',
      },
    },
    schema: [
      {
        fieldName: 'terminalCode',
        label: 'terminalCode',
        defaultValue: 'system',
        component: 'Input',
        componentProps: {},
        dependencies: {
          show: false,
          triggerFields: ['wd'],
        },
      },
      {
        fieldName: 'parentNo',
        label: '隐藏',
        defaultValue: null,
        component: 'Input',
        componentProps: {},
        dependencies: {
          show: false,
          triggerFields: ['wd'],
        },
      },
      {
        component: 'Input',
        fieldName: 'wd',
        label: '关键词',
      },
      {
        fieldName: 'state',
        label: '状态',
        component: 'Select',
        componentProps: {
          clearable: true,
          options: stateYesNoOption,
        },
      },
    ],
    submitOnChange: false,
  },
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    cellConfig: {},
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
      refresh: true,
      zoom: true,
      search: true,
    },
    layouts: [
      ['Top', 'Form'],
      ['Toolbar','Table', 'Pager'],
      ['Bottom']
    ],
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
 * 新增
 */
function onCreate() {
  formDrawerApi
    .setData({
      values: {},
      parent: currenData.value,
      isUpdate: false,
      terminalCode: terminalCode.value,
    })
    .open();
}
/**
 * 新增批量
 */
function onCreateBatch() {
  drawerApiBatch
    .setData({
      values: {},
      parent: currenData.value,
      isUpdate: false,
      terminalCode: terminalCode.value,
    })
    .open();
}

/**
 * 编辑
 * @param row 行数据
 */
function onEdit(row: any) {
  formDrawerApi.setData({ values: row, isUpdate: true }).open();
}
/**
 * 复制
 * @param row 行数据
 */
function onCopy(row: any) {
  formDrawerApi.setData({ values: null,copy:row, isUpdate: false }).open();
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
  batchSelectRecovery(
    ids,
    () => {
      onRefresh();
      $grid.setAllCheckboxRow(false);
    },
  );
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
  batchSelectDelete(
    ids,
    () => {
      onRefresh();
      $grid.setAllCheckboxRow(false);
    },
  );
}
function treeAfterFetch(data:any) {
  console.log('treeAfterFetch',data);
  if(data) {
    for(var i in data) {
      if(!data[i].parentId) {
        data[i].label = data[i].label + (data[i]?.data&&data[i]?.data?.terminalCodeName?(' [ '+data[i]?.data?.terminalCodeName+' ]'):'');
      }
    }
  }
  return data;
}

async function onUpdateValue(tabName: string) {
  console.log('onBeforeLeave=',tabName);
  if(terminalCode.value!=tabName) {
    terminalCode.value = tabName;
    gridApi.formApi.setFieldValue('terminalCode', tabName);
    reloadTreeState.value++;
    selectTitle.value = '';
    onRefresh();
  }
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <div class="flex size-full">
      <NCard
        class="min-w-[290px]"
        style="width: unset"
        content-style="padding-left:10px;padding-right:10px;padding-top:10px;"
      >
        <PgTree
          :key="reloadTreeState"
          :api="selectCategory"
          :params="{terminalCode:terminalCode}"
          :after-fetch="treeAfterFetch"
          :is-node-all="true"
          :reload="reloadTreeComputed"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </NCard>
      <div class="w-[calc(100%-290px)] ml-2 pl-2 bg-card rounded-md">
        <Grid>
          <template #top>
            <n-tabs
              type="card"
              size="small"
              animated
              style="margin-top: -2px;"
              class="ajsMenu"
              @update:value="onUpdateValue"
            >
              <template #prefix>
                终端类型
              </template>
              <template #suffix>
                <div v-show="selectTitle" class="ml-2 flex items-center">
                  <MdiTickCircle class="size-7 text-green-500" />
                  <n-tag type="success" class="ml-2">
                    {{ selectTitle }}
                  </n-tag>
                </div>
              </template>
              <n-tab v-for="item in dataDictionaryStore.get('terminalCode')" :name="item.value" :tab="item.label" />
            </n-tabs>
          </template>
          <template #toolbar-actions>
            <VbenButton
              type="primary"
              class="pg-button-size-small"
              @click="onCreate"
            >
              <Plus class="size-5" />
              新增
            </VbenButton>
            <VbenButton
              class="pg-button-size-small m-2"
              @click="onCreateBatch"
            >
              新增批量
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
            <!-- <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onRecovery"
            >
              删除恢复
            </VbenButton>-->
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              danger
              @click="onBatchDelete"
            >
              删除
            </VbenButton>
          </template>
          <template #operate="{ row }">
            <VbenTableAction
              :actions="[
                {
                  tooltip: {
                    content: '复制',
                  },
                  icon: 'lucide:copy',
                  onClick: () => onCopy(row),
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
                    title: `确定删除 ${row.name} 吗？`,
                    confirm: () => onDelete(row),
                  },
                },
              ]"
              align="center"
            />
          </template>
        </Grid>
      </div>
    </div>
    <FormDrawer @ok="onRefresh" />
    <DrawerBatch @ok="onRefresh" />
    <FormModal @ok="reloadTree" />
  </Page>
</template>

<style scoped>
:deep(.n-tree) {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
:deep(.ajsMenu.n-tabs .n-tabs-nav > .n-tabs-nav-scroll-wrapper) {
  flex: 0 0 auto;
}
:deep(.ajsMenu.n-tabs .n-tabs-nav > .n-tabs-nav__suffix) {
  flex: 1 1 auto;
  padding-left: 0;
}
</style>
