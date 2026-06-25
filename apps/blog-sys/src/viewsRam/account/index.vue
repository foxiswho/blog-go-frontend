<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref, toRaw } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { cn, isEqual } from '@vben/utils';

import { PgTree } from '@pg/components-n';
import { stateYesNoOption } from '@pg/types';
import {
  basicTypeDomainFormatter,
  IdentityTypeFormatter,
  SexOptionsFormatter,
} from '@pg/types';

import { dialog, message, useVbenForm } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { typeCodePublic } from '#/viewsBasic/data-dict/dict/api';
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

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const reloadTreeComputed = computed(() => reloadTreeState.value);

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record;
  formApiGrid.setFieldValue('departments', [record.key]);
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
const treeOverload = (_e: any) => {
  formApiGrid.setFieldValue('departments', []);
  gridQuerySubmit();
};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
});
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Account,
});
const [FormModalPassword, formModalApiPassword] = useVbenModal({
  connectedComponent: PasswordModal,
});
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions: any[] = [];

const [FormGrid, formApiGrid] = useVbenForm({
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  compact: true,
  submitButtonOptions: {
    content: '查询',
  },
  collapsed: false,
  submitOnChange: false,
  submitOnEnter: false,
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

const [Grid, gridApi] = useVbenVxeGrid({
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
  } as VxeTableGridOptions,
});
/**
 * 重新查询
 */
async function gridQuery(params: Record<string, any> = {}) {
  try {
    gridApi.query(params);
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
/**
 * 刷新表格
 */
async function onRefresh() {
  const formValues = await formApiGrid.getValues();
  formApiGrid.setLatestSubmissionValues(formValues);
  gridQuery(formValues);
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
    dialog,
  );
}

/**
 * 物理删除
 */
function onPhysicalDeletion() {
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
  batchSelectPhysicalDeletion(
    ids,
    () => {
      onRefresh();
      $grid.setAllCheckboxRow(false);
    },
    dialog,
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
        <div :class="cn('relative rounded-sm py-3', 'pb-8')">
          <FormGrid />
          <div
            class="absolute bottom-1 -left-2 z-100 h-2 w-[calc(100%+1rem)] overflow-hidden bg-background-deep md:bottom-2 md:h-3"
          ></div>
        </div>
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
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onRecovery"
            >
              删除恢复
            </VbenButton>
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              danger
              @click="onPhysicalDeletion"
            >
              物理删除
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
                  row.os?.noName?.roles ? row.os?.noName?.roles.join(',') : ''
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

<style scoped></style>
