<script lang="ts" setup>
import type { RowVO } from '@pg/types';
import type {
  VxeGridInstance,
  VxeGridProps,
  VxeGridPropTypes,
  VxeToolbarInstance,
} from 'vxe-table';

import { nextTick, onMounted, reactive, ref } from 'vue';

import { VbenButton } from '@vben/common-ui';

import { useVbenModal } from '@vben-core/popup-ui';

import _XEUtils_ from 'xe-utils';

import { message } from '#/adapter';
import { setStateEnableDisable } from '#/viewsBlog/article/api';
import TopicTpl from '#/viewsBlog/topic/invoke/list.vue';

const emit = defineEmits(['ok']);
const appNo = defineModel('appNo', {
  default: () => '',
  type: String,
});
const modelData = defineModel('data', {
  default: () => [],
  type: Array,
});
const loading = ref(false);
const xGrid = ref<VxeGridInstance<RowVO>>();
const toolbarRef = ref<VxeToolbarInstance>();
const tableData = ref<RowVO[]>([]);
const formParam = { typeCategory: '' };
const checkedData = ref<RowVO[]>([]);

const [ModalTopic, modalApiTopic] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: TopicTpl,
});
/**
 * 重新加载
 */
function reloadTable() {
  const $grid = xGrid.value;
  if ($grid) {
    $grid.commitProxy('query');
  }
}
const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', title: 'ID', width: 40 },
  { field: 'tenantNo', title: '租户编号', width: 120, visible: false },
  { field: 'tenantNoName', title: '租户', width: 120, visible: false },
  { field: 'name', title: '名称', visible: true },
  {
    field: 'nameAll',
    title: '名称',
    visible: false,
    slots: { default: 'nameAll' },
  },
  { field: 'no', title: '话题编号', width: 120, visible: true },
  {
    field: 'description',
    title: '描述',
    maxWidth: 400,
    minWidth: 160,
    visible: false,
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
];
const vxOpt = reactive<VxeGridProps<RowVO>>({
  border: true,
  showOverflow: true,
  minHeight: 700,
  rowConfig: {
    useKey: true,
    keyField: 'id',
    isCurrent: true,
    isHover: true,
  },
  columnConfig: {
    resizable: true,
  },
  // toolbarConfig: {
  //   refresh: false, // 显示刷新按钮
  //   import: false, // 显示导入按钮
  //   export: false, // 显示导出按钮
  //   print: false, // 显示打印按钮
  //   zoom: false, // 显示全屏按钮
  //   custom: false, // 显示自定义列按钮
  // },
  columns,
});

nextTick(() => {
  // 将表格和工具栏进行关联
  const $table = xGrid.value;
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
  // emit('changeOk', changeRows);
}
const cellRender = {
  name: 'PgState',
  events: {
    // 状态更新
    click: ($table, record, e) => {
      const sourceValue = record.state;
      const newStatus = e.value === 1 ? 1 : 2;
      setStateEnableDisable(record.id, newStatus, appNo.value)
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
};
function eventMakeNew() {
  const $grid = xGrid.value;
  const obj = {
    no: '1111',
    name: '2222',
    description: '3333',
    state: 1,
    createAt: new Date(),
    updateAt: new Date(),
  };
  if ($grid) {
    $grid.insertAt(obj, -1).then(({ row }) => {
      if (row.id.indexOf('_') > 0) {
        // 创建后，开启展开
        $grid.setRowExpand([row], true);
      }
    });
  }
}
function refreshTable() {}
function eventSelect() {
  modalApiTopic.setData({
    // 表单值
    values: {},
    rows: [],
    isUpdate: false,
  });
  modalApiTopic.open();
}
function selectTopic(opt) {
  console.log('opt', opt);
  const $grid = xGrid.value;
  if (opt) {
    for (const item of opt) {
      console.log('item', item);
      if ($grid) {
        $grid.insertAt(item, -1).then(({ row }) => {
          if (row.id.indexOf('_') > 0) {
            // 创建后，开启展开
            $grid.setRowExpand([row], true);
          }
        });
        checkedData.value = $grid.getTableData().tableData;
        emit('ok', checkedData.value);
      }
    }
  }
}
function eventDelete() {
  const $grid = xGrid.value;
  if ($grid) {
    // 删除已选中的行
    const checkboxRecords = $grid.getCheckboxRecords();
    if (checkboxRecords.length <= 0) {
      message.warning('你没有选择任何数据');
      return;
    }
    checkboxRecords.forEach((item) => {
      $grid.remove(item);
    });

    checkedData.value = $grid.getTableData().tableData;
    emit('ok', checkedData.value);
  }
}

function setTableData() {
  const $grid = xGrid.value;
  if ($grid) {
    setTimeout(() => {
      for (const item of modelData.value) {
        console.log('item', item);
        $grid.insert(item);
      }
      checkedData.value = $grid.getTableData().tableData;
      emit('ok', checkedData.value);
    }, 200);
    // for (const item of modelData.value) {
    //   console.log('item', item);
    //   $grid.insert(item);
    // }
    //$grid.loadData(modelData.value);
    //console.log('modelData', modelData.value);
  }
}
onMounted(() => {
  setTableData();
});
</script>

<template>
  <div class="grid2 h-full">
    <vxe-toolbar ref="toolbarRef">
      <template #tools>
        <VbenButton @click="eventSelect()">选择话题</VbenButton>
        <VbenButton @click="eventDelete()" class="ml-2">删除</VbenButton>
      </template>
    </vxe-toolbar>
    <vxe-grid
      :print-config="{}"
      :export-config="{}"
      :loading="loading"
      ref="xGrid"
      v-bind="vxOpt"
      @radio-change="radioChange"
    >
      <template #nameAll="{ row }">
        <div>
          <h2 class="text-3xl font-medium">{{ row.name }}</h2>
        </div>
        <div>
          {{ row.description }}
        </div>
      </template>
    </vxe-grid>
    <ModalTopic @ok="selectTopic" />
  </div>
</template>
<style lang="less">
.grid2 .vxe-tools--wrapper {
  margin-right: 0.8em;
}
</style>
