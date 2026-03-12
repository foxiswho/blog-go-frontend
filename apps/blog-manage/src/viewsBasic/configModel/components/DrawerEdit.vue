<script lang="ts" setup>
import {ref, reactive, h, onMounted} from 'vue';
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
import {PgTreeSelect} from "@pg/components-n";
import {codeValueAllPublic} from "#/viewsBasic/data-dict/dict/api";

const emit = defineEmits(['ok']);

const xTable = ref<VxeTableInstance>();
const bodyDelIds = ref<string[]>([]);
const tableData = ref<any[]>([]);
const optionsValueType = ref([]);
const optionsFormCode = ref([]);
const optionsParameterSource = ref([]);
/**
 * 格式化下拉框显示文字
 */
function formatLabel(row: any, col: any) {
  const value = row[col.field];
  const options = col.params?.options || [];
  if (col.field === 'rules') {
    if (Array.isArray(value)) {
      return value.map(v => options.find((o: any) => o.value === v)?.label || v).join(',');
    }
    return value;
  }
  if (col.field === 'show') {
    return value === 1 ? '显示' : '隐藏';
  }
  if (col.field === 'binary') {
    return value === 1 ? '是' : '否';
  }
  if (col.field === 'valueType') {
    const item = optionsValueType.value.find((o: any) => o.value === value);
    return item ? item.label : value;
  }
  if (col.field === 'formCode') {
    const item = optionsFormCode.value.find((o: any) => o.value === value);
    return item ? item.label : value;
  }
  if (col.field === 'parameterSource') {
    const item = optionsParameterSource.value.find((o: any) => o.value === value);
    return item ? item.label : value;
  }
  const item = options.find((o: any) => o.value === value);
  return item ? item.label : value;
}

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
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      bodyDelIds.value = [];
      if (isUpdate && values?.id) {
        getDetail(values.id)
          .then((res: any) => {
            if (res) {
              formApi.setValues(res.header || {});
              tableData.value = res.body || [];
            }
          })
          .finally(() => {
            drawerApi.setState({ loading: false });
          });
      } else {
        formApi.resetForm();
        tableData.value = [];
      }
      let title = `字段规则：${isUpdate ? '编辑' : '新增'}`;
      drawerApi.setState({ title: title,loading: false });
    }
  },
  title: '',
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
      valueType: 'varchar',
      formCode: 'Input',
      parameterSource: 'manual',
      rules: [],
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
    drawerApi.setState({ loading: true, confirmLoading: true });
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
      body: fullData,
      bodyDelIds: bodyDelIds.value,
    };

    saveOrUpdate(postData, isUpdate)
      .then(() => {
        message.success('保存成功');
        emit('ok');
        drawerApi.close();
      });
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}

const loadCodeValueAllPublic = ()=>{
  codeValueAllPublic({ typeCodeArr:['basicModel:valueType','basicModel:formCode','basicModel:ParameterSource'] }).then(( res) => {
    if(res) {
      console.log('codeValueAllPublic',res)
      for (const resKey in res) {
        if ('basicModel:valueType' === resKey) {
          for (const i in res[resKey]) {
            const item = res[resKey][i];
            optionsValueType.value.push({value: item.key, label: item.label});
          }
        }
        if ('basicModel:formCode' === resKey) {
          for (const i in res[resKey]) {
            const item = res[resKey][i];
            optionsFormCode.value.push({value: item.key, label: item.label});
          }
        }
        if ('basicModel:ParameterSource' === resKey) {
          for (const i in res[resKey]) {
            const item = res[resKey][i];
            optionsParameterSource.value.push({value: item.key, label: item.label});
          }
        }
      }
    }
  });
};
onMounted(() => {
  loadCodeValueAllPublic();
});
</script>

<template>
  <Drawer class="w-auto">
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
        :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
        :edit-rules="{
          name: [{ required: true, content: '请输入字段名称' }],
          field: [{ required: true, content: '请输入字段标识' },{ pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, content: '字段标识格式错误' }]
        }"
      >
        <vxe-column v-for="col in fieldColumns" :key="col.field || col.type" v-bind="col">
          <!-- 编辑插槽 -->
          <template #edit="{ row }">
            <!-- 显示/二进制 开关 -->
            <template v-if="['show', 'binary'].includes(col.field)">
              <vxe-switch
                v-model="row[col.field]"
                :open-value="1"
                :close-value="2"
                :open-label="col.field === 'show' ? '显示' : '是'"
                :close-label="col.field === 'show' ? '隐藏' : '否'"
              />
            </template>

            <!-- 下拉选择 -->
            <template v-else-if="['parameterSource'].includes(col.field)">
              <vxe-select v-model="row[col.field]" :options="optionsParameterSource" transfer></vxe-select>
            </template>
            <template v-else-if="['valueType'].includes(col.field)">
              <vxe-select v-model="row[col.field]"
                          :options="optionsValueType" transfer ></vxe-select>
            </template>
            <template v-else-if="['formCode'].includes(col.field)">
              <vxe-select v-model="row[col.field]"
                          :options="optionsFormCode" transfer ></vxe-select>
            </template>

            <!-- 下拉多选 (验证规则) -->
            <template v-else-if="col.field === 'rules'">
              <vxe-select v-model="row.rules" :options="col.params?.options" multiple transfer></vxe-select>
            </template>

            <!-- 文本输入 (名称, 标识, 默认值) -->
            <template v-else-if="['name', 'field', 'defaultValue'].includes(col.field)">
              <vxe-input v-model="row[col.field]"></vxe-input>
            </template>
          </template>

          <!-- 默认展示插槽 -->
          <template #default="{ row }">
            <template v-if="col.slots?.default === 'operate'">
              <vxe-button status="danger" mode="text" @click="removeEvent(row)">删除</vxe-button>
            </template>
            <template v-else-if="['show', 'binary', 'valueType', 'formCode', 'parameterSource', 'rules'].includes(col.field)">
              <span>{{ formatLabel(row, col) }}</span>
            </template>
            <template v-else>
              <span>{{ row[col.field] }}</span>
            </template>
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

<style>
/* 覆盖 vxe-select 下拉面板的层级，确保在抽屉之上 */
.vxe-select--panel {
  z-index: 2307 !important;
}
</style>
