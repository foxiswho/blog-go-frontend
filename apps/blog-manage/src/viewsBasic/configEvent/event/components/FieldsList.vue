<script setup lang="ts">
import {ref, reactive, h, onMounted, watch, nextTick } from 'vue';
import {
  type VxeTableInstance,
  VXETable,
} from 'vxe-table';
import { message } from '#/adapter';
import { useVbenDrawer } from '@vben/common-ui';
import {
  allByEventNo,
  saveOrUpdate,
} from '#/viewsBasic/configEvent/field/api';
import { fieldColumns } from './data';
import {codeValueAllPublic, selectNodeAllPublic as selectDictNodeAllPublic} from "#/viewsBasic/data-dict/dict/api";
import { allByValueNo as getRuleFields, deleteIds } from '#/viewsBasic/modelRules/api';
import DrawerEditTpl from '#/viewsBasic/modelRules/components/DrawerEdit.vue';
import {NAlert} from 'naive-ui';
import {PgTreeSelect} from "@pg/components-n";

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

const optionsRuleMode = ref([]);
const ruleFieldsData = ref<any[]>([]);
const ruleFieldsLoading = ref(false);
const optionsParameterConfigDataSource = ref<any[]>([]);

const ruleFieldsColumns = [
  { field: 'name', title: '名称', minWidth: 120 },
  { field: 'ruleMode', title: '验证模式类型', minWidth: 120 },
  { field: 'code', title: '代码', minWidth: 120 },
  { field: 'errorMsg', title: '错误提示', minWidth: 150 },
  { field: 'sort', title: '排序', width: 80 },
  {
    field: 'action',
    title: '操作',
    width: 100,
    fixed: 'right',
  },
];

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
  onOk: () => {
    if (selectedRuleFieldRow.value) {
      loadRuleFieldsData(props.eventData?.no);
    }
    drawerApi.close();
  },
});

const selectedRuleFieldRow = ref<any>(null);
const isRuleFieldNewRow = ref(false);

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

function formatRuleMode(value: string) {
  const item = optionsRuleMode.value.find((o: any) => o.value === value);
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
      ruleFieldsData.value = [];
      selectedRuleFieldRow.value = null;
    }
  },
  { immediate: true }
);

// 加载数据 模型
async function loadData(eventNo: string) {
  try {
   const res = await allByEventNo({ eventNo:eventNo });
    if (res) {
     console.log('allByEventNo', res);
      tableData.value = res.map((item: any) => ({
        ...item,
        id: item.id || '0',
      }));
      bodyDelIds.value = [];
      ruleFieldsData.value = [];
      selectedRuleFieldRow.value = null;
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
  codeValueAllPublic({ typeCodeArr: ['basicModel:valueType', 'basicModel:formCode', 'basicModel:ParameterSource', 'basicModel:ruleMode'] }).then((res) => {
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
        if ('basicModel:ruleMode' === resKey) {
          for (const i in res[resKey]) {
           const item = res[resKey][i];
            optionsRuleMode.value.push({ value: item.key, label: item.label });
          }
        }
      }
    }
  });
};

// 加载验证模式字段数据
async function loadRuleFieldsData(eventNo: string) {
  try {
    ruleFieldsLoading.value = true;
    const res = await getRuleFields({ valueNo:eventNo });
    if (res) {
      ruleFieldsData.value = res;
    }
  } catch (error) {
    console.error('Failed to load rule fields data:', error);
  } finally {
    ruleFieldsLoading.value = false;
  }
}

async function loadParameterConfigDataSource() {
  try {
    const res = await selectDictNodeAllPublic({});
    if (res) {
      optionsParameterConfigDataSource.value = res.map((item: any) => ({
        value: item.code,
        label: item.name,
      }));
    }
  } catch (error) {
    console.error('Failed to load data dictionary:', error);
  }
}

onMounted(() => {
  loadCodeValueAllPublic();
  loadParameterConfigDataSource();
});

// 暴露刷新方法给父组件
defineExpose({
 reloadTable: () => {
   if (props.eventData?.no) {
      loadData(props.eventData.no);
      loadRuleFieldsData(props.eventData.no);
    }
  },
});
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

function addRuleField() {
  if (!selectedRuleFieldRow.value || !props.eventData?.no) {
    message.warning('请先选择字段');
    return;
  }
  if (isRuleFieldNewRow.value) {
    message.warning('只有字段保存到数据库后，才能操作');
    return;
  }
  drawerApi.setData({
    values: {},
    field: selectedRuleFieldRow.value,
    isUpdate: false,
  });
  drawerApi.open();
}

