<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { selectPublic } from '../../group/api';
import { updateByRole, ListByGroup } from '../../resource-authority/api';
import { selectedByRole } from '../api';
import { columns } from './data';

const emit = defineEmits(['ok']);

const currenRecord = ref(false);
const checkedData = ref([]);
const treeCheckedKeys = ref([]);
const currenData = ref<Recordable<any>>({});
const parentData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const treeCheckedKeysComputed = computed(() => treeCheckedKeys.value);

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record;
  gridApi.formApi.setFieldValue('typeValue', record.key);
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
  gridApi.formApi.setFieldValue('typeValue', '0');
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    commonConfig: {
      labelWidth: 50,
      componentProps: {
        class: 'w-full',
      },
    },
    schema: [
      {
        fieldName: 'typeValue',
        label: '隐藏',
        defaultValue: '0',
        component: 'Input',
        componentProps: {},
        dependencies: {
          show: false,
          triggerFields: ['wd'],
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
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await ListByGroup({
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
      isCurrent: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
      search: true,
    },
  } as VxeTableGridOptions,
});

/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [];
};

function treeUpdateCheckedKeys({ keys, options, meta }) {
  checkedData.value = [];
  checkedData.value = meta;
}

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    // 获取选中数据
    if (checkedData.value <= 0) {
      if (treeCheckedKeys.value.length <= 0) {
        message.warning('你没有选择任何数据');
        return false;
      } else {
        message.warning('你没有更新任何数据');
        return false;
      }
    }
    if (!parentData.value) {
      message.warning('没选择角色');
      return false;
    }
    const ids: any[] = [];
    checkedData.value.map((item: any) => {
      if (item && item?.data) {
        ids.push(item.data.id);
      }
    });
    if (ids.length <= 0) {
      message.warning('你没有选择任何数据');
      return false;
    }
    updateByRole({
      typeValue: parentData.value.id,
      ids,
    });

    emit('ok', checkedData.value);
    modalApi.setData({ rows: checkedData.value });
    modalApi.close();
    return true;
  },
  onOpenChange(isOpen: boolean) {
    treeCheckedKeys.value = [];
    checkedData.value = [];
    let title = '角色授权';
    if (isOpen) {
      const { values } = modalApi.getData<Record<string, any>>();
      if (values) {
        parentData.value = values;
        title = `角色授权：${values.name} ( ${values.code} )`;
        selectedByRole({ typeValue: values.id }).then((d) => {
          if (d) {
            for (const dKey in d) {
              treeCheckedKeys.value.push(d[dKey]);
            }
          }
        });
      }
    }
    modalApi.setState({ title });
  },
  title: '：',
});
</script>

<template>
  <Modal class="w-[1100px]">
    <div>
      <NLayout class="h-full p-2" has-sider>
        <NLayoutSider class="min-w-[360px]">
          <PgTree
            :api="selectPublic"
            :props="{
              blockLine: true,
              showLine: true,
              cascade: true,
              checkable: true,
              selectable: false,
              defaultCheckedKeys: treeCheckedKeysComputed,
            }"
            :reload="reloadTreeComputed"
            :right-click-menu="true"
            :right-click-menu-options="rightClickMenuOptions"
            @ok="treeChang"
            @overload="treeOverload"
            @update:checked-keys="treeUpdateCheckedKeys"
          />
        </NLayoutSider>
        <NLayout class="w-[calc(100%-360px)]">
          <NLayoutContent>
            <Grid>
              <template #nameAll="{ row }">
                <div>
                  {{ row.name }}
                </div>
                <div>
                  {{ row.path }}
                </div>
              </template>
            </Grid>
          </NLayoutContent>
        </NLayout>
      </NLayout>
    </div>
  </Modal>
</template>

<style scoped></style>
