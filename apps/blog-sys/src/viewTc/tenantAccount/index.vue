<script setup lang="ts">
import type { RowVO } from '@pg/types';
import type {
  VxeGridInstance,
  VxeGridListeners,
  VxeGridProps,
} from 'vxe-table';

import type { Recordable } from '@vben-core/typings';

import { computed, onMounted, reactive, ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';
import {
  basicTypeDomainFormatter,
  IdentityTypeFormatter,
  SexOptionsFormatter,
  state,
} from '@pg/types';
import { VXETable } from 'vxe-table';

import { message, usePgForm } from '#/adapter';
import {
  selectNodeAllPublic as departmentNode,
  selectPublic,
} from '#/viewsRam/department/api';
import { selectNodeAllPublic as groupNode } from '#/viewsRam/group/api';
import { selectNodeAllPublic as levelNode } from '#/viewsRam/level/api';
import { selectNodeAllPublic as positionNode } from '#/viewsRam/position/api';
import { selectNodeAllPublic as postNode } from '#/viewsRam/post/api';
import { selectNodeAllPublic as roleNode } from '#/viewsRam/role/api';
import { selectNodeAllPublic as teamNode } from '#/viewsRam/team/api';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
} from './api';
import DrawerEditTpl from './components/DrawerEdit.vue';
import ModalAccountTpl from './components/ModalAccount.vue';
import ModalPasswordTpl from './components/ModalPassword.vue';
import { columns } from './data';
import { useRouter } from 'vue-router';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const reloadTreeComputed = computed(() => reloadTreeState.value);
let formParam = { departments: [] };
const router = useRouter();
const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  console.log('record', record);
  formParam.departments = [record.data.no];
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
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
});
const [ModalAccount, modalApiAccount] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ModalAccountTpl,
});
const [ModalPassword, modalApiPassword] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ModalPasswordTpl,
});
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [];

