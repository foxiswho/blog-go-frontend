<script setup lang="ts">
import type { RowVO } from '@pg/types';

import { onMounted, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben-core/popup-ui';

import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import { message as Message,dialog } from '#/adapter';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  selectPublic,
} from './api';
import Edit from './components/edit.vue';
import { columns } from './data';

const formParam = { state: 0 };
const xGrid = ref<VxeGridInstance<RowVO>>();
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
    isHover: true,
    isCurrent: true,
  },
  treeConfig: {
    transform: true,
    expandAll: true,
    showLine: true,
    rowField: 'id',
    parentField: 'parentId',
  },
  columnConfig: {
    resizable: true,
  },
  toolbarConfig: {
    buttons: [
      { code: 'create', name: '新增' },
      { code: 'physicalDeletion', name: '物理删除' },
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
      //     // {code: 'save', name: '保存', status: 'success'}
      //   ],
      // },
    ],
    slots: {
      // buttons: 'toolbar_buttons',
      // tools: 'toolbar_tools'
    },
    // tools: [
    //   {
    //     name: '更多',
    //     status: 'primary',
    //     size: 'small',
    //     toolRender: {
    //       props: { className: 'mr-2', class: 'mr-2', popupClassName: 'mr-2' },
    //       attrs: { className: 'mr-2', class: 'mr-2' },
    //       name: '$buttons',
    //     },
    //     dropdowns: [
    //       // {code: 'delete', name: '直接删除'},
    //       // {code: 'mark_cancel', name: '标记[删除/取消]'},
    //       // {code: 'myInsert', name: '插入'},
    //       // {code: 'mySave', name: '保存'},
    //       { code: 'myPrint', name: '打印' },
    //       { code: 'physicalDeletion', name: '物理删除' },
    //     ],
    //   },
    // ],
    refresh: true, // 显示刷新按钮
    import: false, // 显示导入按钮
    export: false, // 显示导出按钮
    print: false, // 显示打印按钮
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
        if (formParam) {
          for (let key in formParam) {
            queryParams[key] = formParam[key];
          }
        }
        return selectPublic(queryParams);
      },
    },
  },
  columns,
  checkboxConfig: {
    labelField: 'name',
    highlight: true,
  },
  menuConfig: {
    body: {
      options: [
        [
          { code: 'expand', name: '展开节点', disabled: false },
          { code: 'contract', name: '收缩节点', disabled: false },
          { code: 'create', name: '添加下级', disabled: false },
        ],
      ],
    },
    visibleMethod({ row, type, options }) {
      const $table = xGrid.value;
      if ($table && type === 'body') {
        options.forEach((list) => {
          list.forEach((item) => {
            if (item.code === 'expand' || item.code === 'contract') {
              if (row && row.children && row.children.length > 0) {
                const isExpand = $table.isTreeExpandByRow(row);
                item.disabled = item.code === 'expand' ? isExpand : !isExpand;
              } else {
                item.disabled = true;
              }
            }
          });
        });
      }
      return true;
    },
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
    if ($grid) {
      switch (code) {
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
          batchSelectDisable(
            ids,
            () => {
              reloadTable();
              $grid.setAllCheckboxRow(false);
            },
            dialog,
          );
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
          batchSelectEnable(
            ids,
            () => {
              reloadTable();
              $grid.setAllCheckboxRow(false);
            },
            dialog,
          );
          break;
        }
        case 'create': {
          formDrawerApi.setData({
            // 表单值
            values: {},
            isUpdate: false,
          });
          formDrawerApi.open();
          break;
        }
        case 'myExport': {
          $grid.exportData({
            type: 'csv',
          });
          break;
        }
        case 'myInsert': {
          $grid.insert({
            name: 'xxx',
          });
          break;
        }
        case 'mySave': {
          const { insertRecords, removeRecords, updateRecords } =
            $grid.getRecordset();
          VXETable.modal.message({
            content: `新增2 ${insertRecords.length} 条，删除 ${removeRecords.length} 条，更新 ${updateRecords.length} 条`,
            status: 'success',
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
          batchSelectRecovery(
            ids,
            () => {
              reloadTable();
              $grid.setAllCheckboxRow(false);
            },
          );
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
          batchSelectPhysicalDeletion(
            ids,
            () => {
              reloadTable();
              $grid.setAllCheckboxRow(false);
            },
          );
          break;
        }
      }
    }
  },
  toolbarToolClick({ code }) {
    const $grid = xGrid.value;
    if ($grid) {
      switch (code) {
        case 'myInsert': {
          $grid.insert({
            name: 'xxx',
          });
          break;
        }
        case 'myPrint': {
          $grid.print();
          break;
        }
        case 'mySave': {
          const { insertRecords, removeRecords, updateRecords } =
            $grid.getRecordset();
          VXETable.modal.message({
            content: `新增 ${insertRecords.length} 条，删除 ${removeRecords.length} 条，更新 ${updateRecords.length} 条`,
            status: 'success',
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
          batchSelectPhysicalDeletion(
            ids,
            () => {
              reloadTable();
              $grid.setAllCheckboxRow(false);
            },
          );
          break;
        }
      }
    }
  },
  menuClick({ menu, row, column }){
    const $grid = xGrid.value;
    if ($grid) {
      switch (menu.code) {
        case 'contract':
          $grid.setTreeExpand(row, false);
          break;
        case 'expand':
          $grid.setTreeExpand(row, true);
          break;
        case 'hideCurrColumn':
          $grid.hideColumn(column);
          break;
        case 'showAllColumn':
          $grid.resetColumn();
          break;
        case 'create':
          //添加下级
          formDrawerApi.setData({
            // 表单值
            values: {},
            parent: row,
            isUpdate: false,
          });
          formDrawerApi.open();
          break;
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
const editRowEvent = (row: RowVO) => {
  formDrawerApi.setData({
    // 表单值
    values: row,
    isUpdate: true,
  });
  formDrawerApi.open();
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

onMounted(() => {

});

/**
 * 重新加载
 */
function reloadTable() {
  formParam.state = 0;
  const $grid = xGrid.value;
  if ($grid) {
    $grid.commitProxy('query');

    setTimeout(()=>{
      $grid.setAllTreeExpand(true);
    }, 900)
  }
}

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Edit,
});
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

        <!--        <vxe-button type="text" size="small" status="primary" icon="vxe-icon-ellipsis-v" transfer>-->
        <!--          <template #dropdowns>-->
        <!--            <vxe-button content="打印" @click="triggerProxy('myPrint')"/>-->
        <!--            <vxe-button content="插入" @click="triggerProxy('myInsert')"/>-->
        <!--            <vxe-button content="保存" @click="triggerProxy('mySave')"/>-->
        <!--            <vxe-button content="保存" @click="triggerProxy('save')"  status="success"/>-->
        <!--          </template>-->
        <!--        </vxe-button>-->
      </template>
    </vxe-grid>
    <FormDrawer @ok="reloadTable" />
  </div>
</template>

<style scoped></style>
