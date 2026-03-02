<script setup lang="ts">
import { useVbenModal} from '@vben/common-ui';
import ModalPasswordTpl from '#/viewsPub/pub/ModalPassword.vue';
import {watch} from "vue";
const [ModalPassword, modalApiPassword] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ModalPasswordTpl,
});

const actionRef = defineModel('action', {
  default: () => '更新',
  type: String,
});

watch(
  () => actionRef.value,
  (newValue, oldValue) => {
      if (newValue==='pwd') {
        modalApiPassword.setData({
          // 表单值
          values: {},
          isUpdate: true,
        });
        modalApiPassword.open();
      }
  }
)
</script>

<template>
  <div>
    <ModalPassword />
  </div>
</template>

<style scoped>

</style>
