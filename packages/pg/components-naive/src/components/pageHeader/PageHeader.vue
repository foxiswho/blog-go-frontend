<script lang="ts" setup>
import { NPageHeader } from 'naive-ui';
import { useRouter } from 'vue-router';
import { MdiChevronLeft } from '@pg/icons';
const router = useRouter();
const backEnable = defineModel('backEnable', {
  default: () => false,
  type: [Boolean],
});
const back = (e) => {
  if (backEnable) {
    router.go(-1);
  }
};
</script>
<template>
  <NPageHeader @back="back" v-bind="$attrs" class="pgPageHeader">
    <template #back>
      <div v-if="backEnable">
        <MdiChevronLeft hoverPointer class="mr-1 mt-1" />
        <span>返回</span>
      </div>
      <div v-else></div>
    </template>
    <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
  </NPageHeader>
</template>

<style lang="less" scoped>
.pgPageHeader {
  :deep(.n-page-header) {
    //background-color: #55d187;
    margin: 20px 24px;
    margin-right: 36px;
    & .n-page-header__back {
      position: relative;
      font-size: revert;
      padding-right: 12px;
      //margin-right: 0px;
      //border-right: 1px solid;
    }
    & .n-page-header__back::after {
      content: '';
      position: absolute;
      top: 3;
      right: -4px;
      width: 1px;
      height: 16px;
      background: #eee;
    }
    & .n-page-header__title {
      //margin: 20px  24px;
    }
  }
}
</style>
