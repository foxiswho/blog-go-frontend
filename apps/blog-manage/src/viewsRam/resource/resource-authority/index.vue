<script setup lang="ts">
import type { RowVO } from '@pg/types';

import { computed, onMounted, reactive, ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import { message } from '#/adapter';
import { selectPublic } from '#/viewsRam/resource/group/api';

import Category from '../group/components/category.vue';
import ResourceList from '../resource/invoke/list.vue';
import {
  batchSelectPhysicalDeletion,
  createByGroup,
  deleteIds,
  List,
} from './api';
import Edit from './components/edit.vue';
import { columns } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const tabSelectActive = ref('system');
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = { typeValue: '', typeCategory: 'group' };

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  // console.log('record', record);
  formParam.typeValue = record.key;
  reloadTable();
};
/**
 * 重新加载
 */
function reloadTree() {
  reloadTreeState.value = true;
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {
  currenRecord.value = false;
  currenData.value = {};
  formParam.typeValue = '';
  reloadTable();
};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Edit,
});

const [FormModal, formModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: Category,
});
const [FormModalResource, formModalApiResource] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ResourceList,
});
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [
  {
    label: '添加',
    key: '添加',
    props: {
      onClick: () => {
        formModalApi.setData({
          // 表单值
          values: {},
          isUpdate: false,
        });
        formModalApi.open();
      },
    },
  },
];

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
    keyField: 'id',
    isHover: true,
  },
  columnConfig: {
    resizable: true,
  },
  printConfig: {
    columns: [
      { field: 'name' },
      { field: 'nameFl' },
      { field: 'code' },
      { field: 'state' },
      { field: 'createAt' },
    ],
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
      // {
      //   field: 'state',
      //   title: '状态',
      //   span: 6,
      //   folding: false,
      //   itemRender: {
      //     name: '$select',
      //     options: [
      //       { label: '停用', value: '2' },
      //       { label: '有效', value: '1' },
      //       { label: '弃置', value: '12' },
      //       { label: '取消', value: '11' },
      //     ],
      //     props: { clearable: true },
      //   },
      // },
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
      { code: 'selectResource', name: '选择' },
      { code: 'physicalDeletion', name: '批量删除' },
      // { code: 'batchDisable', name: '批量停用' },
    ],
    slots: {
      // buttons: 'toolbar_buttons',
      // tools: 'toolbar_tools'
    },
    tools: [],
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
          for (const key in formParam) {
            queryParams[key] = formParam[key];
          }
        }
        return List(queryParams);
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
          message.warning('你没有选择任何数据');
          return Promise.resolve();
        }
        return deleteIds(ids).then(() => {
          reloadTable();
        });
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
    if ($grid) {
      switch (code) {
        // 批量 物理删除
        case 'physicalDeletion': {
          const checkboxRecords = $grid.getCheckboxRecords();
          if (checkboxRecords.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          const ids = [];
          checkboxRecords.forEach((item) => {
            ids.push(item.id);
            $grid.setCheckboxRow(item, false);
          });
          if (ids.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          batchSelectPhysicalDeletion(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
        case 'selectResource': {
          if (formParam.typeValue) {
            formModalApiResource.setData({
              // 表单值
              values: {},
              rows: [],
              isUpdate: false,
            });
            formModalApiResource.open();
          } else {
            message.warning('你没有选择资源组');
          }
          break;
        }
      }
    }
  },
  toolbarToolClick({ code }) {},
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
  const $grid = xGrid.value;
  batchSelectPhysicalDeletion([row.id], () => {
    $grid.remove(row);
  });
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

function treeChangOverload() {
  reloadTable();
  treeOverload();
}

/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [
    {
      label: '修改',
      key: '修改',
      props: {
        onClick: () => {
          formModalApi.setData({
            // 表单值
            values: option.data,
            isUpdate: true,
          });
          formModalApi.open();
        },
      },
    },
  ];
};
function selectResourceOk(rows) {
  console.log('rows', rows);
  if (formParam.typeValue) {
    if (!rows || rows <= 0) {
      message.warning('你没有选择资源数据');
      return;
    }
    createByGroup({
      groupId: formParam.typeValue,
      ids: rows.map((item) => item.id),
    }).then(() => {
      setTimeout(() => {
        reloadTable();
      }, 3000);
    });
  } else {
    message.warning('你没有选择资源组');
  }
}
</script>

<template>
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
          <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvent">
            <template #nameAll="{ row }">
              <div>
                {{row.name}}
              </div>
              <div>
                {{row.path}}
              </div>
            </template>
            <template #operate="{ row }">
              <vxe-button
                icon="vxe-icon-delete"
                mode="text"
                status="danger"
                title="删除"
                @click="removeRowEvent(row)"
              />
            </template>
          </vxe-grid>
        </NLayoutContent>
      </NLayout>
      <FormDrawer @ok="reloadTable"/>
      <FormModal @ok="treeChangOverload" />
    </NLayout>
    <FormModalResource @ok="selectResourceOk" />
  </div>
</template>

<style scoped></style>
