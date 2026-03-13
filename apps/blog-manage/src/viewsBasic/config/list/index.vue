<script setup lang="ts">
import type { RowVO } from '@pg/types';

import { onMounted, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben-core/popup-ui';

import { message } from '#/adapter';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
} from './api';
import DrawerEditTpl from './components/DrawerEdit.vue';
import { columns } from './data';

const xGrid = ref<VxeGridInstance<RowVO>>();

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
});
const gridOptions = reactive<VxeGridProps<RowVO>>({
  stripe: true, // 斑马纹
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  id: 'full_role',
  // height: '99%',
  minHeight: 800,
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
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100, 500, 1000],
  },
  formConfig: {
    titleWidth: 100,
    titleAlign: 'right',
    items: [
      {
        field: 'wd',
        title: '关键词',
        span: 6,
        itemRender: {
          name: '$input',
          props: { placeholder: '请输入', clearable: true },
        },
      },
      {
        field: 'state',
        title: '状态',
        span: 6,
        folding: false,
        itemRender: {
          name: '$select',
          options: [
            { label: '停用', value: '2' },
            { label: '有效', value: '1' },
            { label: '弃置', value: '12' },
            { label: '取消', value: '11' },
          ],
          props: { clearable: true },
        },
      },
      {
        span: 24,
        align: 'center',
        collapseNode: true,
        itemRender: {
          name: '$buttons',
          children: [
            { props: { type: 'submit', content: '搜索', status: 'primary' } },
            { props: { type: 'reset', content: '重置' } },
          ],
        },
      },
    ],
  },
  toolbarConfig: {
    buttons: [
      { code: 'create', name: '新增' },
      { code: 'batchEnable', name: '批量有效' },
      { code: 'batchDisable', name: '批量停用' },
      {
        status: 'primary',
        icon: 'vxe-icon-ellipsis-v',
        size: 'mini',
        circle: true,
        dropdowns: [
          { code: 'delete', name: '删除' },
          { code: 'recovery', name: '删除恢复' },
          { code: 'mark_cancel', name: '标记[删除/取消]' },
          { code: 'physicalDeletion', name: '物理删除' },
          // {code: 'save', name: '保存', status: 'success'}
        ],
      },
    ],
    refresh: true, // 显示刷新按钮
    import: true, // 显示导入按钮
    export: true, // 显示导出按钮
    print: true, // 显示打印按钮
    zoom: true, // 显示全屏按钮
    custom: true, // 显示自定义列按钮
  },
  proxyConfig: {
    seq: true, // 启用动态序号代理，每一页的序号会根据当前页数变化
    sort: true, // 启用排序代理，当点击排序时会自动触发 query 行为
    filter: true, // 启用筛选代理，当点击筛选时会自动触发 query 行为
    form: true, // 启用表单代理，当点击表单提交按钮时会自动触发 reload 行为
    response: {
      // 对应响应结果 Promise<{ result: [], page: { total: 100 } }>
      result: 'data', // 配置响应结果列表字段
      total: 'total', // 配置响应结果总页数字段
    },
    // 只接收Promise，具体实现自由发挥
    ajax: {
      // 当点击工具栏查询按钮或者手动提交指令 query或reload 时会被触发
      query: ({ page, sorts, filters, form }) => {
        const queryParams: any = Object.assign({}, form);
        // 处理排序条件
        const firstSort = sorts[0];
        if (firstSort) {
          queryParams.sort = firstSort.field;
          queryParams.order = firstSort.order;
        }
        // 处理筛选条件
        filters.forEach(({ field, values }) => {
          queryParams[field] = values.join(',');
        });
        queryParams.pageSize = page.pageSize;
        queryParams.pageNum = page.currentPage;
        return List(queryParams);
      },
    },
  },
  columns,
  checkboxConfig: {
    labelField: 'id',
    reserve: true,
    highlight: true,
    range: true,
  },
});

