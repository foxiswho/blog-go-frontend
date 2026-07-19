<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { computed, reactive, ref } from 'vue';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { PgTree } from '@pg/components-n';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import { selectPublic } from '#/viewsBasic/tags/category/api';
import { deleteIds, List } from '#/viewsBasic/tags/relation/api';
import DrawerTagTpl from './components/DrawerTag.vue';
import { columns, useGridFormSchema } from './data';

const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = reactive({ categoryNo: '' });

const treeChang = (record) => {
  currenData.value = record;
  formParam.categoryNo = record.data.no;
  onRefresh();
};

function reloadTree() {
  reloadTreeState.value = true;
}

const treeOverload = (e) => {
  formParam.categoryNo = '';
  onRefresh();
};

const [DrawerForm, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerTagTpl,
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
            ...formParam,
          });
        },
      },
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
 * 新增
 */
function onCreate() {
  drawerApi
    .setData({
      values: {},
      isUpdate: false,
      parent: currenData.value?.data,
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
 * 删除
 * @param row 行数据
 */
function onDelete(row: any) {
  deleteIds([row.id]).then(() => {
    onRefresh();
  });
}

/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [
    {
      label: '添加标签',
      key: '添加标签',
      props: {
        onClick: () => {
          drawerApi
            .setData({
              // 表单值
              values: {},
              isUpdate: false,
              parent: option.data,
            })
            .open();
        },
      },
    },
    {
      label: '添加下级',
      key: '添加下级',
      props: {
        onClick: () => {
          drawerApi
            .setData({
              // 表单值
              values: {},
              isUpdate: false,
              parent: option.data,
            })
            .open();
        },
      },
    },
  ];
};

/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [
  {
    label: '添加',
    key: '添加',
    props: {
      onClick: () => {
        drawerApi
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
          <DrawerForm @ok="onRefresh" />
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
            <template #tags="{ row }">
              <n-tag
                :bordered="
                  row.attributeMap &&
                  row.attributeMap.hasOwnProperty('bordered')
                    ? row.attributeMap['bordered']
                    : true
                "
                :type="
                  row.attributeMap &&
                  row.attributeMap.hasOwnProperty('type')
                    ? row.attributeMap['type']
                    : 'default'
                "
                :color="
                  row.attributeMap &&
                  row.attributeMap.hasOwnProperty('color')
                    ? row.attributeMap['color']
                    : undefined
                "
                :size="
                  row.attributeMap &&
                  row.attributeMap.hasOwnProperty('size')
                    ? row.attributeMap['size']
                    : 'medium'
                "
                :strong="
                  row.attributeMap &&
                  row.attributeMap.hasOwnProperty('strong')
                    ? row.attributeMap['strong']
                    : false
                "
                :round="
                  row.attributeMap &&
                  row.attributeMap.hasOwnProperty('round')
                    ? row.attributeMap['round']
                    : false
                "
              >
                {{ row.name }}
              </n-tag>
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
                    tooltip: { content: '删除' },
                    icon: 'lucide:trash-2',
                    danger: true,
                    popConfirm: {
                      title: `确定删除 [${row.name}] 吗？`,
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
    </NLayout>
  </Page>
</template>

<style scoped></style>
