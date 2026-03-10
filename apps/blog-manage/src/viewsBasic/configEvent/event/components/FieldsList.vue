<script setup lang="ts">
import {ref, reactive, h, onMounted, watch, nextTick } from 'vue';
import {
  type VxeTableInstance,
  VXETable,
} from 'vxe-table';
import { message } from '#/adapter';
import {
  allByEventNo,
  saveOrUpdate,
  deleteId,
} from '#/viewsBasic/configEvent/field/api';
import { fieldColumns } from './data';
import {codeValueAllPublic} from "#/viewsBasic/data-dict/dict/api";

// 接收父组件传递的 event 对象
const props = defineProps<{
  eventData?: any;
}>();

const xTable = ref<VxeTableInstance>();
const tableData = ref<any[]>([]);
const bodyDelIds = ref<string[]>([]);
const optionsValueType = ref([]);
const optionsFormCode = ref([]);
const optionsParameterSource = ref([]);
const isFullscreen = ref(false);

const ruleOptions = ref([
  { label: '必填', value: 'required' },
  { label: '数字', value: 'number' },
  { label: '邮箱', value: 'email' },
  { label: '手机号', value: 'phone' },
]);

const formRules = ref({
  name: [{ required: true, message: '请输入名称' }],
  field: [{ required: true, message: '请输入标识' }],
});

const submitEvent = () => {
  console.log('submit');
};

const resetEvent = () => {
  console.log('reset');
};

// 格式化下拉框显示文字
function formatLabel(row: any, col: any) {
  const value = row[col.field];
  const options = col.params?.options || [];
  if (col.field === 'show') {
    return value === 1 ? '显示' : '隐藏';
  }
  if (col.field === 'binary') {
    return value === 1 ? '是' : '否';
  }
  const item = options.find((o: any) => o.value === value);
  return item ? item.label : value;
}

// 添加行
async function insertEvent() {
  const $table = xTable.value;
  if ($table) {
   const { row } = await $table.insert({
      show: 1,
      binary: 2,
      valueType: 'varchar',
      formCode: 'input',
      parameterSource: null,
      rules: [],
    });
    await $table.setEditRow(row);
  }
}

// 批量删除
async function removeSelectedEvent() {
  const $table = xTable.value;
  if ($table) {
    const selectedRows = $table.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.warning('请选择要删除的行');
      return;
    }
    await $table.remove(selectedRows);
    selectedRows.forEach(row => {
      if (row.id && row.id !== '0') {
        bodyDelIds.value.push(row.id);
      }
    });
    message.success('删除成功');
  }
}

// 保存
async function saveTableEvent() {
  const $table = xTable.value;
  if (!$table) return;

  try {
    const { fullData } = $table.getTableData();
    const postData = {
      eventNo: props.eventData?.no,
      body: fullData,
      bodyDelIds: bodyDelIds.value,
    };

    await saveOrUpdate(postData, true);
    message.success('保存成功');
    bodyDelIds.value = [];
    // 重新加载数据
    if (props.eventData?.no) {
      await loadData(props.eventData.no);
    }
  } catch (error) {
    console.error(error);
    message.error('保存失败');
  }
}

// 监听 eventData 变化，加载数据
watch(
  () => props.eventData,
  async (newVal) => {
   console.log('newVal', newVal);
   if (newVal && newVal.no) {
     await loadData(newVal.no);
    } else {
      tableData.value = [];
      bodyDelIds.value = [];
    }
  },
  { immediate: true }
);

// 加载数据
async function loadData(eventNo: string) {
  try {
   const res = await allByEventNo({ eventNo });
    if (res) {
     console.log('allByEventNo', res);
      tableData.value = res.map((item: any) => ({
        ...item,
        id: item.id || '0',
      }));
      bodyDelIds.value = [];
      nextTick(() => {
        xTable.value?.setAllRowExpand(true);
      });
    }
  } catch (error) {
   console.error('Failed to load fields data:', error);
    message.error('加载字段数据失败');
  }
}

