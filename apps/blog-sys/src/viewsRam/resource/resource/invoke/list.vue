<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { useVbenModal} from '@vben/common-ui';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  selectCategory as selectNodeAllPublic,
} from '#/viewsRam/resource/group/api';

import { List } from '../api';
import { columns } from './data';

const emit = defineEmits(['ok']);

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const leftCheckedKeys = ref<any[]>([]);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const leftCheckedKeysComputed = computed(() => leftCheckedKeys.value);
// 当前树节点 key，作为查询条件透传给接口
const parentNo = ref('');
const wd = ref('');
const wdComputed = computed(() => wd.value);

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record;
  parentNo.value = record.key;
  gridQuery();
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
  parentNo.value = '';
  gridQuery();
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    commonConfig: {
      labelWidth: 42,
    },
    schema: [
      {
        component: 'Input',
        fieldName: 'wd',
        label: '关键词',
        defaultValue: wdComputed.value,
        componentProps: {
          placeholder: '请输入',
          clearable: true,
        },
      },
      {
        component: 'Select',
        fieldName: 'state',
        label: '状态',
        componentProps: {
          clearable: true,
          options: [
            { label: '停用', value: '2' },
            { label: '有效', value: '1' },
            { label: '弃置', value: '12' },
            { label: '取消', value: '11' },
          ],
        },
      },
    ],
    submitOnChange: false,
  },
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: 100,
      pageSizes: [50, 100, 500, 1000],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await List({
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            parentNo: parentNo.value,
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
      export: false,
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

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    // 获取选中数据
    const $grid = gridApi.grid;
    if (!$grid) return false;
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
      let title ='';
      const { parent, row } =modalApi.getData<Record<string, any>>();
      // console.log('onOpenChange=',parent, row);
      if(parent && Object.keys(parent).length > 0) {
        currenData.value = parent;
        wd.value = parent.name;
        leftCheckedKeys.value = [parent.no];
        parentNo.value = parent.no;
        // leftCheckedKeys.value = ["202607061553546108582534"];
        title = ' [ '+parent.name+' ]';
        if(row) {
          title =title + ' '+ row.name;
        }
      }

      modalApi.setState({ title: `选择：资源`+title });
    }
  },
  title: '：',
});
function treeAfterFetch(data:any) {
  console.log('treeAfterFetch',data);
  if(data) {
    for(var i in data) {
      if(!data[i].parentId) {
        data[i].label = data[i].label + (data[i]?.data&&data[i]?.data?.terminalCode?(' [ '+data[i]?.data?.terminalCode+' ]'):'');
      }
    }
  }
  return data;
}
</script>

<template>
  <Modal class="w-[900px]">
    <div class="flex size-full">
      <NCard
        class="min-w-[290px]"
        style="width: unset"
        content-style="padding-left:10px;padding-right:10px;padding-top:10px;"
      >
          <PgTree
            :api="selectNodeAllPublic"
            :after-fetch="treeAfterFetch"
            :reload="reloadTreeComputed"
            :props="{
              blockLine: true,
            showLine: true,
            cascade: false,
            checkable: false,
            selectable: true,
            defaultExpandAll: true,
            selectedKeys: leftCheckedKeysComputed,
          }"
            @ok="treeChang"
            @overload="treeOverload"
          />
        </NCard>
      <div class="w-[calc(100%-290px)] ml-2 pl-2 bg-card rounded-md">
            <Grid>
              <template #nameAll="{ row }">
                <div>{{ row.name }}</div>
                <div>{{ row.path }}</div>
              </template>
            </Grid>
      </div>
    </div>
  </Modal>
</template>

<style scoped></style>
