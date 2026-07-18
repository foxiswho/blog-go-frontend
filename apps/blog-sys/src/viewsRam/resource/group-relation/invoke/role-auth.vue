<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { computed, onMounted, reactive, ref } from 'vue';

import { useVbenModal } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import { message } from '#/adapter';
import { useDataDictionaryStore } from '#/store';

import { selectNodeAllPublic } from '../../group/api';
import { selectedByRole,updateByRole } from '../api';

const emit = defineEmits(['ok']);

// 数据字典
const dataDictionaryStore = useDataDictionaryStore();
// 数据字典-加载
dataDictionaryStore.requestAllSet(['terminalCode']);
//
const terminalCode = ref<string>('system');
const currenRecord = ref(false);
const checkedData = ref([]);
const treeCheckedKeys = ref([]);
const currenData = ref<Recordable<any>>({});
const parentData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = { typeValue: '0',typeCategory:'group' };

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  // console.log('record', record);
  formParam.typeValue = record.key;
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
const treeOverload = (e) => {
  currenRecord.value = false;
  currenData.value = {};
  formParam.typeValue = '0';
};

onMounted(() => {});

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
  closeOnClickModal: false,
  draggable: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    console.log('checkedData.value', checkedData.value);
    // 获取选中数据
    if (checkedData.value <= 0) {
      if(treeCheckedKeys.value.length <= 0) {
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
    const ids = [];
    checkedData.value.map((item) => {
      if (item && item?.data){
        ids.push(item.data.no);
      }
    });
    if (ids <= 0) {
      message.warning('你没有选择任何数据');
      return false;
    }
    updateByRole({
      typeValue: parentData.value.no,
      nos:ids,
    }).then((d) => {
      setTimeout(()=>{
        emit('ok', checkedData.value);
        modalApi.setData({ rows: checkedData.value });
        modalApi.close();
      },1500);
    });


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
        selectedByRole({ typeValue: values.no,typeCategory:'role' }).then((d) => {
          if (d) {
            console.log('dKey', d);
            for (const dKey in d) {
              console.log('dKey', d[dKey]);
              treeCheckedKeys.value.push(d[dKey].groupNo);
            }
          }
          console.log('treeCheckedKeys.value', treeCheckedKeys.value);
        });
      }
    }
    modalApi.setState({ title });
  },
  title: '：',
});
const treeCheckedKeysComputed = computed(() => treeCheckedKeys.value);
async function onUpdateValue(tabName: string) {
  console.log('onBeforeLeave=',tabName);
  if(terminalCode.value!=tabName) {
    terminalCode.value = tabName;
    reloadTreeState.value++;
  }
}
</script>

<template>
  <Modal class="w-[1100px]">
    <n-tabs
      type="card"
      size="small"
      animated
      style="margin-top: -2px;"
      class="ajsMenu"
      @update:value="onUpdateValue"
    >
      <template #prefix>
        终端类型
      </template>
      <n-tab v-for="item in dataDictionaryStore.get('terminalCode')" :name="item.value" :tab="item.label" />
    </n-tabs>
    <PgTree
      :api="selectNodeAllPublic"
      :params="{terminalCode:terminalCode}"
      :props="{
              blockLine: true,
              showLine: true,
              cascade: true,
              checkable: true,
              selectable: false,
              defaultCheckedKeys: treeCheckedKeysComputed,
              // defaultSelectedKeys: treeCheckedKeys,
            }"
      :is-node-all="true"
      :reload="reloadTreeComputed"
      :right-click-menu="true"
      :right-click-menu-options="rightClickMenuOptions"
      @ok="treeChang"
      @overload="treeOverload"
      @update:checked-keys="treeUpdateCheckedKeys"
    />
  </Modal>
</template>

<style scoped></style>
