<script lang="ts" setup>
import type { RowVO } from '@pg/types';
import type { VxeGridPropTypes } from 'vxe-table';

import { ref } from 'vue';

import { VbenButton } from '@vben/common-ui';

import _XEUtils_ from 'xe-utils';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  selectPublic,
  setStateEnableDisable,
  makeNew,
} from '#/viewsApi/diplAccessKey/api';
const diplNo = defineModel('diplNo', {
  default: () => '',
  type: String,
});
const emit = defineEmits(['changeOk']);
const loading = ref(false);

const columns: VxeGridPropTypes.Columns = [
  {
    type: 'expand',
    slots: {
      content: 'expandContent',
    },
    width: 40,
  },
  { type: 'seq', title: '序', width: 40 },
  { field: 'key', title: 'key', visible: true },
  { field: 'secret', title: 'secret', visible: true },
  {
    field: 'expiryDate',
    title: '有效期',
    width: 160,
    visible: true,
    formatter({ cellValue }) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd');
    },
  },
  {
    field: 'createAt',
    title: '创建时间',
    width: 160,
    visible: true,
    formatter({ cellValue }) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd');
    },
  },
  {
    field: 'state',
    title: '状态',
    // slots: { default: 'state' },
    width: 90,
    cellRender: {
      name: 'PgState',
      events: {
        // 状态更新
        click: ($table, record, e) => {
          const sourceValue = record.state;
          const newStatus = e.value === 1 ? 1 : 2;
          setStateEnableDisable(record.id, newStatus)
            .then(() => {
              record.state = newStatus;
              if ($table) {
                $table.isUpdateByRow(record);
              }
            })
            .catch(() => {
              record.state = sourceValue;
              if ($table) {
                $table.isUpdateByRow(record);
              }
            });
        },
      },
    },
  },
];

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    border: true,
    showOverflow: true,
    minHeight: 700,
    expandConfig: {
      expandAll: true,
    },
    columns,
    rowConfig: {
      useKey: true,
      keyField: 'id',
      isCurrent: true,
      isHover: true,
    },
    columnConfig: {
      resizable: true,
    },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      zoom: false,
    },
    proxyConfig: {
      ajax: {
        query: async () => {
          loading.value = true;
          try {
            return await selectPublic({ diplNo: diplNo.value });
          } finally {
            loading.value = false;
          }
        },
      },
    },
  } as any,
});

/**
 * 格式
 * @param cellValue
 */
function formatter({ cellValue }) {
  return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd HH:MM');
}
function radioChange(opt) {
  const changeRows = [];
  changeRows.push(opt.row);
  console.log(opt.row);
  //
  emit('changeOk', changeRows);
}
function eventMakeNew() {
  makeNew(diplNo.value)
    .then(() => {
      setTimeout(() => {
        gridApi.query();
      }, 900);
    })
    .catch(() => {});
}
function refreshTable() {
  gridApi.query();
}
</script>

<template>
  <div class="grid2 h-full">
    <Grid>
      <template #toolbar-tools>
        <VbenButton class="pg-button-size-small" @click="eventMakeNew()">
          新生成
        </VbenButton>
        <VbenButton class="ml-2 pg-button-size-small" @click="refreshTable()">
          刷新
        </VbenButton>
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
                使用方式 Header中 "<span class="text-red-600"
                  >Authorization</span
                >"值为：<span class="text-lime-900">{{ row.hash }}</span></n-gi
              >
            </n-grid>
          </dd>
        </dl>
      </template>
    </Grid>
  </div>
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
