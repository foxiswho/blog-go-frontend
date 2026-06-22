<script lang="ts" setup>
import {
  type OnActionClickParams, VbenTableAction,
  type VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page, useVbenDrawer,VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { message } from '#/adapter/naive';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteIds,queryAll } from './api';
import { $t } from '#/locales';

import { columns } from './data';
import Form from './components/DrawerEdit.vue';

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

/**
 * 编辑部门
 * @param row
 */
function onEdit(row: any) {
  drawerApi.setData({values:row,isUpdate:true}).open();
}

/**
 * 添加下级部门
 * @param row
 */
function onAppend(row: any) {
  drawerApi.setData({
    values: null,
    isUpdate:false,
    parent: row,
  }).open();
}

/**
 * 创建新部门
 */
function onCreate() {
  drawerApi.setData({
    values:null,
    isUpdate:false,
  }).open();
}

/**
 * 删除部门
 * @param row
 */
function onDelete(row: any) {
  deleteIds([row.id])
    .then(() => {
      refreshGrid();
    })
    .catch(() => {
      refreshGrid()
    });
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {},
  gridOptions: {
    columns: columns,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          return await queryAll({});
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'parentNo',
      rowField: 'no',
      transform: true,
      expandAll: true,
      showLine: true,
    },
  } as VxeTableGridOptions,
});

/**
 * 刷新表格
 */
function refreshGrid() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <Drawer @success="refreshGrid" />
    <Grid table-title="部门列表">
      <template #toolbar-tools>
        <VbenButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dept.name')]) }}
        </VbenButton>
      </template>
      <template #operate="{ row }">
        <VbenTableAction
          :actions="[
                 {
                  tooltip:{
                    content: '添加下级'
                  },
                  text: '添加下级',
                  onClick: () => onAppend(row),
                },
                {
                  tooltip:{
                    content: '编辑'
                  },
                  icon: 'lucide:edit',
                  onClick: () => onEdit(row),
                },
                {
                  tooltip:{
                    content: '删除'
                  },
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
  </Page>
</template>
