<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';

import { selectPublic } from '../api';

const emit = defineEmits(['ok']);
const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const treeCheckedKeys = ref([]);
const checkedData = ref([]);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const treeCheckedKeysComputed = computed(() => treeCheckedKeys.value);
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions: any = [];
/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [];
};
const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
};
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {
  currenRecord.value = false;
  currenData.value = {};
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
    console.log('checkedData.value', checkedData.value);
    // 获取选中数据
    if (checkedData.value.length <= 0) {
      if (treeCheckedKeys.value.length <= 0) {
        message.warning('你没有选择任何数据');
        return false;
      } else {
        message.warning('你没有更新任何数据');
        return false;
      }
    }
    const ids = [];
    checkedData.value.map((item) => {
      if (item && item?.data) {
        ids.push(item.data.id);
      }
    });
    if (ids.length <= 0) {
      message.warning('你没有选择任何数据');
      return false;
    }
    // 获取选中数据
    emit('ok', checkedData.value);
    modalApi.setData({ rows: checkedData.value });
    modalApi.close();
    return true;
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      checkedData.value = [];
      treeCheckedKeys.value = [];
      modalApi.setState({ title: `选择：资源` });
    }
  },
  title: '：',
});
</script>

<template>
  <Modal>
    <PgTree
      :api="selectPublic"
      :menu-dropdown-options="menuDropdownOptions"
      :props="{
        blockLine: true,
        showLine: true,
        cascade: true,
        checkable: true,
        selectable: false,
        defaultCheckedKeys: treeCheckedKeysComputed,
        // defaultSelectedKeys: treeCheckedKeys,
      }"
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
