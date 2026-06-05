<script setup lang="ts">
import type { RowVO } from '@pg/types';

import { onMounted, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben-core/popup-ui';
import { MenuBadge } from '@vben-core/menu-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { IconifyIcon, Plus } from '@vben/icons';
import { message as Message } from '#/adapter';
import { VXETable } from 'vxe-table';
import type {
  VxeGridInstance,
  VxeGridListeners,
  VxeGridProps,
} from 'vxe-table';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
  selectNodeAll,
} from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns } from './data';
import {$t} from "@vben/locales";

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
});

const xGrid = ref<VxeGridInstance<RowVO>>();
const gridOptions = reactive<VxeGridProps<RowVO>>({
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  id: 'full_0035',
  // height: '99%',
  minHeight: 800,
  rowConfig: {
    keyField: 'value',
    isHover: true,
    useKey: true,
  },
  treeConfig: {
    parentField: 'parentNo',
    rowField: 'value',
    transform: true,
    expandAll: true,
    showLine: true,
    showRootLine: true,
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
    enabled: false,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100, 500, 1000],
  },
  toolbarConfig: {
    buttons: [
      { code: 'create', name: '新增', status: 'primary' },
      // { code: 'batchEnable', name: '批量有效' },
      // { code: 'batchDisable', name: '批量停用' },
      // {
      //   status: 'primary',
      //   icon: 'vxe-icon-ellipsis-v',
      //   size: 'mini',
      //   circle: true,
      //   dropdowns: [
      //     { code: 'delete', name: '删除' },
      //     { code: 'recovery', name: '删除恢复' },
      //     { code: 'mark_cancel', name: '标记[删除/取消]' },
      //     // { code: 'physicalDeletion', name: '物理删除' },
      //     // {code: 'save', name: '保存', status: 'success'}
      //   ],
      // },
    ],
    refresh: true, // 显示刷新按钮
    import: false, // 显示导入按钮
    export: false, // 显示导出按钮
    print: false, // 显示打印按钮
    zoom: true, // 显示全屏按钮
    custom: true, // 显示自定义列按钮
  },
  proxyConfig: {
    seq: false, // 启用动态序号代理，每一页的序号会根据当前页数变化
    sort: false, // 启用排序代理，当点击排序时会自动触发 query 行为
    filter: false, // 启用筛选代理，当点击筛选时会自动触发 query 行为
    form: false, // 启用表单代理，当点击表单提交按钮时会自动触发 reload 行为
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
        return selectNodeAll(queryParams);
      },
      // 当点击工具栏删除按钮或者手动提交指令 delete 时会被触发
      delete: ({ body }) => {
        const { removeRecords } = body;
        const ids: [] = [];
        removeRecords.forEach((item) => {
          // 判断状态是否可删除
          if (item.state < 10) {
            ids.push(item.id);
          }
        });
        if (ids.length <= 0) {
          Message.warning('你没有选择任何数据');
          return Promise.resolve();
        }
        return deleteIds(ids).then(() => {
          reloadTable();
        });
      },
    },
  },
  columns,
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
    if ($grid) {
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
            Message.warning('你没有选择任何数据');
            return;
          }
          const ids = [];
          checkboxRecords.forEach((item) => {
            console.log('$grid.item', item);
            if (item.state === 2) {
              ids.push(item.id);
            } else {
              $grid.setCheckboxRow(item, false);
            }
          });
          if (ids.length <= 0) {
            Message.warning('你没有选择任何数据');
            return;
          }
          batchSelectEnable(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
        // 批量 停用
        case 'batchDisable': {
          const checkboxRecords = $grid.getCheckboxRecords();
          if (checkboxRecords.length <= 0) {
            Message.warning('你没有选择任何数据');
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
            Message.warning('你没有选择任何数据');
            return;
          }
          batchSelectDisable(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
        // 删除恢复
        case 'recovery': {
          const checkboxRecords = $grid.getCheckboxRecords();
          if (checkboxRecords.length <= 0) {
            Message.warning('你没有选择任何数据');
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
            Message.warning('你没有选择任何数据');
            return;
          }
          batchSelectRecovery(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
        // 物理删除
        case 'physicalDeletion': {
          const checkboxRecords = $grid.getCheckboxRecords();
          if (checkboxRecords.length <= 0) {
            Message.warning('你没有选择任何数据');
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
            Message.warning('你没有选择任何数据');
            return;
          }
          batchSelectPhysicalDeletion(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
      }
    }
  },
};

const hasActiveEditRow = (row: RowVO) => {
  const $grid = xGrid.value;
  if ($grid) {
    return $grid.isEditByRow(row);
  }
  return false;
};
const rowEventCreate = (row: RowVO) => {
  console.log('$grid.editRowEvent', row);
  drawerApi.setData({
    // 表单值
    parent: row.extend,
    values: {},
    isUpdate: true,
  });
  drawerApi.open();
};
const editRowEvent = (row: RowVO) => {
  console.log('$grid.editRowEvent', row);
  drawerApi.setData({
    // 表单值
    values: row.extend,
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
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 shrink-0">
            <IconifyIcon
              v-if="row.extend.typeMenu === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.extend.icon"
              :icon="row.extend.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ row.label }}</span>
          <div class="items-center justify-end"></div>
        </div>
        <MenuBadge
          v-if="row.extend.metaBadgeType"
          class="menu-badge"
          :badge="row.extend.metaBadge"
          :badge-type="row.extend.metaBadgeType"
          :badge-variants="row.extend.metaBadgeVariants"
        />
      </template>
      <template #operate="{ row }">
        <n-button
          size="tiny"
          text
          tag="a"
          type="primary"
          @click="rowEventCreate(row)"
        >
          新增下级
        </n-button>
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
    <Drawer @ok="reloadTable"/>
  </div>
</template>

<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