function editRuleField(row: any) {
  if (!selectedRuleFieldRow.value || !props.eventData?.no) {
    message.warning('请先选择字段');
    return;
  }
  if (isRuleFieldNewRow.value) {
    message.warning('只有字段保存到数据库后，才能操作');
    return;
  }
  drawerApi.setData({
    values: row,
    field: selectedRuleFieldRow.value,
    isUpdate: true,
  });
  drawerApi.open();
}

async function deleteRuleField(row: any) {
  if (!selectedRuleFieldRow.value || !props.eventData?.no) {
    message.warning('请先选择字段');
    return;
  }
  if (isRuleFieldNewRow.value) {
    message.warning('只有字段保存到数据库后，才能操作');
    return;
  }
  try {
    await deleteIds([row.id],selectedRuleFieldRow.value.no);
    message.success('删除成功');
  } catch (error) {
    message.error('删除失败');
  }
}

function cellClickEvent({ row }: any) {
  selectedRuleFieldRow.value = row;
  isRuleFieldNewRow.value = !row.id || row.id === '0';
  console.log('cellClickEvent', row)
  if (row?.no) {
    loadRuleFieldsData(row?.no);
  }
}
function reloadFieldRule(opt) {
  if (selectedRuleFieldRow.value?.no) {
    loadRuleFieldsData(selectedRuleFieldRow.value?.no);
  }
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
      :min-height="isFullscreen ? 'calc(100% - 120px)' : 'calc(100% - 300px)'"
      :data="tableData"
      :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
      :edit-rules="{
        name: [{ required: true, content: '请输入字段名称' }],
        field: [{ required: true, content: '请输入字段标识' }, { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, content: '字段标识格式错误' }]
      }"
      @cell-click="cellClickEvent"
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
          <div style="min-height: 300px" class="p-4" @click="cellClickEvent({ row })">
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
                <vxe-form-item title="参数源配置" field="parameterConfigDataDictionary" :item-render="{}" :span="12" v-if="row.formCode === 'Select' && row.parameterSource === 'dataDictionary'">
                  <template #default>
                    <PgTreeSelect
                      :api="selectDictNodeAllPublic"
                      :convertNode="true"
                      v-model:value="row.parameterConfigDataDictionary"
                    />
                  </template>
                </vxe-form-item>

<!--                <vxe-form-item title="验证规则" field="rules" :item-render="{}" :span="8">-->
<!--                  <template #default>-->
<!--                    <vxe-select v-model="row.rules" :options="ruleOptions" multiple-->
<!--                                transfer></vxe-select>-->
<!--                  </template>-->
<!--                </vxe-form-item>-->

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
    <div class="mt-4">
      <div class="mb-2 flex justify-between items-center">
        <span class="font-bold">验证模式字段配置</span>
        <vxe-button size="small" status="primary" @click="addRuleField">新增</vxe-button>
      </div>
      <template v-if="selectedRuleFieldRow">
        <template v-if="!isRuleFieldNewRow">
          <vxe-table
            border
            show-overflow
            :loading="ruleFieldsLoading"
            :data="ruleFieldsData"
          >
            <vxe-column v-for="col in ruleFieldsColumns" :key="col.field || col.type" v-bind="col">
              <template #default="{ row }">
                <template v-if="col.field === 'ruleMode'">
                  <span>{{ formatRuleMode(row[col.field]) }}</span>
                </template>
                <template v-else-if="col.field === 'action'">
                  <vxe-button type="text" status="primary" size="small" @click="editRuleField(row)">修改</vxe-button>
                  <vxe-button type="text" status="danger" size="small" @click="deleteRuleField(row)">删除</vxe-button>
                </template>
                <template v-else>
                  <span>{{ row[col.field] }}</span>
                </template>
              </template>
            </vxe-column>
          </vxe-table>
        </template>
        <template v-else>
          <NAlert type="warning" show-icon >
            只有字段保存到数据库后，才能操作
          </NAlert>
        </template>
      </template>
      <template v-else>
        <NAlert type="info" show-icon >
          请先点击上方表格中的某一行来显示验证模式字段配置
        </NAlert>
      </template>
    </div>
    <Drawer @ok="reloadFieldRule"/>
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
