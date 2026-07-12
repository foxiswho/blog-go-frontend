<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';

import { PgTree } from '@pg/components-n';
import { stateYesNoOption } from '@pg/types';

import { dialog, message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  selectNodeAllPublic,
} from '#/viewsRam/resource/group/api';
import { selectNodeAllPublic as selectNodeAllPublicMenu } from '#/viewsRam/resource/menu/api';

import ResourceList from '../resource/invoke/list.vue';
import {
  batchSelectPhysicalDeletion,
  createByGroup,
  createByMenu,
  deleteIds,
  ListByGroup,
} from './api';

import { columns } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>(null);
const currenParentData = ref<Recordable<any>>(null);
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const checkedData = ref<any[]>([]);
const leftCheckedKeys = ref<any[]>([]);
const treeCheckedKeys = ref<any[]>([]);
const dataAll = ref<any[]>([]);
const menuTreeKey = ref(0);
const treeCheckedKeysComputed = computed(() => treeCheckedKeys.value);
const leftCheckedKeysComputed = computed(() => leftCheckedKeys.value);

const treeChang = (record: any) => {
  console.log('treeChang=',record);
  currenRecord.value = true;
  currenData.value = record.data;
  gridApi.formApi.setFieldValue('typeValue', record.key);
  onRefresh();
  //
  if(dataAll.value && currenData.value) {
    for(var item of dataAll.value) {
      if(item.value==currenData.value.parentNo) {
        currenParentData.value = item.extend;
      }
    }
  }
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
  currenRecord.value = false;
  currenData.value = {};
  gridApi.formApi.setFieldValue('typeValue', null);
  onRefresh();
};

const [FormModalResource, formModalApiResource] = useVbenModal({
  connectedComponent: ResourceList,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    commonConfig: {
      labelWidth: 42,
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
    submitOnChange: false,
  },
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    cellConfig: {
      height:60,
    },
    pagerConfig: {
      enabled: false,
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const queryParams: any = {
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            ...formValues,
          };
          if (formValues?.typeValue) {
            queryParams.groupNo = formValues.typeValue;
          }
          treeCheckedKeys.value = [];
          const res = await ListByGroup(queryParams);
          treeCheckedKeys.value = res.menus || [];
          menuTreeKey.value++;
          return res;
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
      search: true,
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

/**
 * 刷新表格
 */
async function onRefresh() {
  try {
    const formValues = await gridApi.formApi.getValues();
    gridApi.formApi.setLatestSubmissionValues(formValues);
    gridQuery(formValues);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
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
 * 批量删除
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
    ids.push(item.id);
    $grid.setCheckboxRow(item, false);
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
  );
}

/**
 * 选择资源
 */
async function onSelectResource() {
  const formValues = await gridApi.formApi.getValues();
  if (formValues.typeValue) {
    formModalApiResource.setData({
      values: {},
      row: currenData.value,
      parent: currenParentData.value,
      isUpdate: false,
    });
    formModalApiResource.open();
  } else {
    message.warning('你没有选择资源组');
  }
}

function treeChangOverload() {
  reloadTree();
  setTimeout(() => {
    onRefresh();
  }, 1000);
}

async function selectResourceOk(rows: any) {
  const formValues = await gridApi.formApi.getValues();
  if (formValues.typeValue) {
    if (!rows || rows.length <= 0) {
      message.warning('你没有选择资源数据');
      return;
    }
    createByGroup({
      groupNo: formValues.typeValue,
      ids: rows.map((item: any) => item.no),
    }).then(() => {
      setTimeout(() => {
        onRefresh();
      }, 3000);
    });
  } else {
    message.warning('你没有选择资源组');
  }
}

const treeChangMenu = (_record: any) => {};

function treeUpdateCheckedKeys(opt: any) {
  if (opt && opt.keys) {
    checkedData.value = [...opt.keys];
  }
}

async function save() {
  const values = await gridApi.formApi.getValues();
  if (currenData.value && values.typeValue && currenData.value?.id) {
    createByMenu({
      groupNo: values.typeValue,
      ids: checkedData.value,
    });
  } else {
    message.warning('你没有选择资源组');
  }
}
function onResultSource(opt) {
  // console.log('onResultSource',opt);
  dataAll.value = opt;
}
function treeAfterFetch(data:any) {
  console.log('treeAfterFetch',data);
  if(data) {
    for(var i in data) {
      if(!data[i].parentId) {
        data[i].label = data[i].label + (data[i]?.data&&data[i]?.data?.terminalCodeName?(' [ '+data[i]?.data?.terminalCodeName+' ]'):'');
      }
    }
  }
  return data;
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <div class="flex size-full">
      <NCard
        class="min-w-[290px]"
        style="width: unset"
        content-style="padding-left:10px;padding-right:10px;padding-top:10px;"
      >
        <PgTree
          :api="selectNodeAllPublic"
          :after-fetch="treeAfterFetch"
          :is-node-all="true"
          :reload="reloadTreeComputed"
          class="pg-tree"
          @ok="treeChang"
          @overload="treeOverload"
          @result:source="onResultSource"
        />
      </NCard>
      <div class="w-[calc(100%-600px)] ml-2 pl-2 bg-card rounded-md">
        <Grid>
          <template #toolbar-actions>
            <VbenButton
              :disabled="currenRecord?false:true"
              type="primary"
              class="pg-button-size-small"
              @click="onSelectResource"
            >
              选择
            </VbenButton>
            <VbenButton
              class="ml-2 pg-button-size-small"
              danger
              @click="onPhysicalDeletion"
            >
              批量删除
            </VbenButton>
          </template>
          <template #nameAll="{ row }">
            <div>
              {{ row.name }}
            </div>
            <div>
              <n-tag type="success">{{ row.method }}</n-tag> {{ row.path }}
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
                    confirm: () => onDelete(row),
                  },
                },
              ]"
              align="center"
            />
          </template>
        </Grid>
      </div>
      <NCard
        class="min-w-[300px] ml-2"
        style="width: unset"
        content-style="padding-left:10px;padding-right:10px;padding-top:10px;overflow:hidden;"
      >
        <div class="h-[30px]">
          <VbenButton size="sm" @click="save">保存菜单权限</VbenButton>
        </div>
        <NDivider title-placement="left" style="margin-top:10px;margin-bottom: 10px">
          菜单权限
        </NDivider>
        <PgTree
          :key="menuTreeKey"
          :api="selectNodeAllPublicMenu"
          :after-fetch="treeAfterFetch"
          :is-node-all="true"
          :right-click-menu="false"
          :props="{
            blockLine: true,
            showLine: true,
            cascade: true,
            checkable: true,
            selectable: false,
            defaultCheckedKeys: treeCheckedKeysComputed,
            defaultExpandAll: true,
          }"
          class="pg-tree2"
          @ok="treeChangMenu"
          @update:checked-keys="treeUpdateCheckedKeys"
        />
      </NCard>
    </div>
    <FormModalResource @ok="selectResourceOk" />
  </Page>
</template>

<style scoped>
:deep(.pg-tree .n-tree) {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
:deep(.pg-tree2 .n-tree) {
  max-height: calc(100vh - 290px);
  overflow-y: auto;
}
</style>
