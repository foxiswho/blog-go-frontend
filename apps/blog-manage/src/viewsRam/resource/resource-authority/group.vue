<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';

import { PgTree } from '@pg/components-n';

import { dialog, message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deletePhysicalDeletion as groupDeletePhysicalDeletion,
  selectPublic,
} from '#/viewsRam/resource/group/api';

import Category from './components/category.vue';
import ResourceList from '../resource/invoke/list.vue';
import {
  batchSelectPhysicalDeletion,
  createByGroup,
  deleteIds,
  List,
} from './api';
import DrawerEdit from './components/edit.vue';
import { columns, useGridFormSchema } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const tabSelectActive = ref('system');
const reloadTreeComputed = computed(() => reloadTreeState.value);

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record;
  gridApi.formApi.setFieldValue('typeValue', record.key);
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
  gridApi.formApi.setFieldValue('typeValue', '');
  onRefresh();
};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
});

const [FormModal, formModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: Category,
});
const [FormModalResource, formModalApiResource] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ResourceList,
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
          const queryParams: any = {
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            ...formValues,
          };
          if (formValues?.typeValue) {
            queryParams.typeValue = formValues.typeValue;
          }
          return await List(queryParams);
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
 * 选择资源
 */
async function onSelectResource() {
  const formValues = await gridApi.formApi.getValues();
  if (formValues.typeValue) {
    formModalApiResource.setData({
      values: {},
      rows: [],
      isUpdate: false,
    });
    formModalApiResource.open();
  } else {
    message.warning('你没有选择资源组');
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

/**
 * 删除 指定数据
 * @param row
 */
const removeTreeEvent = (row: any) => {
  dialog.warning({
    title: '确认删除',
    content: `是否[删除]选中数据[ ${row.name} ]，操作后数据不可恢复`,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      groupDeletePhysicalDeletion([row.id]).then(() => {
        treeChangOverload();
      });
    },
  });
};

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
    {
      label: '添加下级',
      key: '添加下级',
      props: {
        onClick: () => {
          formModalApi.setData({
            // 表单值
            values: {},
            parent: option?.data,
            isUpdate: false,
          });
          formModalApi.open();
        },
      },
    },
    {
      label: '删除',
      key: '删除',
      props: {
        onClick: () => {
          removeTreeEvent(option.data);
        },
      },
    },
  ];
};

function selectResourceOk(rows: any) {
  console.log('rows', rows);
  gridApi.formApi.getValues().then((formValues: any) => {
    if (formValues.typeValue) {
      if (!rows || rows <= 0) {
        message.warning('你没有选择资源数据');
        return;
      }
      createByGroup({
        groupId: formValues.typeValue,
        ids: rows.map((item: any) => item.id),
      }).then(() => {
        setTimeout(() => {
          onRefresh();
        }, 3000);
      });
    } else {
      message.warning('你没有选择资源组');
    }
  });
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
                  @click="onSelectResource"
                >
                  选择
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
    </div>
  </Page>
</template>

<style scoped></style>
