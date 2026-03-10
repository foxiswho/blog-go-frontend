<script setup lang="ts">
import {reactive, ref, watch } from 'vue';
import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';
import { message } from '#/adapter';
import {
  allByEventNo,
  saveOrUpdate,
  deleteId,
} from '#/viewsBasic/configEvent/field/api';
import { fieldColumns } from './data';

// 接收父组件传递的 event 对象
const props = defineProps<{
  eventData?: any;
}>();

const xGrid = ref<VxeGridInstance>();
const tableData = ref<any[]>([]);
const bodyDelIds = ref<string[]>([]);

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
  if (col.field === 'valueType' || col.field === 'formCode' || col.field === 'parameterSource') {
   const option = options.find((o: any) => o.value === value);
   return option?.label || value;
  }
  return value;
}

const gridOptions = reactive<VxeGridProps>({
  stripe: true,
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  minHeight: 600,
  rowConfig: {
    keyField: 'id',
   isHover: true,
   isCurrent: true,
  },
 columnConfig: {
   resizable: true,
  },
  pagerConfig: {
   enabled: false,
  },
  columns: fieldColumns.filter(col => col.field !== undefined && col.type !== 'checkbox'),
  // data: tableData.value,
});

// 添加行
async function insertEvent() {
 const $grid = xGrid.value;
  if ($grid) {
   await $grid.insert({
      show: 1,
      binary: 2,
     valueType: 'varchar',
     formCode: 'input_text',
     parameterSource: 'manual',
     rules: [],
    });
  }
}

// 删除行
async function removeEvent(row: any) {
 const type = await VXETable.modal.confirm('您确定要删除该数据？');
 const $grid= xGrid.value;
  if ($grid && type === 'confirm') {
   if (row.id && row.id !== '0') {
     await deleteId(row.id);
    }
   await $grid.remove(row);
    message.success('删除成功');
  }
}

// 保存行
async function saveRowEvent(row: any) {
 const $grid = xGrid.value;
  if (!$grid) return;

  // 校验当前行
 const errMap = await $grid.validateRow(row);
  if (errMap) {
    message.error('字段校验失败，请检查必填项');
   return;
  }

  try {
   const { fullData } = $grid.getTableData();

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

    // 清除已保存行的 ID 记录
   if (row.id === '0' || !row.id) {
      // 新保存的行，更新其 ID
     const savedRow = fullData.find((item: any) => item.name === row.name && item.field === row.field);
     if (savedRow && savedRow.id) {
       await $grid.updateRow(row, { id: savedRow.id });
      }
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
   await allByEventNo({ eventNo }).then((res) => {
     if (res) {
       console.log('allByEventNo', res);
       tableData.value = res.map((item: any) => ({
         ...item,
         id: item.id || '0',
       }));
       bodyDelIds.value = [];
     }
   });
  } catch (error) {
   console.error('Failed to load fields data:', error);
    message.error('加载字段数据失败');
  }
}

// 暴露刷新方法给父组件
defineExpose({
  reloadTable: () => {
   if (props.eventData?.no) {
      loadData(props.eventData.no);
    }
  },
});
</script>

<template>
  <div class="h-full p-2">
    <div class="mb-2 flex justify-between items-center">
      <span class="font-bold">字段配置</span>
      <vxe-button size="small" status="primary" @click="insertEvent">新增字段</vxe-button>
    </div>
    <vxe-grid ref="xGrid" v-bind="gridOptions" :data="tableData">
      <template #operate="{ row }">
        <vxe-button
          icon="vxe-icon-edit"
          mode="text"
          title="编辑"
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
    </vxe-grid>
  </div>
</template>

<style scoped>
:deep(.vxe-grid) {
  height: calc(100% - 40px);
}
</style>
