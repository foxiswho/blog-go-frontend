<script setup lang="ts">
import type { RowVO } from '@pg/types';
import type { Recordable } from '@vben/types';
import type { VxeGridInstance } from 'vxe-table';

import { computed, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { PgTree } from '@pg/components-n';
import { useNode } from '@pg/utils';
import { useClipboard, usePermission } from '@vueuse/core';

import { message } from '#/adapter/naive';

import { getCategoryTags, deleteId } from '#/viewsBasic/tags/relation/api';
import { selectPublic } from '#/viewsBasic/tags/category/api';
import DrawerTagTpl from './components/DrawerTag.vue';

const emit = defineEmits(['select', 'register', 'ok']);
const { copy, text } = useClipboard({ legacy: true });
const permissionWrite = usePermission('clipboard-write');
/**
 * 复制
 * @param opt
 */
function clipboardCopy(opt) {
  copy(opt);
  if (permissionWrite) {
    message.success('已复制到剪贴板');
  } else {
    message.warning('没有权限复制剪贴板');
  }
}

const titleRef = ref('选择sku');
const checkedNum = ref(1);
const sourceData = ref({});
const xGrid = ref<VxeGridInstance<RowVO>>();
const formParam = reactive({ catBack: '', catFront: '' });
const callback = ref(null);

const currenRecord = ref(false);
const reloadTree = ref(false);
const currenData = ref<Recordable<any>>({
  label: '',
});
const tags = ref([]);
const tagsSelect = ref([]);
const getTitle = computed(() => currenData.value.label);

const [DrawerForm, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerTagTpl,
});

function getData(code) {
  getCategoryTags(code, { pageSize: 999999 }).then((res) => {
    console.log('res', res);
    tags.value = res.data;
  });
}

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  console.log('record', record);
  getData(record.data.no);
};
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {};
/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [
    {
      label: '添加标签',
      key: '添加标签',
      props: {
        onClick: () => {
          drawerApi.setData({
            // 表单值
            values: {},
            isUpdate: false,
            parent: option.data,
          });
          drawerApi.open();
        },
      },
    },
    {
      label: '添加下级',
      key: '添加下级',
      props: {
        onClick: () => {
          drawerApi.setData({
            // 表单值
            values: {},
            isUpdate: false,
            parent: option.data,
          });
          drawerApi.open();
        },
      },
    },
  ];
};
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [
  {
    label: '添加',
    key: '添加',
    props: {
      onClick: () => {
        drawerApi.setData({
          // 表单值
          values: {},
          isUpdate: false,
        });
        drawerApi.open();
      },
    },
  },
];

const optionsTagMenu = ref([
  {
    label: '修改',
    key: 'edit',
  },
  {
    label: '删除',
    key: 'delete',
  },
]);

function handleMenuSelect(key, row) {
  console.log('recordxxxx', row);
  switch (key) {
    case 'edit':
      drawerApi.setData({
        // 表单值
        values: row,
        isUpdate: true,
      });
      drawerApi.open();
      break;
    case 'delete':
      deleteId(row.id).then((d) => {
        row.show = false;
      });
  }
}
</script>

<template>
  <div>
    <NLayout class="methodFast h-full p-2" has-sider>
      <NLayoutSider class="min-w-[160px]" width="160">
        <PgTree
          :api="selectPublic"
          :menu-dropdown-options="menuDropdownOptions"
          :right-click-menu="true"
          :right-click-menu-options="rightClickMenuOptions"
          :reload="reloadTree"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </NLayoutSider>
      <NLayout class="w-[calc(100%-160px)]">
        <NLayoutContent>
          <n-page-header
            v-if="getTitle"
            :title="getTitle"
            class="border-b-solid mb-2 border-b border-b-slate-300"
          >
            <template #back></template>
          </n-page-header>
          <div v-else style="padding-top: 40px">
            <n-empty description="没有任何数据" />
          </div>
          <div class="flex flex-row">
            <div v-for="item in tags" class="mb-2 mr-2 mt-2">
              <n-dropdown
                trigger="hover"
                :options="optionsTagMenu"
                @select="handleMenuSelect($event, item)"
                v-if="item.show"
              >
                <n-tag
                  :bordered="
                    item.attributeMap &&
                    item.attributeMap.hasOwnProperty('bordered')
                      ? item.attributeMap['bordered']
                      : true
                  "
                  :type="
                    item.attributeMap &&
                    item.attributeMap.hasOwnProperty('type')
                      ? item.attributeMap['type']
                      : 'default'
                  "
                  :color="
                    item.attributeMap &&
                    item.attributeMap.hasOwnProperty('color')
                      ? item.attributeMap['color']
                      : undefined
                  "
                  :size="
                    item.attributeMap &&
                    item.attributeMap.hasOwnProperty('size')
                      ? item.attributeMap['size']
                      : 'medium'
                  "
                  :strong="
                    item.attributeMap &&
                    item.attributeMap.hasOwnProperty('strong')
                      ? item.attributeMap['strong']
                      : false
                  "
                  :round="
                    item.attributeMap &&
                    item.attributeMap.hasOwnProperty('round')
                      ? item.attributeMap['round']
                      : false
                  "
                  closable
                  @close="handleTagClose(item)"
                >
                  {{ item.name }}
                </n-tag>
              </n-dropdown>
            </div>
          </div>
        </NLayoutContent>
      </NLayout>
    </NLayout>
    <DrawerForm />
  </div>
</template>

<style scoped></style>
