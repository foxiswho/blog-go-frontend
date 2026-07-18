<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { PgTree } from '@pg/components-n';
import { SexOptionsFormatter } from '@pg/types';

import { message } from '#/adapter';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { selectNodeAllPublic } from '#/viewsRam/department/api';

import { List } from '../api';
import { columnsShort } from './data';

const emit = defineEmits(['ok']);

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record;
  gridApi.formApi.setFieldValue('departments', [record.key]);
  gridQuerySubmit();
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
  gridQuerySubmit();
};
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
      },
      {
        component: 'Select',
        fieldName: 'state',
        label: '状态',
        defaultValue: '1',
        componentProps: {
          disabled: true,
          options: [
            { label: '有效', value: '1' },
            { label: '停用', value: '2' },
            { label: '弃置', value: '12' },
            { label: '取消', value: '11' },
          ],
        },
      },
    ],
    submitOnChange: false,
  },
  gridOptions: {
    columns: columnsShort,
    height: 'auto',
    keepSource: true,
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
    checkboxConfig: {
      reserve: true,
      highlight: true,
      range: true,
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
    await gridApi.query(params);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}
async function gridQuerySubmit() {
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

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    const $grid = gridApi.grid;
    if (!$grid) return false;
    const { number } = modalApi.getData<Record<string, any>>();
    const checkboxRecords = $grid.getCheckboxRecords();
    if (checkboxRecords.length <= 0) {
      message.warning('你没有选择任何数据');
      return false;
    }
    if (checkboxRecords.length > number) {
      message.warning('超过规定的条数');
      return false;
    }
    emit('ok', checkboxRecords);
    modalApi.setData({ rows: checkboxRecords });
    modalApi.close();
    return true;
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalApi.setState({ title: '选择用户' });
    }
  },
  title: '：',
});
</script>

<template>
  <Modal class="w-[1100px]">
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
        <Grid key="account-invoke-short">
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
        </Grid>
      </div>
    </div>
  </Modal>
</template>

<style scoped></style>