const gridEvent: VxeGridListeners<RowVO> = {
  proxyQuery() {
    console.log('数据代理查询事件');
  },
  proxyDelete() {
    console.log('数据代理删除事件');
  },
  proxySave() {
    console.log('数据代理保存事件');
  },
  toolbarButtonClick({ code }) {
    const $grid = xGrid.value;
    if (!$grid) {
      return;
    }
    switch (code) {
      case 'create': {
        drawerApi.setData({
          // 表单值
          values: {},
          isUpdate: false,
        });
        drawerApi.open();
        break;
      }
      // 批量 有效
      case 'batchEnable': {
        console.log('$grid.getCheckboxRecords()', $grid.getCheckboxRecords());
        const checkboxRecords = $grid.getCheckboxRecords();
        if (checkboxRecords.length <= 0) {
          message.warning('你没有选择任何数据');
          return;
        }
        const ids: any[] = [];
        checkboxRecords.forEach((item) => {
          console.log('$grid.item', item);
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
        batchSelectEnable(
          ids,
          () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          }
        );
        break;
      }
      // 批量 停用
      case 'batchDisable': {
        const checkboxRecords = $grid.getCheckboxRecords();
        if (checkboxRecords.length <= 0) {
          message.warning('你没有选择任何数据');
          return;
        }
        const ids = [];
        checkboxRecords.forEach((item) => {
          console.log('$grid.item', item);
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
        batchSelectDisable(
          ids,
          () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          }
        );
        break;
      }
      // 删除恢复
      case 'recovery': {
        const checkboxRecords = $grid.getCheckboxRecords();
        if (checkboxRecords.length <= 0) {
          message.warning('你没有选择任何数据');
          return;
        }
        const ids = [];
        checkboxRecords.forEach((item) => {
          console.log('$grid.item', item);
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
        batchSelectRecovery(
          ids,
          () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          }
        );
        break;
      }
      // 物理删除
      case 'physicalDeletion': {
        const checkboxRecords = $grid.getCheckboxRecords();
        if (checkboxRecords.length <= 0) {
          message.warning('你没有选择任何数据');
          return;
        }
        const ids = [];
        checkboxRecords.forEach((item) => {
          console.log('$grid.item', item);
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
        batchSelectPhysicalDeletion(
          ids,
          () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          }
        );
        break;
      }
    }
  },
  toolbarToolClick({ code }) {
  },
};

const editRowEvent = (row: RowVO) => {
  drawerApi.setData({
    // 表单值
    values: row,
    isUpdate: true,
  });
  drawerApi.open();
};

const clearRowEvent = () => {
  const $grid = xGrid.value;
  if ($grid) {
    $grid.clearEdit();
  }
};
const saveRowEvent = async (row: RowVO) => {
  const $grid = xGrid.value;
  if ($grid) {
    await $grid.clearEdit();
    gridOptions.loading = true;
    // 模拟异步保存
    setTimeout(() => {
      gridOptions.loading = false;
      VXETable.modal.message({
        content: `${JSON.stringify(row)}`,
        status: 'success',
      });
    }, 300);
  }
};
/**
 * 删除 指定行数据
 * @param row
 */
const removeRowEvent = async (row: RowVO) => {
  const type = await VXETable.modal.confirm('您确定要删除该数据?');
  const $grid = xGrid.value;
  if ($grid && type === 'confirm') {
    deleteIds([row.id]);
    await $grid.remove(row);
  }
};

onMounted(() => {});

/**
 * 重新加载
 */
function reloadTable() {
  const $grid = xGrid.value;
  if ($grid) {
    $grid.commitProxy('query');
  }
}


</script>

<template>
  <div class="grid2 h-full p-2">
    <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvent">
      <template #operate="{ row }">
        <vxe-button
          icon="vxe-icon-edit"
          mode="text"
          title="编辑"
          @click="editRowEvent(row)"
        />
        <vxe-button
          icon="vxe-icon-delete"
          mode="text"
          status="danger"
          title="删除"
          @click="removeRowEvent(row)"
        />
      </template>
    </vxe-grid>
    <Drawer @ok="reloadTable" />
  </div>
</template>

<style scoped></style>
