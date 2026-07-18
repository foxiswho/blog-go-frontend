<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { PgTree } from '@pg/components-n';
import {
  basicTypeDomainFormatter,
  IdentityTypeFormatter,
  SexOptionsFormatter,
  state as stateOptions,
} from '@pg/types';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { selectNodeAllPublic } from '#/viewsRam/department/api';
import { selectNodeAllPublic as groupNode } from '#/viewsRam/group/api';
import { selectNodeAllPublic as levelNode } from '#/viewsRam/level/api';
import { selectNodeAllPublic as positionNode } from '#/viewsRam/position/api';
import { selectNodeAllPublic as postNode } from '#/viewsRam/post/api';
import { selectNodeAllPublic as roleNode } from '#/viewsRam/role/api';
import { selectNodeAllPublic as teamNode } from '#/viewsRam/team/api';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectDelete,
  batchSelectRecovery,
  deleteIds,
  List,
} from './api';
import DrawerEditTpl from './components/DrawerEdit.vue';
import ModalAccountTpl from './components/ModalAccount.vue';
import ModalPasswordTpl from './components/ModalPassword.vue';
import { columns } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record;
  gridApi.formApi.setFieldValue('departments', [record.key]);
  onRefresh();
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
const treeOverload = (_e: any) => {
  gridApi.formApi.setFieldValue('departments', []);
  onRefresh();
};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
  destroyOnClose: true,
});
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: ModalAccountTpl,
  destroyOnClose: true,
});
const [FormModalPassword, formModalApiPassword] = useVbenModal({
  connectedComponent: ModalPasswordTpl,
  destroyOnClose: true,
});
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions: any[] = [];

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        fieldName: 'departments',
        label: '隐藏',
        defaultValue: [],
        component: 'Input',
        componentProps: {},
        dependencies: {
          show: false,
          triggerFields: ['wd'],
        },
      },
      {
        component: 'Input',
        fieldName: 'wd',
        label: '关键词',
        componentProps: {
          placeholder: '请输入',
        },
      },
      {
        component: 'Input',
        fieldName: 'account',
        label: '账号',
        componentProps: {
          placeholder: '请输入',
        },
      },
      {
        component: 'Input',
        fieldName: 'mail',
        label: '邮箱',
        componentProps: {
          placeholder: '请输入',
        },
      },
      {
        component: 'Input',
        fieldName: 'phone',
        label: '手机号',
        componentProps: {
          placeholder: '请输入',
        },
      },
      {
        component: 'Input',
        fieldName: 'code',
        label: '编号',
        componentProps: {
          placeholder: '请输入',
        },
      },
      {
        fieldName: 'departments',
        label: '部门',
        component: 'PgTreeSelect',
        componentProps: {
          api: selectNodeAllPublic,
          params: {},
          props: {
            multiple: true,
            placeholder: '请选择',
          },
        },
      },
      {
        fieldName: 'roleId',
        label: '角色',
        component: 'PgTreeSelect',
        componentProps: {
          api: roleNode,
          params: {},
          props: {
            multiple: true,
            placeholder: '请选择',
          },
        },
      },
      {
        fieldName: 'levelId',
        label: '级别',
        component: 'PgTreeSelect',
        componentProps: {
          api: levelNode,
          convertNode: true,
          params: {},
          props: {
            placeholder: '请选择',
          },
        },
      },
      {
        fieldName: 'groupId',
        label: '分组',
        component: 'PgTreeSelect',
        componentProps: {
          api: groupNode,
          params: {},
          props: {
            placeholder: '请选择',
          },
        },
      },
      {
        fieldName: 'team',
        label: '团队',
        component: 'PgTreeSelect',
        componentProps: {
          api: teamNode,
          params: {},
          props: {
            multiple: true,
            placeholder: '请选择',
          },
        },
      },
      {
        fieldName: 'position',
        label: '职务',
        component: 'PgTreeSelect',
        componentProps: {
          api: positionNode,
          convertNode: true,
          params: {},
          props: {
            placeholder: '请选择',
          },
        },
      },
      {
        fieldName: 'job',
        label: '职位',
        component: 'PgTreeSelect',
        componentProps: {
          api: postNode,
          convertNode: true,
          params: {},
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
          placeholder: '请选择',
          options: stateOptions,
          clearable: true,
        },
      },
      {
        fieldName: 'jobTitle',
        label: '职衔',
        component: 'Input',
      },
      {
        fieldName: 'jobRank',
        label: '职级',
        component: 'Input',
      },
      {
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
          shortcuts: {
            昨天: () => Date.now() - 24 * 60 * 60 * 1000,
          },
        },
      },
      {
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
          shortcuts: {
            昨天: () => Date.now() - 24 * 60 * 60 * 1000,
          },
        },
      },
      {
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
          shortcuts: {
            昨天: () => Date.now() - 24 * 60 * 60 * 1000,
          },
        },
      },
    ],
    submitOnChange: false,
  },
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    cellConfig: {
      height: 120,
    },
    pagerConfig: {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await List({
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      custom: true,
      refresh: true,
      zoom: true,
    },
  } as any,
});
/**
 * 重新查询
 */
