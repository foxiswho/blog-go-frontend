<script setup lang="ts">
import {type RowVO, SexOptions, stateYesNoOption} from '@pg/types';

import {computed, onMounted, reactive, ref, toRaw} from 'vue';

import {$t} from "@vben/locales";
import {
  cn,
  isEqual,
} from '@vben/utils';

import { useVbenDrawer, useVbenModal } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';
import { basicTypeDomainFormatter,SexOptionsFormatter,IdentityTypeFormatter } from '@pg/types';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import {message, useVbenForm} from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { selectNodeAllPublic } from '#/viewsRam/department/api';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
} from './api';
import Account from './components/account.vue';
import DrawerEditTpl from './components/DrawerEdit.vue';
import PasswordModal from './components/ModalPassword.vue';
import { columns } from './data';
import {typeCodePublic} from "#/viewsBasic/data-dict/dict/api";
import {Page} from "@vben/common-ui";

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const reloadTreeComputed = computed(() => reloadTreeState.value);

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  // onsole.log('record', record);
  formApiGrid.setFieldValue('departments', [record['key']]);
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
  formApiGrid.setFieldValue('departments', []);
  gridQuerySubmit();
};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
});
const [FormModal, formModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: Account,
});
const [FormModalPassword, formModalApiPassword] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: PasswordModal,
});
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [];

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
      fieldName: 'departments',
      label: '隐藏',
      defaultValue: [],
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
      component: 'Input',
      fieldName: 'account',
      label: '账户',
    },
    {
      component: 'Input',
      fieldName: 'mail',
      label: '邮箱',
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: '手机号',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: '编号',
    },
    {
      fieldName: 'sex',
      label: '性别',
      component: 'PgTreeSelect',
      componentProps: {
        api: typeCodePublic,
        params: 'sex',
        props: {
          placeholder: '请选择',
        },
      },
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
  id: 'full_role',
  // height: '99%',
  minHeight: 800,
  rowConfig: {
    keyField: 'id',
    isHover: true,
  },
  cellConfig:{
    height: 120,
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
  toolbarConfig: {
    buttons: [
      { code: 'createAccount', name: '新增' },
      { code: 'create', name: '新增全量' },
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
          // { code: 'physicalDeletion', name: '物理删除' },
          // {code: 'save', name: '保存', status: 'success'}
        ],
      },
    ],
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
      query: ({ page, sorts, filters, form },formQuery) => {
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
        if(formQuery) {
          for (let key in formQuery) {
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
          batchSelectDisable(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
        // 批量 有效
        case 'batchEnable': {
          const checkboxRecords = $grid.getCheckboxRecords();
          if (checkboxRecords.length <= 0) {
            message.warning('你没有选择任何数据');
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
            message.warning('你没有选择任何数据');
            return;
          }
          batchSelectEnable(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
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
        case 'createAccount': {
          formModalApi.setData({
            // 表单值
            values: {},
            isUpdate: false,
          });
          formModalApi.open();
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
/**
 * 重新查询
 */
async function gridQuery(params: Record<string, any> = {}) {
  try {
    const $grid = xGrid.value;
    if ($grid) {
      $grid.commitProxy('query',toRaw(params));
    }
  }catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}
async function gridQuerySubmit() {
  try {
    const formValues = await formApiGrid.getValues();
    formApiGrid.setLatestSubmissionValues(toRaw(formValues));
    await gridQuery(formValues);
  }catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}

/**
 * 修改密码
 * @param row
 */
function handlePassword(row) {
  formModalApiPassword.setData({
    // 表单值
    values: row,
    isUpdate: true,
  });
  formModalApiPassword.open();
}

/**
 * 修改账号
 * @param row
 */
function handleAccount(row) {
  formModalApi.setData({
    // 表单值
    values: row,
    isUpdate: true,
  });
  formModalApi.open();
}



</script>

<template>
  <Page auto-content-height contentClass="p-2">
    <div class="flex size-full">
      <NCard class="min-w-[160px]" style="width:unset" content-style="padding-left:10px;padding-right:10px;padding-top:10px;">
        <PgTree
          :api="selectNodeAllPublic"
          :is-node-all="true"
          :menu-dropdown-options="menuDropdownOptions"
          :reload="reloadTreeComputed"
          :right-click-menu="false"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </NCard>
      <div class="w-[calc(100%-160px)] ml-2 pl-2 bg-card rounded-md">
        <div :class="
            cn(
              'relative rounded-sm py-3',
              'pb-8',
            )
          ">
          <FormGrid />
          <div
            class="absolute bottom-1 -left-2 z-100 h-2 w-[calc(100%+1rem)] overflow-hidden bg-background-deep md:bottom-2 md:h-3"
          ></div>
        </div>
        <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvent">
          <template #accountAll="{ row }">
            <div>账号:{{ row.account }}</div>
            <div>邮箱:{{ row.mail }}</div>
            <div>编号:{{ row.code }}</div>
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
          <template #osAll="{ row }">
            <div class="text-xs">
              <div>主部门:{{ row.departmentNoName }}</div>
              <div>
                多部门:{{
                  row.os?.noName?.departments
                    ? row.os?.noName?.departments.join(',')
                    : ''
                }}
              </div>
              <div>
                多角色:{{
                  row.os?.noName?.roles
                    ? row.os?.noName?.roles.join(',')
                    : ''
                }}
              </div>
              <div>级别:{{ row.levelNoName }}</div>
              <div>分组:{{ row.groupNoName }}</div>
            </div>
          </template>
          <template #jobAll="{ row }">
            <div class="text-xs">
              <div>职位:{{ row.jobName }}</div>
              <div>岗位:{{ row.positionName }}</div>
              <div>职衔:{{ row.jobTitle }}</div>
              <div>职级:{{ row.jobRank }}</div>
            </div>
          </template>
          <template #typeDomainAll="{ row }">
            <div class="text-xs">
              <div>域:{{ basicTypeDomainFormatter(row.typeDomain) }}</div>
              <div>身份:{{ IdentityTypeFormatter(row.typeIdentity) }}</div>
            </div>
          </template>
          <template #operate="{ row }">
            <VbenTableAction
              :actions="[
                {
                  tooltip:{
                    content: '编辑'
                  },
                  icon: 'lucide:edit',
                  onClick: () => editRowEvent(row),
                },
              ]"
              :dropdown-actions="[
                {
                  text: '删除',
                  icon: 'lucide:trash-2',
                  danger: true,
                  popConfirm: {
                    title: `确定删除 ${row.name} 吗？`,
                    confirm: () => removeRowEvent(row),
                  },
                },
                {
                  text: '修改密码',
                  onClick: () => handlePassword(row),
                },
                {
                  text: '修改账号',
                  onClick: () => handleAccount(row),
                },
              ]"
              align="center"
            />
          </template>
        </vxe-grid>
      </div>
    </div>
    <FormDrawer @ok="reloadTable" />
    <FormModal @ok="reloadTable" />
    <FormModalPassword />
  </Page>
</template>

<style scoped></style>
