<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePgForm } from '#/adapter';
import type { VbenFormSchema } from '#/adapter/form';
import { modelForm } from '#/viewsBasic/configEvent/event/api';

interface FormItem {
  name: string;
  field: string;
  show: number;
  binary: number;
  defaultValue: string;
  valueType: string;
  formCode: string;
  parameterSource: string;
  rules: string[];
}

interface ModelFormResult {
  item: FormItem[];
}

const loading = ref(true);

const [Form, formApi] = usePgForm({
  schema: [],
  handleSubmit: (values) => {
    console.log('表单提交:', values);
  },
  showDefaultActions: true,
});

function transformToSchema(items: FormItem[]): VbenFormSchema[] {
  return items
    .filter((item) => item.show === 1)
    .map((item) => {
      const schemaItem: VbenFormSchema = {
        tabGroup: 'home',
        fieldName: item.field,
        label: item.name,
        component: item.formCode,
        defaultValue: item.defaultValue || undefined,
        componentProps: getComponentProps(item),
      };

      if (item.rules?.includes('required')) {
        schemaItem.rules = 'required';
      }

      return schemaItem;
    });
}

function getComponentProps(item: FormItem): Record<string, any> {
  const props: Record<string, any> = {
    placeholder: `请输入${item.name}`,
  };

  switch (item.formCode) {
    case 'InputNumber':
      props.placeholder = `请输入${item.name}`;
      props.style = { width: '100%' };
      break;
    case 'Select':
      props.placeholder = `请选择${item.name}`;
      props.options = [];
      break;
    case 'DatePicker':
      props.placeholder = `请选择${item.name}`;
      props.type = 'date';
      props.style = { width: '100%' };
      break;
    default:
      break;
  }

  return props;
}

onMounted(async () => {
  try {
    const data: ModelFormResult = await modelForm({});
    if (data?.item) {
      const newSchema = transformToSchema(data.item);
      formApi.setState({ schema: newSchema });
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="p-4">
    <div v-if="loading" class="text-center py-8">加载中...</div>
    <Form v-else />
  </div>
</template>

<style scoped>
</style>
