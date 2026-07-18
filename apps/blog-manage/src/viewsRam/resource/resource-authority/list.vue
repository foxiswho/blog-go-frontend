<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteIds, List, selectPublic } from './api';
import { columns } from './data';

const emit = defineEmits(['ok']);

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
    schema: [
      {
        fieldName: 'parentId',
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
      modalApi.setState({ title: `选择：资源` });
    }
  },
  title: '：',
});
</script>

<template>
  <Modal class="w-[1100px]">
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