// 加载码值数据
const loadCodeValueAllPublic = () => {
  codeValueAllPublic({ typeCodeArr: ['basicModel:valueType', 'basicModel:formCode', 'basicModel:ParameterSource'] }).then((res) => {
    if (res) {
     console.log('codeValueAllPublic', res);
      for (const resKey in res) {
        if ('basicModel:valueType' === resKey) {
          for (const i in res[resKey]) {
           const item = res[resKey][i];
            optionsValueType.value.push({ value: item.key, label: item.label });
          }
        }
        if ('basicModel:formCode' === resKey) {
          for (const i in res[resKey]) {
           const item = res[resKey][i];
            optionsFormCode.value.push({ value: item.key, label: item.label });
          }
        }
        if ('basicModel:ParameterSource' === resKey) {
          for (const i in res[resKey]) {
           const item = res[resKey][i];
            optionsParameterSource.value.push({ value: item.key, label: item.label });
          }
        }
      }
    }
  });
};

onMounted(() => {
  loadCodeValueAllPublic();
});

// 暴露刷新方法给父组件
defineExpose({
 reloadTable: () => {
   if (props.eventData?.no) {
      loadData(props.eventData.no);
    }
  },
});
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}
</script>

<template>
  <div :class="['h-full p-2 bg-white', isFullscreen ? 'fullscreen-wrapper' : '']">
    <div class="mb-2 flex justify-between items-center">
      <span class="font-bold">字段配置</span>
      <div class="flex items-center gap-2">
        <vxe-button size="small" status="primary" @click="saveTableEvent">保存</vxe-button>
        <vxe-button size="small" status="danger" @click="removeSelectedEvent">批量删除</vxe-button>
        <vxe-button size="small" status="primary" @click="insertEvent">新增字段</vxe-button>
        <vxe-button
          size="small"
          :icon="isFullscreen ? 'vxe-icon-shrink' : 'vxe-icon-fullscreen'"
          :title="isFullscreen ? '缩小' : '全屏'"
          @click="toggleFullscreen"
        />
      </div>
    </div>
    <vxe-table
   ref="xTable"
      border
      show-overflow
      keep-source
      :expand-config="{ expandAll: true }"
      :max-height="isFullscreen ? 'calc(100vh - 120px)' : 500"
      :data="tableData"
      :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
      :edit-rules="{
        name: [{ required: true, content: '请输入字段名称' }],
        field: [{ required: true, content: '请输入字段标识' }, { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, content: '字段标识格式错误' }]
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
              :open-label="'是'"
              :close-label="'否'"
            />
          </template>
          <!-- 文本输入 (名称，标识) -->
          <template v-else-if="['name', 'field'].includes(col.field)">
            <vxe-input v-model="row[col.field]"></vxe-input>
          </template>
        </template>

        <template #content="{ row }">
          <div class="p-4">
            <vxe-form
              title-align="left"
              :data="row" :rules="formRules" @submit="submitEvent" @reset="resetEvent">
              <vxe-form-item title="默认值" field="defaultValue" :item-render="{}" :span="8">
                <template #default>
                  <vxe-input v-model="row.defaultValue"></vxe-input>
                </template>
              </vxe-form-item>
              <vxe-form-item title="值类型" field="valueType" :item-render="{}" :span="12">
                <template #default>
                  <vxe-select v-model="row.valueType" :options="optionsValueType"
                              transfer></vxe-select>
                </template>
              </vxe-form-item>
                <vxe-form-item title="表单类型" field="formCode" :item-render="{}" :span="8">
                  <template #default>
                    <vxe-select v-model="row.formCode" :options="optionsFormCode"
                                transfer></vxe-select>
                  </template>
                </vxe-form-item>
                <vxe-form-item title="参数源" field="parameterSource" :item-render="{}" :span="12">
                  <template #default>
                    <vxe-select v-model="row.parameterSource" :options="optionsParameterSource"
                                transfer clearable></vxe-select>
                  </template>
                </vxe-form-item>
                <vxe-form-item title="验证规则" field="rules" :item-render="{}" :span="8">
                  <template #default>
                    <vxe-select v-model="row.rules" :options="ruleOptions" multiple
                                transfer></vxe-select>
                  </template>
                </vxe-form-item>

            </vxe-form>
          </div>
        </template>

        <!-- 默认展示插槽 -->
        <template #default="{ row }">
          <template v-if="['show', 'binary'].includes(col.field)">
            <span>{{ formatLabel(row, col) }}</span>
          </template>
          <template v-else>
            <span>{{ row[col.field] }}</span>
          </template>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<style scoped>
:deep(.vxe-table) {
  margin-top: 10px;
}

/* 全屏样式 */
.fullscreen-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2100;
  background-color: white;
  padding: 16px;
}
</style>

<style>
/* 覆盖 vxe-select 下拉面板的层级，确保在抽屉之上 */
.vxe-select--panel {
  z-index: 2307 !important;
}
</style>
