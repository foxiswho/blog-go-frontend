<script setup lang="ts">
import type { RowVO } from '@pg/types';
import type {
  VxeGridInstance,
  VxeGridListeners,
  VxeGridProps,
} from 'vxe-table';

import type { Recordable } from '@vben/types';

import { computed, onMounted, reactive, ref, toRaw } from 'vue';

import { Page } from '@vben/common-ui';
import { cn, isEqual } from '@vben/utils';

import { useVbenDrawer, useVbenModal } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';
import { stateYesNoOption } from '@pg/types';

import { dialog, message, useVbenForm } from '#/adapter';
import { VbenTableAction } from '#/adapter/vxe-table';
import {
  deletePhysicalDeletion as groupDeletePhysicalDeletion,
  selectNodeAllPublic,
} from '#/viewsRam/resource/group/api';

import ResourceList from '../resource/invoke/list.vue';
import {
  batchSelectPhysicalDeletion,
  createByGroup,
  deleteIds,
  List,
} from './api';
import Category from './components/category.vue';
import Edit from './components/edit.vue';
import { columns } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const tabSelectActive = ref('system');
const reloadTreeComputed = computed(() => reloadTreeState.value);

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record.data;
  console.log('record', record);
  formApiGrid.setFieldValue('typeValue', record.key);
  gridQuerySubmit();
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
  formApiGrid.setFieldValue('parentNo', null);
  gridQuerySubmit();
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

const [FormGrid, formApiGrid] = useVbenForm({
  // fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  compact: true,
  submitButtonOptions: {
    content: '查询',
  },
  // 默认展开
  collapsed: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  handleSubmit: async () => {
    const formValues = await formApiGrid.getValues();
    formApiGrid.setLatestSubmissionValues(toRaw(formValues));
    gridQuery(formValues);
  },
  handleReset: async () => {
    const prevValues = await formApiGrid.getValues();
    await formApiGrid.resetForm();
    const formValues = await formApiGrid.getValues();
    formApiGrid.setLatestSubmissionValues(formValues);
    // 如果值发生了变化，submitOnChange会触发刷新。所以只在submitOnChange为false或者值没有发生变化时，手动刷新
    if (!isEqual(prevValues, formValues)) {
      gridQuery(formValues);
    }
  },
  schema: [
    {
      fieldName: 'typeValue',
      label: '隐藏',
      defaultValue: null,
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['wd'],
      },
    },
    {
      fieldName: 'typeCategory',
      label: '隐藏',
      defaultValue: 'group',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['wd'],
      },
    },
    {
      component: 'Input',
      fieldName: 'wd',
      label: '关键词',
    },
    {
      fieldName: 'state',
      label: '状态',
      component: 'Select',
      componentProps: {
        clearable: true,
        options: stateYesNoOption,
      },
    },
  ],
});

const xGrid = ref<VxeGridInstance<RowVO>>();
const gridOptions = reactive<VxeGridProps<RowVO>>({
  stripe: true, // 斑马纹
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  height: 'auto',
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
    remote: false,
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
      query: ({ page, sorts, filters, form }, formQuery) => {
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
        // 表单 和 左侧查询
        if (formQuery) {
          for (const key in formQuery) {
            queryParams[key] = formQuery[key];
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
          gridQuerySubmit();
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
  async toolbarButtonClick({ code }) {
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
          const formValues = await formApiGrid.getValues();
          if (formValues.typeValue) {
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
};

const editRowEvent = (row: RowVO) => {
  formDrawerApi.setData({
    // 表单值
    values: row,
    isUpdate: true,
  });
  formDrawerApi.open();
};

/**
 * 删除 指定行数据
 * @param row
 */
const removeRowEvent = async (row: RowVO) => {
  const $grid = xGrid.value;
  if ($grid) {
    deleteIds([row.id]);
    await $grid.remove(row);
  }
};
/**
 * 删除 指定数据
 * @param row
 */
const removeTreeEvent = (row: RowVO) => {
  dialog.warning({
    title: '确认删除',
    content: `是否[删除]选中数据[ ${row.name} ]，操作后数据不可恢复`,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      groupDeletePhysicalDeletion([row.id]).then(() => {
        treeChangOverload();
      });
    },
  });
};

onMounted(() => {});

/**
 * 重新查询
 */
async function gridQuery(params: Record<string, any> = {}) {
  try {
    const $grid = xGrid.value;
    if ($grid) {
      $grid.commitProxy('query', toRaw(params));
    }
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}
async function gridQuerySubmit() {
  try {
    const formValues = await formApiGrid.getValues();
    formApiGrid.setLatestSubmissionValues(toRaw(formValues));
    await gridQuery(formValues);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}
function treeChangOverload() {
  reloadTree();
  setTimeout(() => {
    gridQuerySubmit();
  }, 1000);
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
    {
      label: '添加下级',
      key: '添加下级',
      props: {
        onClick: () => {
          formModalApi.setData({
            // 表单值
            values: {},
            parent: option?.data,
            isUpdate: false,
          });
          formModalApi.open();
        },
      },
    },
    {
      label: '删除',
      key: '删除',
      props: {
        onClick: () => {
          removeTreeEvent(option.data);
        },
      },
    },
  ];
};
async function selectResourceOk(rows) {
  console.log('rows', rows);
  const formValues = await formApiGrid.getValues();
  if (formValues.typeValue) {
    if (!rows || rows <= 0) {
      message.warning('你没有选择资源数据');
      return;
    }
    createByGroup({
      groupNo: formValues.typeValue,
      ids: rows.map((item) => item.no),
    }).then(() => {
      setTimeout(() => {
        gridQuerySubmit();
      }, 3000);
    });
  } else {
    message.warning('你没有选择资源组');
  }
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <div class="flex size-full">
      <NCard
        class="min-w-[160px]"
        style="width: unset"
        content-style="padding-left:10px;padding-right:10px;padding-top:10px;"
      >
        <PgTree
          :api="selectNodeAllPublic"
          :is-node-all="true"
          :menu-dropdown-options="menuDropdownOptions"
          :reload="reloadTreeComputed"
          :right-click-menu="true"
          :right-click-menu-options="rightClickMenuOptions"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </NCard>
      <div class="w-[calc(100%-160px)] ml-2 pl-2 bg-card rounded-md">
        <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvent">
          <template #form>
            <div>
              当前 选中：<n-tag type="success" v-if="currenData.name">
{{
                currenData.name
              }}
</n-tag>
            </div>
            <div :class="cn('relative rounded-sm py-3', 'pb-8')">
              <FormGrid />
              <div
                class="absolute bottom-1 -left-2 z-100 h-2 w-[calc(100%+1rem)] overflow-hidden bg-background-deep md:bottom-2 md:h-3"
              ></div>
            </div>
          </template>
          <template #nameAll="{ row }">
            <div>
              {{ row.name }}
            </div>
            <div>
              {{ row.path }}
            </div>
          </template>
          <template #operate="{ row }">
            <VbenTableAction
              :actions="[
                {
                  tooltip: {
                    content: '删除',
                  },
                  icon: 'lucide:trash-2',
                  danger: true,
                  popConfirm: {
                    title: `确定删除 ${row.name} 吗？`,
                    confirm: () => removeRowEvent(row),
                  },
                },
              ]"
              align="center"
            />
          </template>
        </vxe-grid>
      </div>
      <FormDrawer />
      <FormModal @ok="treeChangOverload" />
    </div>
    <FormModalResource @ok="selectResourceOk" />
  </Page>
</template>

<style scoped></style>
