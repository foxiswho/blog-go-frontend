<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { computed, reactive, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { PgTree } from '@pg/components-n';

import { dialog, message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import CategoryTpl from '#/viewsBlog/topicCategory/invoke/category.vue';
import modalEditTpl from '#/viewsBlog/topicRelation/invoke/ModalEdit.vue';
import { selectPublic } from '#/viewsBlog/topicCategory/api';
import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds as categoryDeleteIds,
  List,
} from './api';
import Edit from './components/DrawerEdit.vue';
import { columns, useGridFormSchema } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = reactive({ categoryNo: '' });

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  console.log('record', record);
  formParam.categoryNo = record.data.no;
  reloadTree();
  onRefresh();

  setTimeout(() => {
    reloadTree();
  }, 2000);
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
  formParam.categoryNo = '';
  onRefresh();
};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Edit,
  destroyOnClose: true,
});

const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: CategoryTpl,
  destroyOnClose: true,
});
const [ModalRelation, modalRelationApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: modalEditTpl,
  destroyOnClose: true,
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
        modalApi
          .setData({
            // 表单值
            values: {},
            isUpdate: false,
          })
          .open();
      },
    },
  },
];

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
    expandConfig: {
      expandAll: true,
    },
    cellConfig: {
      height: 80,
    },
    columnConfig: {
      resizable: true,
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
          return await List({ ...queryParams, ...formParam });
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
    ids.push(item.id);
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
      categoryDeleteIds([row.id]).then(() => {
        setTimeout(() => {
          reloadTree();
        }, 2000);
      });
    },
  });
};

/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [
    {
      label: '添加下级',
      key: '添加下级',
      props: {
        onClick: () => {
          modalApi
            .setData({
              // 表单值
              values: {},
              parent: option.data,
              isUpdate: false,
            })
            .open();
        },
      },
    },
    {
      label: '修改',
      key: '修改',
      props: {
        onClick: () => {
          modalApi
            .setData({
              // 表单值
              values: option.data,
              isUpdate: true,
            })
            .open();
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

function rowEventAddArticle(row) {
  modalRelationApi
    .setData({
      topic: row,
      // 表单值
      values: {},
      isUpdate: false,
    })
    .open();
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <NLayout class="h-full" has-sider>
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
          <FormDrawer @ok="onRefresh" />
          <Modal @ok="reloadTree" />
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
                    label: '添加文章',
                    type: 'primary',
                    onClick: () => rowEventAddArticle(row),
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
                    <n-gi> 编号：{{ row.no }} </n-gi>
                  </n-grid>
                </dd>
              </dl>
            </template>
          </Grid>
        </NLayoutContent>
      </NLayout>
    </NLayout>
    <ModalRelation />
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