const [Form, formApi] = usePgForm({
  tabs: {
    hide: true,
    active: 'home',
    group: [{ value: 'home', label: '基础信息' }],
  },
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  actionWrapperClass: 'text-center',
  schema: [
    {
      tabGroup: 'home',
      fieldName: 'wd',
      label: '关键词',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'account',
      label: '账号',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'mail',
      label: '邮箱',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'phone',
      label: '手机号',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'tenantNo',
      label: '租户编号',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'code',
      label: '编号',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'departments',
      label: '部门',
      component: 'PgTreeSelect',
      componentProps: {
        api: departmentNode,
        params: { by: 'no' },
        props: {
          multiple: true,
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'roles',
      label: '角色',
      component: 'PgTreeSelect',
      componentProps: {
        api: roleNode,
        params: { by: 'no' },
        props: {
          multiple: true,
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'levels',
      label: '级别',
      component: 'PgTreeSelect',
      componentProps: {
        api: levelNode,
        params: { by: 'no' },
        props: {
          multiple: true,
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'groups',
      label: '分组',
      component: 'PgTreeSelect',
      componentProps: {
        api: groupNode,
        params: { by: 'no' },
        props: {
          multiple: true,
          placeholder: '请选择',
        },
      },
    },

    {
      tabGroup: 'home',
      fieldName: 'teams',
      label: '团队',
      component: 'PgTreeSelect',
      componentProps: {
        api: teamNode,
        params: { by: 'no' },
        props: {
          multiple: true,
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'position',
      fieldName: 'job',
      label: '职位',
      component: 'PgTreeSelect',
      componentProps: {
        api: postNode,
        params: { by: 'no' },
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'state',
      label: '状态',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: state,
        clearable: true,
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'position',
      label: '职务',
      component: 'PgTreeSelect',
      componentProps: {
        api: positionNode,
        params: { by: 'no' },
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'job',
      label: '职位',
      component: 'PgTreeSelect',
      componentProps: {
        api: postNode,
        params: { by: 'no' },
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'jobTitle',
      label: '职衔',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'jobRank',
      label: '职级',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'registerTimeRange',
      label: '注册时间',
      component: 'PgDatePicker',
      special: 'DatePicker',
      componentProps: {
        clearable: true,
        isTimestamp: false,
        type: 'datetimerange',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
        // formattedValue:'2022-11-10 11:11:11',
        // defaultValue:'2022-11-10 11:11:11',
        shortcuts: {
          昨天: () => Date.now() - 24 * 60 * 60 * 1000,
        },
        // onUpdateValue: ( value, formattedValue ) => {
        //   console.log('OnUpdateValue', value, formattedValue)
        //   formApi.setFieldValue('registerTime', dayjs(formattedValue));
        // },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'loginTimeRange',
      label: '登陆时间',
      component: 'PgDatePicker',
      special: 'DatePicker',
      componentProps: {
        clearable: true,
        isTimestamp: false,
        type: 'datetimerange',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
        // formattedValue:'2022-11-10 11:11:11',
        // defaultValue:'2022-11-10 11:11:11',
        shortcuts: {
          昨天: () => Date.now() - 24 * 60 * 60 * 1000,
        },
        // onUpdateValue: ( value, formattedValue ) => {
        //   console.log('OnUpdateValue', value, formattedValue)
        //   formApi.setFieldValue('registerTime', dayjs(formattedValue));
        // },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'birthdayRange',
      label: '生日',
      component: 'PgDatePicker',
      special: 'DatePicker',
      componentProps: {
        clearable: true,
        isTimestamp: false,
        type: 'daterange',
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
        // formattedValue:'2022-11-10 11:11:11',
        // defaultValue:'2022-11-10 11:11:11',
        shortcuts: {
          昨天: () => Date.now() - 24 * 60 * 60 * 1000,
        },
        // onUpdateValue: ( value, formattedValue ) => {
        //   console.log('OnUpdateValue', value, formattedValue)
        //   formApi.setFieldValue('registerTime', dayjs(formattedValue));
        // },
      },
    },
  ],
  handleSubmit: onSubmit,
});
/**
 * 提交
 */
async function onSubmit(values: Record<string, any>) {
  console.log('values', values);
  formParam = {
    ...values,
  };
  reloadTable();
}

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
  cellConfig: {
    height: 140,
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
          for (const key in formParam) {
            if (formParam[key]) {
              queryParams[key] = formParam[key];
            }
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
          drawerApi.setData({
            // 表单值
            values: {},
            isUpdate: false,
          });
          drawerApi.open();
          break;
        }
        case 'createAccount': {
          modalApiAccount.setData({
            // 表单值
            values: {},
            isUpdate: false,
          });
          modalApiAccount.open();
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

onMounted(() => {
  if (router.currentRoute.value.query.tenantNo) {
    formApi.setFieldValue('tenantNo', router.currentRoute.value.query.tenantNo);

    setTimeout(() => {
      formApi.submitForm();
    }, 500);
  }
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

/**
 * 修改密码
 * @param row
 */
function handlePassword(row) {
  modalApiPassword.setData({
    // 表单值
    values: row,
    isUpdate: true,
  });
  modalApiPassword.open();
}

/**
 * 修改账号
 * @param row
 */
function handleAccount(row) {
  modalApiAccount.setData({
    // 表单值
    values: row,
    isUpdate: true,
  });
  modalApiAccount.open();
}
function modalReload(opt) {
  console.log('opt', opt);
  reloadTable();
}
</script>

<template>
  <NLayout class="h-full p-2" has-sider>
    <NLayoutSider class="min-w-[160px]" width="160">
      <PgTree
        :api="selectPublic"
        :menu-dropdown-options="menuDropdownOptions"
        :reload="reloadTreeComputed"
        :right-click-menu="false"
        @ok="treeChang"
        @overload="treeOverload"
      />
    </NLayoutSider>
    <NLayout class="w-[calc(100%-160px)]">
      <NLayoutContent>
        <Form />
        <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvent">
          <template #tenantAll="{ row }">
            <div>
              {{ row.tenantNoName }}
            </div>
            <div>
              {{ row.tenantNo }}
            </div>
          </template>
          <template #accountAll="{ row }">
            <div>
              <n-tag type="success" :bordered="false">账号</n-tag>
              {{ row.account }}
            </div>
            <div>
              <n-tag type="warning" :bordered="false">邮箱</n-tag>
              {{ row.mail }}
            </div>
            <div>
              <n-tag type="info" :bordered="false">编号</n-tag> {{ row.code }}
            </div>
            <div>
              <n-tag type="warning" :bordered="false">手机号</n-tag> ({{
                row.cc
              }}) {{ row.phone }}
            </div>
          </template>
          <template #nameAll="{ row }">
            <div class="text-xs">
              <div>
                <n-tag :bordered="false" size="small">名称</n-tag>
                {{ row.name }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">真实姓名</n-tag>
                {{ row.realName }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">注册时间</n-tag>
                {{ row.registerTime }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">登陆时间</n-tag>
                {{ row.loginTime }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">性别</n-tag>
                {{ SexOptionsFormatter(row.sex) }}
              </div>
            </div>
          </template>
          <template #osAll="{ row }">
            <div class="text-xs">
              <div>
                <n-tag :bordered="false" size="small">主部门</n-tag>
                {{ row.departmentNoName }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">多部门</n-tag>
                {{
                  row.os?.noName?.departments
                    ? row.os?.noName?.departments.join(',')
                    : ''
                }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">角色</n-tag>
                {{
                  row.os?.noName?.roles ? row.os?.noName?.roles.join(',') : ''
                }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">主级别</n-tag>
                {{ row.levelNoName }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">多级别</n-tag>
                {{
                  row.os?.noName?.levels ? row.os?.noName?.levels.join(',') : ''
                }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">分组</n-tag>
                {{
                  row.os?.noName?.groups ? row.os?.noName?.groups.join(',') : ''
                }}
              </div>
            </div>
          </template>
          <template #jobAll="{ row }">
            <div class="text-xs">
              <div>
                <n-tag :bordered="false" size="small">职位</n-tag>
                {{ row.jobName }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">岗位</n-tag>
                {{ row.positionName }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">职衔</n-tag>
                {{ row.jobTitle }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">职级</n-tag>
                {{ row.jobRank }}
              </div>
            </div>
          </template>
          <template #typeDomainAll="{ row }">
            <div class="text-xs">
              <div>
                <n-tag type="warning" :bordered="false">域</n-tag>
                {{ basicTypeDomainFormatter(row.typeDomain) }}
              </div>
              <div>
                <n-tag :bordered="false" size="small">身份</n-tag>
                {{ IdentityTypeFormatter(row.typeIdentity) }}
              </div>
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
            <!--            <vxe-button-->
            <!--              icon="vxe-icon-delete"-->
            <!--              mode="text"-->
            <!--              status="danger"-->
            <!--              title="删除"-->
            <!--              @click="removeRowEvent(row)"-->
            <!--            />-->

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
    <Drawer @ok="reloadTable" />
    <ModalAccount @ok="reloadTable" />
    <ModalPassword />
  </NLayout>
</template>

<style scoped></style>
