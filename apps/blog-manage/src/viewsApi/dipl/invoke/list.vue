<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { computed, reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteIds, List } from '../api';
import { selectPublic as selectCategoryPublic } from '#/viewsApi/diplCategory/api';
import { columns, useGridFormSchema } from './data';
const emit = defineEmits(['ok']);

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const tabSelectActive = ref('system');
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = reactive({ typeCategory: '' });

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  // console.log('record', record);
  formParam.typeCategory = record.data.code;
  onRefresh();
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
  formParam.typeCategory = '';
  onRefresh();
};
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
    rowConfig: {
      keyField: 'id',
      isHover: true,
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
          // 处理排序条件
          const firstSort = sorts?.[0];
          if (firstSort) {
            queryParams.sort = firstSort.field;
            queryParams.order = firstSort.order;
          }
          // 处理筛选条件
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
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [];
};

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    // 获取选中数据
    const $grid = gridApi.grid;
    if (!$grid) return false;
    const checkboxRecords = $grid.getCheckboxRecords();
    if (checkboxRecords.length <= 0) {
      message.warning('你没有选择任何数据');
      return false;
    }
    emit('ok', checkboxRecords);
    modalApi.setData({ rows: checkboxRecords });
    modalApi.close();
    return true;
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalApi.setState({ title: `选择：外交官` });
    }
  },
  title: '：',
});
</script>

<template>
  <Modal class="w-[900px]">
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
            :api="selectCategoryPublic"
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
              <template #nameAll="{ row }">
                <div>
                  {{ row.name }}
                </div>
                <div>
                  {{ row.path }}
                </div>
              </template>
            </Grid>
          </NLayoutContent>
        </NLayout>
      </NLayout>
    </div>
  </Modal>
</template>

<style scoped></style>
