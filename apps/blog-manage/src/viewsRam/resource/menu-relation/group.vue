<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { selectPublic } from '#/viewsRam/resource/menu/api';

import ResourceGroupTree from '../group/invoke/tree.vue';
import ResourceList from '../resource/invoke/list.vue';
import {
  batchSelectPhysicalDeletion,
  deleteIds,
  List,
  updateByMenu,
} from './api';
import Category from './components/category.vue';
import Edit from './components/edit.vue';
import { columns, useGridFormSchema } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const tabSelectActive = ref('system');
const reloadTreeComputed = computed(() => reloadTreeState.value);

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record;
  gridApi.formApi.setFieldValue('menuId', record.key);
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
  gridApi.formApi.setFieldValue('menuId', '');
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
const [FormModalResource, formModalApiResource] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ResourceList,
});
const [FormModalGroupTree, formModalApiGroupTree] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ResourceGroupTree,
});
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions: any[] = [];

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    commonConfig: {
      labelWidth: 50,
      componentProps: {
        class: 'w-full',
      },
    },
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
 * 批量删除
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
 * 关联资源
 */
async function onSelectResource() {
  const formValues = await gridApi.formApi.getValues();
  if (formValues.menuId) {
    formModalApiResource.setData({
      // 表单值
      values: {},
      rows: [],
      isUpdate: false,
    });
    formModalApiResource.open();
  } else {
    message.warning('你没有选择菜单');
  }
}

/**
 * 关联资源组
 */
async function onSelectResourceGroup() {
  const formValues = await gridApi.formApi.getValues();
  if (formValues.menuId) {
    formModalApiGroupTree.setData({
      // 表单值
      values: {},
      rows: [],
      isUpdate: false,
    });
    formModalApiGroupTree.open();
  } else {
    message.warning('你没有选择菜单');
  }
}

/**
 * 删除 指定行数据
 * @param row
 */
function onDelete(row: any) {
  const $grid = gridApi.grid;
  if (!$grid) return;
  batchSelectPhysicalDeletion([row.id], () => {
    $grid.remove(row);
  });
}

function treeChangOverload() {
  onRefresh();
  reloadTree();
  setTimeout(() => {
    reloadTree();
  }, 1000);
}

/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [];
};

async function selectResourceOk(rows: any) {
  const formValues = await gridApi.formApi.getValues();
  if (formValues.menuId) {
    if (!rows || rows.length <= 0) {
      message.warning('你没有选择资源数据');
      return;
    }
    updateByMenu({
      menuId: formValues.menuId,
      data: rows.map((item: any) => {
        return { id: item.id, type: 'resource' };
      }),
    }).then(() => {
      setTimeout(() => {
        onRefresh();
      }, 3000);
    });
  } else {
    message.warning('你没有选择菜单');
  }
}

async function selectResourceGroupOk(rows: any) {
  const formValues = await gridApi.formApi.getValues();
  if (formValues.menuId) {
    if (!rows || rows.length <= 0) {
      message.warning('你没有选择资源组数据');
      return;
    }
    updateByMenu({
      menuId: formValues.menuId,
      data: rows.map((item: any) => {
        return { id: item.data.id, type: 'group' };
      }),
    }).then(() => {
      setTimeout(() => {
        onRefresh();
      }, 3000);
    });
  } else {
    message.warning('你没有选择菜单');
  }
}
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
                  @click="onSelectResourceGroup"
                >
                  关联资源组
                </VbenButton>
                <VbenButton
                  class="ml-2 pg-button-size-small"
                  type="primary"
                  @click="onSelectResource"
                >
                  关联资源
                </VbenButton>
                <VbenButton
                  class="ml-2 pg-button-size-small"
                  danger
                  @click="onBatchDelete"
                >
                  批量删除
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
                        content: '删除',
                      },
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
        <FormDrawer />
        <FormModal @ok="treeChangOverload" />
      </NLayout>
      <FormModalResource @ok="selectResourceOk" />
      <FormModalGroupTree @ok="selectResourceGroupOk" />
    </div>
  </Page>
</template>

<style scoped></style>
