<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { computed, h, reactive, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { PgTree } from '@pg/components-n';
import { FluentWindowNew20Filled } from '@pg/icons';

import { NTag, type SelectRenderTag } from 'naive-ui';

import { dialog, message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import ModalTagTpl from '#/viewsBasic/tags/relation/invoke/ModalTag.vue';
import { selectNodeAllPublic } from '#/viewsBlog/collectCategory/api';
import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  List,
} from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns, useGridFormSchema } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = reactive({ tagsQuery: [] });

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record?.data;
  gridApi.formApi.setFieldValue('categoryNo', record.data.no);
  //
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
const treeOverload = (e) => {
  formParam.tagsQuery = [];
  gridApi.formApi.setFieldValue('categoryNo', '');
  onRefresh();
};

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
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
  drawerApi.setData({ values: row, isUpdate: true }).open();
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



const optionsTags = ref([]);
const [ModalTag, modalTagApi] = useVbenModal({
  connectedComponent: ModalTagTpl,
  destroyOnClose: true,
});
const renderTag: SelectRenderTag = ({ option, handleClose }) => {
  return h(
    NTag,
    {
      type: option.data.attributeMap.type as
        | 'default'
        | 'error'
        | 'info'
        | 'success'
        | 'warning',
      bordered: option.data.attributeMap.bordered,
      color: option.data.attributeMap.color,
      round: option.data.attributeMap.round,
      size: option.data.attributeMap.size,
      strong: option.data.attributeMap.strong,
      closable: true,
      onMousedown: (e: FocusEvent) => {
        e.preventDefault();
      },
      onClose: (e: MouseEvent) => {
        e.stopPropagation();
        handleClose();
      },
    },
    { default: () => option.label },
  );
};
async function modalOkTags(e) {
  if (e) {
    let tagsQuery = [...(formParam.tagsQuery || [])];
    for (const i in e) {
      const obj = e[i];
      const tag = {
        label: obj.name,
        value: obj.tagNo,
        data: obj,
      };
      const index = optionsTags.value.indexOf(tag);
      if (index === -1) {
        optionsTags.value.push(tag);
      }

      const index2 = tagsQuery.indexOf(obj.code);
      if (index2 === -1) {
        tagsQuery.push(obj.code);
      }
    }
    formParam.tagsQuery = tagsQuery;
  } else {
    formParam.tagsQuery = [];
  }
}
function iconclick(e) {
  modalTagApi
    .setData({
      values: {},
      isUpdate: false,
    })
    .open();
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <div class="flex size-full">
      <n-card
        class="min-w-[160px]"
        style="width: unset"
        content-style="padding-left:10px;padding-right:10px;padding-top:10px;"
      >
        <PgTree
          :api="selectNodeAllPublic"
          :is-node-all="true"
          :reload="reloadTreeComputed"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </n-card>
      <div class="w-[calc(100%-160px)] ml-2 pl-2 bg-card rounded-md">
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
          <template #form-tagsQuery>
            <n-select
              placeholder="选择"
              :show="false"
              v-model:value="formParam.tagsQuery"
              multiple
              :render-tag="renderTag"
              :options="optionsTags"
              @update:value="
                  (opt) => {
                    //formApi.setFieldValue('tagsQuery', opt);
                  }
                "
            >
              <template #arrow>
                <FluentWindowNew20Filled
                  @click="iconclick"
                  style="
                      width: 30px;
                      height: 30px;
                      margin-top: -5px;
                      margin-left: -5px;
                      color: #020617;
                    "
                  class="size-10 transition-none hover:text-black"
                />
              </template>
            </n-select>
          </template>
          <template #operate="{ row }">
            <VbenTableAction
              :actions="[
                  {
                    tooltip: { content: '编辑' },
                    icon: 'lucide:edit',
                    onClick: () => onEdit(row),
                  },
                ]"
              align="center"
            />
          </template>
          <template #nameAll="{ row }">
            <div>
              <h2 class="text-2xl font-medium">{{ row.name }}</h2>
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
                  <n-gi>
                    <div
                      v-if="row.tagsStyle"
                      class="flex flex-row flex-wrap leading-6"
                    >
                      标签：
                      <div v-for="item in row.tagsStyle" class="mr-2">
                        <NTag
                          size="small"
                          :bordered="item.attributeMap.bordered"
                          :type="item.attributeMap.type"
                          :color="item.attributeMap.color"
                          :size="item.attributeMap.size"
                          :strong="item.attributeMap.strong"
                          :round="item.attributeMap.round"
                          class="cursor-pointer"
                        >
                          {{ item.name }}
                        </NTag>
                      </div>
                    </div>
                    <div v-else>标签：{{ row.tags }}</div>
                  </n-gi>
                  <n-gi> 操作时间：{{ row.operationTime }} </n-gi>
                  <n-gi> 编号：{{ row.no }} </n-gi>
                </n-grid>
              </dd>
            </dl>
          </template>
        </Grid>
      </div>
    </div>
    <Drawer @ok="onRefresh" />
    <ModalTag @ok="modalOkTags" />
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
