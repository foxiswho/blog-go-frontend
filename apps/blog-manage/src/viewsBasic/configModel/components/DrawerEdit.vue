<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import { usePgForm } from '#/adapter';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable, type VxeTableInstance,
} from 'vxe-table';
import { saveOrUpdate, detail as getDetail } from '../api';
import { formSchema, fieldColumns } from '../data';
import { message } from '#/adapter';

const emit = defineEmits(['ok']);

const xTable = ref<VxeTableInstance>();
const bodyDelIds = ref<string[]>([]);
const tableData = ref<any[]>([]);

const [Form, formApi] = usePgForm({
  schema: formSchema,
  handleSubmit: onSubmit,
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      bodyDelIds.value = [];
      if (isUpdate && values?.id) {
        drawerApi.setState({ loading: true });
        getDetail(values.id)
          .then((res: any) => {
            if (res) {
              formApi.setValues(res.header || {});
              // 处理 body 中的 rules 数组转为逗号分隔字符串以便编辑
              tableData.value = (res.body || []).map((item: any) => {
                if (Array.isArray(item.rules)) {
                  return { ...item, rules: item.rules.join(',') };
                }
                return item;
              });
            }
          })
          .finally(() => {
            drawerApi.setState({ loading: false });
          });
      } else {
        formApi.resetForm();
        tableData.value = [];
      }
      drawerApi.setState({ title: `模型配置：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '模型配置',
});

/**
 * 添加行
 */
async function insertEvent() {
  const $table = xTable.value;
  if ($table) {
    const { row } = await $table.insert({
      show: 1,
      binary: 2,
      valueType: 'string',
      formCode: 'input_text',
      parameterSource: 'manual',
    });
    await $table.setEditRow(row);
  }
}

/**
 * 删除行
 */
async function removeEvent(row: any) {
  const $table = xTable.value;
  if ($table) {
    await $table.remove(row);
    if (row.id) {
      bodyDelIds.value.push(row.id);
    }
  }
}

/**
 * 提交
 */
async function onSubmit(values: Record<string, any>) {
  try {
    const $table = xTable.value;
    if (!$table) return;

    const { fullData } = $table.getTableData();

    // 校验表格
    const errMap = await $table.validate(true);
    if (errMap) {
      message.error('表格校验失败，请检查必填项');
      return;
    }

    const { isUpdate } = drawerApi.getData<Record<string, any>>();

    const postData = {
      header: values,
      body: fullData.map(item => {
        const newItem = { ...item };
        // 如果 rules 是字符串，尝试转为数组（按照 post.json 格式）
        if (typeof newItem.rules === 'string') {
          newItem.rules = newItem.rules.split(',').map((s: string) => s.trim()).filter(Boolean);
        } else if (!Array.isArray(newItem.rules)) {
          newItem.rules = [];
        }
        return newItem;
      }),
      bodyDelIds: bodyDelIds.value,
    };

    drawerApi.setState({ loading: true });
    saveOrUpdate(postData, isUpdate)
      .then(() => {
        message.success('保存成功');
        emit('ok');
        drawerApi.close();
      })
      .finally(() => {
        drawerApi.setState({ loading: false });
      });
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <Drawer class="w-[1200px]">
    <div class="p-4">
      <div class="mb-4 font-bold border-l-4 border-primary pl-2">基本信息</div>
      <Form />

      <div class="mt-6 mb-4 flex justify-between items-center border-l-4 border-primary pl-2">
        <span class="font-bold">字段配置</span>
        <vxe-button status="primary" @click="insertEvent">新增字段</vxe-button>
      </div>

      <vxe-table
        ref="xTable"
        border
        show-overflow
        keep-source
        max-height="500"
        :data="tableData"
        :edit-config="{ trigger: 'click', mode: 'row', showStatus: true }"
        :edit-rules="{
          name: [{ required: true, message: '请输入字段名称' }],
          field: [{ required: true, message: '请输入字段标识' }]
        }"
      >
        <vxe-column v-for="col in fieldColumns" :key="col.field || col.type" v-bind="col">
          <template v-if="col.slots?.default === 'operate'" #default="{ row }">
            <vxe-button status="danger" mode="text" @click="removeEvent(row)">删除</vxe-button>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </Drawer>
</template>

<style scoped>
:deep(.vxe-table) {
  margin-top: 10px;
}
</style>
