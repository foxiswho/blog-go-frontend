<script setup lang="ts">
import {
  type RowVO,
  typesGoodsFormatter,
  typeSpecificationsFormatter,
} from '@pg/types';
import type { VxeGridInstance, VxeGridProps } from 'vxe-table';

import { reactive, ref, computed } from 'vue';

import { useVbenModal } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';
import { useClipboard, usePermission } from '@vueuse/core';
import { isFunction } from 'xe-utils';

import { message } from '#/adapter/naive';
import { selectPublic as categoryTag } from '#/viewsBasic/tags/category/api';

import { All } from '../api';
import { MdiCopy } from '@pg/icons';

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

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    modalApi.setState({ loading: true });
    emit('ok', tagsSelect.value);
    modalApi.setState({ loading: false });
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    currenData.value.label = '选择标签: ';
    titleRef.value = '选择标签: ';
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      if (modalData.checkedNum) {
        checkedNum.value = modalData.checkedNum;
      }
      if (modalData.sourceData) {
        sourceData.value = modalData.sourceData;
      }
      if (modalData.callback) {
        callback.value = modalData.callback;
      }

      modalApi.setState({ title: `${titleRef.value}` });
    }
  },
  title: '：',
});

/**
 * 重新加载
 */
function reloadTable() {

}

function getData(code){
  All({category:code}).then((res)=>{
    console.log('res',res);
    tags.value = res;
  });
}

const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record;
  console.log('record',record);
  // reloadTable();
  getData(record.data.code);
};

/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {
  formParam.catBack = '';
  formParam.catFront = '';
  reloadTable();
};
/**
 * 重新加载
 */
function reloadPgTree() {
  reloadTree.value = true;
}
function selectTag(row){
  if(-1===tagsSelect.value.indexOf(row)){
    tagsSelect.value.push(row);
  }
}
function selectTagDel(row){
  let index=tagsSelect.value.indexOf(row)
  console.log('indexOf',index)
  if (index > -1) {
    tagsSelect.value.splice(index, 1);
  }
}
</script>

<template>
  <Modal class="w-[1200px]">
    <NLayout class="h-full p-2 methodFast" has-sider>
      <NLayoutSider class="min-w-[160px]" width="160">
        <PgTree
          :api="categoryTag"
          :right-click-menu="false"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </NLayoutSider>
      <NLayout class="w-[calc(100%-160px)]">
        <NLayoutContent>
          <n-page-header v-if="tagsSelect" title="选中的" class="mb-2 border-b-slate-300 border-b border-b-solid pb-2">
            <template #back></template>
            <div class="flex flex-row flex-wrap">
              <div v-for="item in tagsSelect" class="mr-2 mt-2 mb-2">
                <n-tag
                  :bordered="item.attributeMap.bordered"
                  :type="item.attributeMap.type"
                  :color='item.attributeMap.color'
                  :size="item.attributeMap.size"
                  :strong="item.attributeMap.strong"
                  :round="item.attributeMap.round"
                  class="cursor-pointer"
                  @click="selectTagDel(item)"
                >
                  {{item.name}}
                </n-tag>
              </div>
            </div>
          </n-page-header>
          <n-page-header v-if="getTitle" :title="getTitle" class="mb-2 border-b-slate-300 border-b border-b-solid">
            <template #back></template>
          </n-page-header>
          <div v-else style="padding-top: 40px">
            <n-empty description="没有任何数据" />
          </div>
          <div class="flex flex-row">
            <div v-for="item in tags" class="mr-2 mt-2 mb-2">
              <n-tag
                :bordered="item.attributeMap.bordered"
                :type="item.attributeMap.type"
                :color='item.attributeMap.color'
                :size="item.attributeMap.size"
                :strong="item.attributeMap.strong"
                :round="item.attributeMap.round"
                @click="selectTag(item)"
              >
                {{item.name}}
              </n-tag>
            </div>
          </div>
        </NLayoutContent>
      </NLayout>
    </NLayout>
  </Modal>
</template>

<style scoped>
.methodFast {
  .n-card-header {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .n-tag {
    cursor: pointer;
  }
}
</style>
