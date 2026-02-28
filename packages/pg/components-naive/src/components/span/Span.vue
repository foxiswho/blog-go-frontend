<script setup lang="ts">
const value = defineModel('value', {
  default: () => '',
  type: [String, Number],
});
</script>

<template>
  <span>{{ value }}</span>
</template>

<style scoped></style>
