<script setup lang="ts">
import type { RowVO } from '@pg/types';
import { reactive, ref } from 'vue';
import { useVbenDrawer } from '@vben-core/popup-ui';

import { message as Message } from '#/adapter';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import {
  batchSelectDelete,
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteId,
  List,
} from './api';
import Edit from './components/DrawerEdit.vue';
import { columns } from './data';

const xGrid = ref<VxeGridInstance<RowVO>>();

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: Edit,
});
const gridOptions = reactive<VxeGridProps<RowVO>>({
  stripe: true,
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  minHeight: 800,
  rowConfig: {
    keyField: 'id',
    isHover: true,
    isCurrent: true,
  },
  columnConfig: {
    resizable: true,
  },
  toolbarConfig: {
    buttons: [
      { code: 'create', name: '新增', status: 'primary' },
      { code: 'batchDelete', name: '批量删除', status: 'danger' },
      { code: 'batchEnable', name: '批量有效' },
      { code: 'batchDisable', name: '批量停用' },
    ],
    refresh: true,
    zoom: true,
    custom: true,
  },
  proxyConfig: {
    seq: true,
    sort: true,
    filter: true,
    form: true,
    response: {
      result: 'data',
      total: 'total',
    },
    ajax: {
      query: ({ page, sorts, form }) => {
        const queryParams: any = Object.assign({}, form);
        const firstSort = sorts[0];
        if (firstSort) {
          queryParams.sort = firstSort.field;
          queryParams.order = firstSort.order;
        }
        queryParams.pageSize = page.pageSize;
        queryParams.pageNum = page.currentPage;
        return List(queryParams);
      },
    },
  },
  columns,
  checkboxConfig: {
    highlight: true,
  },
});



function openEdit(row?: any) {
  drawerApi.setData({
    values: row,
    isUpdate: !!row,
  });
  drawerApi.open();
}

const gridEvent: VxeGridListeners<RowVO> = {
  toolbarButtonClick({ code }) {
    const $grid = xGrid.value;
    if (!$grid) return;
    const records = $grid.getCheckboxRecords();

    switch (code) {
      case 'create':
        openEdit();
        break;
      case 'batchDelete':
        if (records.length === 0) return Message.warning('请选择数据');
        batchSelectDelete(records.map(r => r.id), () => $grid.commitProxy('query'));
        break;
      case 'batchEnable':
        if (records.length === 0) return Message.warning('请选择数据');
        batchSelectEnable(records.map(r => r.id), () => $grid.commitProxy('query'));
        break;
      case 'batchDisable':
        if (records.length === 0) return Message.warning('请选择数据');
        batchSelectDisable(records.map(r => r.id), () => $grid.commitProxy('query'));
        break;
    }
  },
};

function handleEdit(row: any) {
  openEdit(row);
}

function handleDelete(row: any) {
  deleteId(row.id).then(() => {
    Message.success('删除成功');
    xGrid.value?.commitProxy('query');
  });
}

function handleSuccess() {
  xGrid.value?.commitProxy('query');
}
</script>

<template>
  <div class="grid2 h-full p-2">
    <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvent">
      <template #operate="{ row }">
        <vxe-button mode="text" status="primary" @click="handleEdit(row)">编辑</vxe-button>
        <vxe-button mode="text" status="danger" @click="handleDelete(row)">删除</vxe-button>
      </template>
    </vxe-grid>
    <Drawer @ok="handleSuccess" />
  </div>
</template>
