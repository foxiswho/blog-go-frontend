<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue';

import { useVbenModal } from '@vben-core/popup-ui';

import {PgTree} from "@pg/components-n";
import {
  basicTypeDomainFormatter,
  IdentityTypeFormatter,
  type RowVO,
  SexOptionsFormatter,
} from '@pg/types';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import { message } from '#/adapter';
import { selectNodeAllPublic } from '#/viewsRam/department/api';

import { List } from '../api';
import {columns, columnsShort} from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = { departments: [] };

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  // onsole.log('record', record);
  formParam.departments = [record['key']];
  reloadTable();
};
/**
 * 重新加载
 */
function reloadTree() {
  reloadTreeState.value++;
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {
  formParam.departments = [];
  reloadTable();
};
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [];

const emit = defineEmits(['ok']);
const xGrid = ref<VxeGridInstance<RowVO>>();
const gridOptions = reactive<VxeGridProps<RowVO>>({
  stripe: true, // 斑马纹
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  id: 'full_role',
  // height: '99%',
  //minHeight: 800,
  rowConfig: {
    keyField: 'id',
    isHover: true,
  },
  cellConfig: {
    //height: 120,
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
      {
        field: 'state',
        title: '状态',
        span: 6,
        resetValue: '1',
        folding: false,
        itemRender: {
          name: '$select',
          defaultValue: '1',
          options: [
            { label: '有效', value: '1' },
            { label: '停用', value: '2' },
            { label: '弃置', value: '12' },
            { label: '取消', value: '11' },
          ],
          props: { disabled: true },
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
          for (let key in formParam) {
            queryParams[key] = formParam[key];
          }
        }
        return List(queryParams);
      },
    },
  },
  columns:columnsShort,
  checkboxConfig: {
    labelField: 'id',
    reserve: true,
    highlight: true,
    range: true,
  },
});

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

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    const $grid = xGrid.value;
    if ($grid) {
      const { number } = modalApi.getData<Record<string, any>>();
      const checkboxRecords = $grid.getCheckboxRecords();
      if (checkboxRecords.length <= 0) {
        message.warning('你没有选择任何数据');
        return;
      }
      if (checkboxRecords.length > number) {
        message.warning('超过规定的条数');
        return;
      }
      emit('ok', checkboxRecords);
      modalApi.setData({ rows: checkboxRecords });
      modalApi.close();
    }
    return true;
  },
  onOpenChange(isOpen: boolean) {
    let title = '选择用户';
    modalApi.setState({ title });
  },
  title: '：',
});
</script>

<template>
  <Modal class="w-[1100px]">
    <NLayout class="h-full p-2" has-sider>
      <NLayoutSider class="min-w-[160px]" width="160">
        <PgTree
          :api="selectNodeAllPublic"
          :is-node-all="true"
          :menu-dropdown-options="menuDropdownOptions"
          :reload="reloadTreeComputed"
          :right-click-menu="false"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </NLayoutSider>
      <NLayout class="w-[calc(100%-160px)]">
        <NLayoutContent>
      <vxe-grid ref="xGrid" v-bind="gridOptions">
        <template #accountAll="{ row }">
          <div>账号:{{ row.account }}</div>
          <div>邮箱:{{ row.mail }}</div>
          <div>编号:{{ row.no }}</div>
        </template>
        <template #nameAll="{ row }">
          <div class="text-xs">
            <div>名称:{{ row.name }}</div>
            <div>真实姓名:{{ row.realName }}</div>
            <div>注册时间:{{ row.registerTime }}</div>
            <div>登陆时间:{{ row.loginTime }}</div>
            <div>性别:{{ SexOptionsFormatter(row.sex) }}</div>
          </div>
        </template>
      </vxe-grid>
        </NLayoutContent>
      </NLayout>
    </NLayout>
  </Modal>
</template>

<style scoped></style>
