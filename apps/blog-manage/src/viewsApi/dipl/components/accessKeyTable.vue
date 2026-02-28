<script lang="ts" setup>
import type { RowVO } from '@pg/types';

import { nextTick, reactive, ref } from 'vue';

import {
  type VxeToolbarInstance,
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
  type VxeGridPropTypes,
} from 'vxe-table';
import _XEUtils_ from 'xe-utils';

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
const vtRef = ref<VxeGridInstance<RowVO>>();
const toolbarRef = ref<VxeToolbarInstance>();
const tableData = ref<RowVO[]>([]);

const fetch = () => {
  loading.value = true;
  console.log('diplNo=', diplNo.value);
  selectPublic({ diplNo: diplNo.value })
    .then((data) => {
      tableData.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
};
fetch();

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
const vxOpt = reactive<VxeGridProps<RowVO>>({
  border: true,
  showOverflow: true,
  minHeight: 700,
  expandConfig: {
    expandAll: true,
  },
  rowConfig: {
    useKey: true,
    keyField: 'id',
    isCurrent: true,
    isHover: true,
  },
  columnConfig: {
    resizable: true,
  },
  columns,
  // toolbarConfig: {
  //   refresh: false, // 显示刷新按钮
  //   import: false, // 显示导入按钮
  //   export: false, // 显示导出按钮
  //   print: false, // 显示打印按钮
  //   zoom: false, // 显示全屏按钮
  //   custom: false, // 显示自定义列按钮
  // },
});

nextTick(() => {
  // 将表格和工具栏进行关联
  const $table = vtRef.value;
  const $toolbar = toolbarRef.value;
  if ($table && $toolbar) {
    $table.connect($toolbar);
  }
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
        fetch();
      }, 900);
    })
    .catch(() => {});
}
function refreshTable() {
  fetch();
}
</script>

<template>
  <div class="grid2 h-full">
    <vxe-toolbar ref="toolbarRef">
      <template #tools>
        <vxe-button @click="eventMakeNew()">新生成</vxe-button>
        <vxe-button @click="refreshTable()">刷新</vxe-button>
      </template>
    </vxe-toolbar>
    <vxe-grid
      :print-config="{}"
      :export-config="{}"
      :loading="loading"
      ref="vtRef"
      v-bind="vxOpt"
      :data="tableData"
      @radio-change="radioChange"
    >
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
    </vxe-grid>
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
