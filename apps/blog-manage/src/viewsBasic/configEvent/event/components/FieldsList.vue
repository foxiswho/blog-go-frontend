<script setup lang="ts">
import {ref, reactive, h, onMounted, watch } from 'vue';
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

// 格式化下拉框显示文字
function formatLabel(row: any, col: any) {
  const value = row[col.field];
  const options = col.params?.options || [];
  if (col.field === 'rules') {
    if (Array.isArray(value)) {
    return value.map((v: any) => options.find((o: any) => o.value === v)?.label || v).join(',');
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

// 添加行
async function insertEvent() {
  const $table = xTable.value;
  if ($table) {
   const { row } = await $table.insert({
      show: 1,
      binary: 2,
      valueType: 'varchar',
      formCode: 'input_text',
      parameterSource: 'manual',
      rules: [],
    });
    await $table.setEditRow(row);
  }
}

// 删除行
async function removeEvent(row: any) {
  const $table = xTable.value;
  if ($table) {
    await $table.remove(row);
    if (row.id && row.id !== '0') {
      await deleteId(row.id);
    } else if (row.id) {
      bodyDelIds.value.push(row.id);
    }
    message.success('删除成功');
  }
}

// 保存行
async function saveRowEvent(row: any) {
  const $table = xTable.value;
  if (!$table) return;

  try {
   const { fullData } = $table.getTableData();

    // 构建保存数据
   const postData = {
      header: {
        id: props.eventData?.id || '0',
      eventNo: props.eventData?.no,
      },
      body: fullData,
      bodyDelIds: bodyDelIds.value,
    };

    await saveOrUpdate(postData, true);
    message.success('保存成功');

    // 清除已删除行的 ID 记录
    bodyDelIds.value = [];
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
      :max-height="isFullscreen ? 'calc(100vh - 120px)' : 500"
      :data="tableData"
      :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
      :edit-rules="{
        name: [{ required: true, content: '请输入字段名称' }],
        field: [{ required: true, content: '请输入字段标识' }, { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, content: '字段标识格式错误' }]
      }"
    >
      <vxe-column v-for="col in fieldColumns.filter(c => c.field !== undefined && c.type !== 'checkbox')" :key="col.field || col.type" v-bind="col">
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
            <vxe-select v-model="row[col.field]" :options="optionsValueType" transfer></vxe-select>
          </template>
          <template v-else-if="['formCode'].includes(col.field)">
            <vxe-select v-model="row[col.field]" :options="optionsFormCode" transfer></vxe-select>
          </template>

          <!-- 下拉多选 (验证规则) -->
          <template v-else-if="col.field === 'rules'">
            <vxe-select v-model="row.rules" :options="col.params?.options" multiple transfer></vxe-select>
          </template>

          <!-- 文本输入 (名称，标识，默认值) -->
          <template v-else-if="['name', 'field', 'defaultValue'].includes(col.field)">
            <vxe-input v-model="row[col.field]"></vxe-input>
          </template>
        </template>

        <!-- 默认展示插槽 -->
        <template #default="{ row }">
          <template v-if="col.slots?.default === 'operate'">
            <vxe-button
              icon="vxe-icon-edit"
              mode="text"
              title="保存"
              @click="saveRowEvent(row)"
            />
            <vxe-button
              icon="vxe-icon-delete"
              mode="text"
            status="danger"
              title="删除"
              @click="removeEvent(row)"
            />
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
  z-index: 9999;
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
