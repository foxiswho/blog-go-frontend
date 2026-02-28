<script setup lang="ts">
import type { RowVO } from '@pg/types';

import { computed, onMounted, reactive, ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben-core/popup-ui';
import type { Recordable } from '@vben/types';
import { PgTree } from '@pg/components-n';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import { message } from '#/adapter';

import { deleteIds, List } from '../api';
import {
  selectNodeAllPublic,
  selectPublic,
} from '#/viewsBlog/articleCategory/api';
import { columns } from './data';
const emit = defineEmits(['ok']);

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const tabSelectActive = ref('system');
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = { parentId: '' };

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  // console.log('record', record);
  formParam.parentId = record.key;
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
  formParam.parentId = '';
  reloadTable();
};
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [];

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
        span: 12,
        itemRender: {
          name: '$input',
          props: { placeholder: '请输入', clearable: true },
        },
      },
      {
        field: 'state',
        title: '状态',
        span: 12,
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
      }
    }
  },
  toolbarToolClick({ code }) {
    const $grid = xGrid.value;
  },
};

const hasActiveEditRow = (row: RowVO) => {
  const $grid = xGrid.value;
  if ($grid) {
    return $grid.isEditByRow(row);
  }
  return false;
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

function treeChangOverload() {
  reloadTable();
  treeOverload();
}

/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [];
};

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    // 获取选中数据
    const $grid = xGrid.value;
    const checkboxRecords = $grid.getCheckboxRecords();
    if (checkboxRecords.length <= 0) {
      message.warning('你没有选择任何数据');
      return false;
    }
    emit('ok', checkboxRecords);
    modalApi.setData({ rows: checkboxRecords });
    modalApi.close();
    return true;
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalApi.setState({ title: `选择：话题` });
    }
  },
  title: '：',
});
</script>

<template>
  <Modal class="w-[1200px]">
    <div>
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
                  {{ row.name }}
                </div>
                <div>
                  {{ row.path }}
                </div>
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
                      <n-gi> 标签：{{ row.tags }} </n-gi>
                      <n-gi> 操作时间：{{ row.operationTime }} </n-gi>
                    </n-grid>
                  </dd>
                </dl>
              </template>
            </vxe-grid>
          </NLayoutContent>
        </NLayout>
      </NLayout>
    </div>
  </Modal>
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
