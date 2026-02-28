<script setup lang="ts">
import { ref } from 'vue';
import formCreate from '@form-create/naive-ui';

const formData = ref({});
const formApi = ref(null);


const formRules = ref([
  {
    "type": "input",
    "field": "name",
    "title": "名称",
    "info": "",
    "$required": false,
    "_fc_id": "id_F72tm1q5zt66bac",
    "name": "ref_Fkw7m1q608zsbdc",
    "display": true,
    "hidden": false,
    "_fc_drag_tag": "input"
  },
  {
    "type": "input",
    "field": "code",
    "title": "编号",
    "info": "",
    "$required": false,
    "_fc_id": "id_Faf2m1q60s4pbfc",
    "name": "ref_Fqwym1q60s4pbgc",
    "display": true,
    "hidden": false,
    "_fc_drag_tag": "input"
  },
  {
    "type": "input",
    "field": "Fjedm1q61cp5bhc",
    "title": "描述",
    "info": "",
    "$required": false,
    "props": {
      "type": "textarea"
    },
    "_fc_id": "id_Fbjvm1q61cp5bic",
    "name": "ref_Fy1ym1q61cp5bjc",
    "display": true,
    "hidden": false,
    "_fc_drag_tag": "textarea"
  },
  {
    "type": "inputNumber",
    "field": "Fnqom1q61k45bkc",
    "title": "排序",
    "info": "",
    "$required": false,
    "_fc_id": "id_Fc6om1q61k45blc",
    "name": "ref_Fiwvm1q61k45bmc",
    "display": true,
    "hidden": false,
    "_fc_drag_tag": "inputNumber"
  },
]);
</script>

<template>
  <form-create v-model="formData" v-model:api="formApi" :rule="formRules" />
</template>

<style scoped>

</style>