async function gridQuery(params: Record<string, any> = {}) {
  try {
    await gridApi.query(params);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}
/**
 * 刷新表格
 */
async function onRefresh() {
  try {
    if (gridApi.state?.formOptions) {
      const formValues = await gridApi.formApi.getValues();
      gridApi.formApi.setLatestSubmissionValues(formValues);
      await gridQuery(formValues);
    } else {
      await gridQuery();
    }
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}

/**
 * 新增全量
 */
function onCreate() {
  formDrawerApi.setData({ values: {}, isUpdate: false }).open();
}

/**
 * 新增
 */
function onCreateAccount() {
  formModalApi.setData({ values: {}, isUpdate: false }).open();
}

/**
 * 编辑
 * @param row 行数据
 */
function onEdit(row: any) {
  formDrawerApi.setData({ values: row, isUpdate: true }).open();
}

/**
 * 删除
 * @param row 行数据
 */
function onDelete(row: any) {
  deleteIds([row.id]).then(() => {
    onRefresh();
  });
}

/**
 * 批量有效
 */
function onBatchEnable() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
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
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 批量停用
 */
function onBatchDisable() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    if (item.state === 1) {
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
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 删除恢复
 */
function onRecovery() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
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
      onRefresh();
      $grid.setAllCheckboxRow(false);
    },
  );
}

/**
 * 删除
 */
function onBatchDelete() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    ids.push(item.id);
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectDelete(
    ids,
    () => {
      onRefresh();
      $grid.setAllCheckboxRow(false);
    },
  );
}

/**
 * 修改密码
 * @param row
 */
function handlePassword(row: any) {
  formModalApiPassword.setData({
    values: row,
    isUpdate: true,
  });
  formModalApiPassword.open();
}

/**
 * 修改账号
 * @param row
 */
function handleAccount(row: any) {
  formModalApi.setData({
    values: row,
    isUpdate: true,
  });
  formModalApi.open();
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
          :right-click-menu="false"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </NCard>
      <div class="w-[calc(100%-160px)] ml-2 pl-2 bg-card rounded-md">
        <Grid>
          <template #toolbar-actions>
            <VbenButton
              type="primary"
              class="pg-button-size-small"
              @click="onCreateAccount"
            >
              <Plus class="size-5" />
              新增
            </VbenButton>
            <VbenButton class="ml-2 pg-button-size-small" @click="onCreate">
              新增全量
            </VbenButton>
          </template>
          <template #toolbar-tools>
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onBatchEnable"
            >
              批量有效
            </VbenButton>
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onBatchDisable"
            >
              批量停用
            </VbenButton>
            <!-- <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onRecovery"
            >
              删除恢复
            </VbenButton>-->
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              danger
              @click="onBatchDelete"
            >
              删除
            </VbenButton>
          </template>
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
            <VbenTableAction
              :actions="[
                {
                  tooltip: {
                    content: '编辑',
                  },
                  icon: 'lucide:edit',
                  onClick: () => onEdit(row),
                },
              ]"
              :dropdown-actions="[
                {
                  text: '删除',
                  icon: 'lucide:trash-2',
                  danger: true,
                  popConfirm: {
                    title: `确定删除 ${row.name} 吗？`,
                    confirm: () => onDelete(row),
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
        </Grid>
      </div>
    </div>
    <FormDrawer @ok="onRefresh" />
    <FormModal @ok="onRefresh" />
    <FormModalPassword />
  </Page>
</template>
