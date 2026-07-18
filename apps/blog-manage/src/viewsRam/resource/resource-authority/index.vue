<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { selectPublic } from '#/viewsRam/resource/group/api';

import Category from '../group/components/category.vue';
import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
} from './api';
import Edit from './components/edit.vue';
import { columns } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const tabSelectActive = ref('system');
const reloadTreeComputed = computed(() => reloadTreeState.value);

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record;
  gridApi.formApi.setFieldValue('parentId', record.key);
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
  currenRecord.value = false;
  currenData.value = {};
  gridApi.formApi.setFieldValue('parentId', null);
  onRefresh();
};

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Edit,
  destroyOnClose: true,
});

const [FormModal, formModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: Category,
});
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [
  {
    label: '添加',
    key: '添加',
    props: {
      onClick: () => {
        formModalApi.setData({
          // 表单值
          values: {},
          isUpdate: false,
        });
        formModalApi.open();
      },
    },
  },
];

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    commonConfig: {
      labelWidth: 50,
      componentProps: {
        class: 'w-full',
      },
    },
    schema: [
      {
        fieldName: 'parentId',
        label: '隐藏',
        defaultValue: '',
        component: 'Input',
        componentProps: {},
        dependencies: {
          show: false,
          triggerFields: ['wd'],
        },
      },
      {
        fieldName: 'wd',
        label: '关键词',
        component: 'Input',
        componentProps: { placeholder: '请输入', clearable: true },
      },
      {
        fieldName: 'state',
        label: '状态',
        component: 'Select',
        componentProps: {
          clearable: true,
          options: [
            { label: '停用', value: '2' },
            { label: '有效', value: '1' },
            { label: '弃置', value: '12' },
            { label: '取消', value: '11' },
          ],
        },
      },
    ],
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
      isCurrent: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
      search: true,
    },
    checkboxConfig: {
      highlight: true,
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
 * 新增
 */
function onCreate() {
  formDrawerApi
    .setData({
      values: {},
      parent: currenData.value?.data,
      isUpdate: false,
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

function treeChangOverload() {
  onRefresh();
  reloadTree();
}

/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [
    {
      label: '修改',
      key: '修改',
      props: {
        onClick: () => {
          formModalApi.setData({
            // 表单值
            values: option.data,
            isUpdate: true,
          });
          formModalApi.open();
        },
      },
    },
  ];
};
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <div>
      <div>
        <n-tabs v-model:value="tabSelectActive" type="segment">
          <n-tab name="system"> 系统 </n-tab>
          <n-tab name="tenant"> 租户 </n-tab>
        </n-tabs>
      </div>
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
                  @click="onBatchPhysicalDeletion"
                >
                  物理删除
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
          </NLayoutContent>
        </NLayout>
        <FormDrawer @ok="onRefresh" />
        <FormModal @ok="treeChangOverload" />
      </NLayout>
    </div>
  </Page>
</template>

<style scoped></style>
