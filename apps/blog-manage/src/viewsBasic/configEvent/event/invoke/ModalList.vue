<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from '#/adapter';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  List,
} from '../api';
import { columns, useGridFormSchema } from './data';

const emit = defineEmits(['ok']);

const currenData = ref<Recordable<any>>({});
const currenNum = ref<number>(1);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: 100,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await List({
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            typeCode: currenData.value.code,
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
      zoom: false,
    },
    checkboxConfig: {
      labelField: 'id',
      reserve: true,
      highlight: true,
      range: true,
      trigger: 'row',
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

const [ModalList, modalApiList] = useVbenModal({
  closeOnClickModal: false,
  draggable: true,
  fullscreenButton: false,
  onCancel() {
    modalApiList.close();
  },
  onConfirm: async () => {
    const $grid = gridApi.grid;
    if ($grid) {
      const selectRecords = $grid.getCheckboxRecords();
      console.log('selectRecords', selectRecords);
      if(selectRecords.length > currenNum.value) {
        message.warning('请选择小于等于 '+currenNum.value+' 条数据');
        return;
      }

      emit('ok',{data: selectRecords,num: currenNum.value});

      modalApiList.close();
    }
  },
  onOpenChange(isOpen: boolean) {
    modalApiList.setState({
      loading: true,
      confirmLoading: false,
      closeOnClickModal: false, // 点击遮罩关闭弹窗
      destroyOnClose: true, // 关闭时销毁
    });
    currenData.value = {};
    if (isOpen) {
      const { values, num } = modalApiList.getData<Record<string, any>>();
      if (num) {
        currenNum.value = num;
      }
      if (values) {
        currenData.value = values;
        gridQuery();
      }
      modalApiList.setState({
        title: `事件选择: 选择 ${currenNum.value} 条数据`,
        loading: false,
      });
    }
  },
  title: '',
});
</script>

<template>
  <ModalList class="w-[1100px]">
    <div class="h-full p-2">
      <Grid />
    </div>
  </ModalList>
</template>

<style scoped></style>
