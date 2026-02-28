<script setup lang="ts">
import type { RowVO } from '@pg/types';

import { computed, onMounted, reactive, ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';
import { basicTypeDomainFormatter,SexOptionsFormatter,IdentityTypeFormatter } from '@pg/types';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import { message } from '#/adapter';
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
import Edit from './components/DrawerEdit.vue';
import PasswordModal from './components/ModalPassword.vue';
import { columns } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
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
  reloadTreeState.value = true;
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {
  formParam.departments = [];
  reloadTable();
};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Edit,
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
    height: 120,
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
        field: 'account',
        title: '账户',
        span: 6,
        itemRender: { name: '$input', props: { placeholder: '请输入' } },
      },
      {
        field: 'mail',
        title: '邮箱',
        span: 6,
        itemRender: { name: '$input', props: { placeholder: '请输入邮箱' } },
      },
      {
        field: 'phone',
        title: '手机号',
        span: 6,
        itemRender: { name: '$input', props: { placeholder: '请输入手机号' } },
      },
      {
        field: 'code',
        title: '编号',
        span: 6,
        itemRender: { name: '$input', props: { placeholder: '请输入编号' } },
      },
      {
        field: 'departments',
        title: '部门',
        span: 6,
        visible: false,
        itemRender: { name: '$input', props: { placeholder: '请选择' } },
      },
      {
        field: 'groupId',
        title: '组',
        span: 6,
        itemRender: { name: '$input', props: { placeholder: '请选择' } },
      },
      {
        field: 'roles',
        title: '角色',
        span: 6,
        itemRender: { name: '$input', props: { placeholder: '请选择' } },
      },
      {
        field: 'sex',
        title: '性别',
        span: 6,
        folding: false,
        itemRender: {
          name: '$select',
          options: [
            { label: '女', value: '2' },
            { label: '男', value: '1' },
          ],
          props: { clearable: true },
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
      { code: 'createAccount', name: '新增账号' },
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
          // {code: 'save', name: '保存', status: 'success'}
        ],
      },
    ],
    slots: {
      // buttons: 'toolbar_buttons',
      // tools: 'toolbar_tools'
    },
    tools: [
      {
        name: '更多',
        status: 'primary',
        size: 'small',
        toolRender: {
          props: { className: 'mr-2', class: 'mr-2', popupClassName: 'mr-2' },
          attrs: { className: 'mr-2', class: 'mr-2' },
          name: '$buttons',
        },
        dropdowns: [
          // {code: 'delete', name: '直接删除'},
          // {code: 'mark_cancel', name: '标记[删除/取消]'},
          // {code: 'myInsert', name: '插入'},
          // {code: 'mySave', name: '保存'},
          { code: 'myPrint', name: '打印' },
          { code: 'physicalDeletion', name: '物理删除' },
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
        if (formParam) {
          for (let key in formParam) {
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
  importConfig: {
    remote: true,
    types: ['xlsx'],
    modes: ['insert'],
    // 自定义服务端导入
    importMethod({ file }) {
      const $grid = xGrid.value;
      const formBody = new FormData();
      formBody.append('file', file);
      return fetch(`/api/pub/import`, { method: 'POST', body: formBody })
        .then((response) => response.json())
        .then((data) => {
          VXETable.modal.message({
            content: `成功导入 ${data.result.insertRows} 条记录！`,
            status: 'success',
          });
          // 导入完成，刷新表格
          if ($grid) {
            $grid.commitProxy('query');
          }
        })
        .catch(() => {
          VXETable.modal.message({
            content: '导入失败，请检查数据是否正确！',
            status: 'error',
          });
        });
    },
  },
  exportConfig: {
    remote: true,
    types: ['xlsx'],
    modes: ['current', 'selected', 'all'],
    // 自定义服务端导出
    exportMethod({ options }) {
      return Promise.resolve();
    },
  },
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
          console.log('$grid.getCheckboxRecords()', $grid.getCheckboxRecords());
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
              <div>主部门:{{ row.departmentIdName }}</div>
              <div>
                多部门:{{
                  row.os?.codeName?.departments
                    ? row.os?.codeName?.departments.join(',')
                    : ''
                }}
              </div>
              <div>主角色:{{ row.roleIdName }}</div>
              <div>
                多角色:{{
                  row.os?.codeName?.roles
                    ? row.os?.codeName?.roles.join(',')
                    : ''
                }}
              </div>
              <div>级别:{{ row.levelIdName }}</div>
              <div>分组:{{ row.groupIdName }}</div>
            </div>
          </template>
          <template #jobAll="{ row }">
            <div class="text-xs">
              <div>职位:{{ row.job }}</div>
              <div>岗位:{{ row.position }}</div>
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
            <template v-if="hasActiveEditRow(row)">
              <vxe-button content="取消" @click="clearRowEvent" />
              <vxe-button
                content="保存"
                status="primary"
                @click="saveRowEvent(row)"
              />
            </template>
            <template v-else>
              <vxe-button
                icon="vxe-icon-edit"
                mode="text"
                title="编辑"
                @click="editRowEvent(row)"
              />
            </template>
            <vxe-button
              icon="vxe-icon-delete"
              mode="text"
              status="danger"
              title="删除"
              @click="removeRowEvent(row)"
            />

            <vxe-button
              mode="text"
              size="small"
              status="primary"
              icon="vxe-icon-ellipsis-v"
              transfer
            >
              <template #dropdowns>
                <vxe-button content="修改密码" @click="handlePassword(row)" />
                <vxe-button content="修改账号" @click="handleAccount(row)" />
              </template>
            </vxe-button>
          </template>
        </vxe-grid>
      </NLayoutContent>
    </NLayout>
    <FormDrawer />
    <FormModal @ok="reloadTable" />
    <FormModalPassword />
  </NLayout>
</template>

<style scoped></style>
