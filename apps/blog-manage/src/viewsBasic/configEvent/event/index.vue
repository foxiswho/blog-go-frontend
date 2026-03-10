<script setup lang="ts">
import {ref, onMounted, h} from 'vue';
import { NSplit, NSpin, NDataTable, NCard, NEmpty } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
// 假设 ListModel 用于类型定义，实际调用使用 List
import { List as ListModel } from '#/viewsBasic/configModel/api';
import { allByModel } from './api';
import DrawerEditTpl from './components/DrawerEdit.vue';
import { useVbenDrawer } from '@vben-core/popup-ui';

// 状态管理
const loading = ref(false);
const eventData = ref([]);
const tableData = ref([]);
const selectedRow = ref(null); // 当前选中的行
const pagination= ref({
  page: 1,
  pageSize: 1000, // 每页 1000 条
  itemCount: 0,
  showSizePicker: false,
  simple: true,
  size: 'small',
  pageSizes: [1000, 2000],
  onChange: (page: number) => {
    pagination.value.page = page;
    fetchData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize;
    pagination.value.page = 1;
    fetchData();
  }
});
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEditTpl,
});

// 表格列定义
const columns: DataTableColumns = [
  // { title: 'ID', key: 'id', width: 80 },
  { title: '名称', key: 'name', ellipsis: { tooltip: true },
    render: (row) => {
      return h(
        'div',
        {
          onClick: () => handleRowClick(row)
        },
        { default: () => row.name }
      )
    }
  },
  // { title: '类型', key: 'typeSys', width: 100 },
  // { title: '模型', key: 'model', width: 100 },
  // { title: '状态', key: 'state', width: 60 },
  // { title: '创建时间', key: 'createAt', width: 180 },
  // { title: '更新时间', key: 'updateAt', width: 180 },
];

// 事件列表表格列定义
const eventColumns: DataTableColumns = [
  { title: '模型', key: 'name', ellipsis: { tooltip: true },
  },
  // { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  // { title: '类型', key: 'typeSys', width: 100 },
  // { title: '模块', key: 'module', width: 150 },
  // { title: '所有者', key: 'owner', width: 100 },
];

// 处理行点击
const handleRowClick = (row) => {
  console.log('handleRowClick2', row);
  selectedRow.value = row;
  if (row.no) {
    loadEventData(row.no);
  }
};
const rowPropsMain = (row) => {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      console.log('handleRowClick2', row);
      selectedRow.value = row;
      if (row.no) {
        loadEventData(row.no);
      }
    }
  }
}
const rowPropsSplit = (row) => {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      console.log('handleRowClick2', row);
      selectedRow.value = row;
      if (row.no) {
        loadEventData(row.no);
      }
    }
  }
}
// 判断是否当前选中的行
const isRowSelected = (row) => {
  return selectedRow.value && selectedRow.value.no === row.no;
};


// 加载事件数据
const loadEventData = async (modelNo: string) => {
  try {
    const res = await allByModel({ modelNo:modelNo });
    if (res) {
      eventData.value = res;
    }
  } catch (error) {
    console.error('Failed to load event data:', error);
  }
};

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
   await ListModel({
     pageNum: pagination.value.page,
     pageSize: pagination.value.pageSize
    }).then((res) => {
      tableData.value = res.data;
     pagination.value.itemCount = res.total;
     pagination.value.page = res.pageNum;
      // 默认选中第一行并加载数据
      if (res.total > 0 && res.data.length > 0) {
        const firstItem = res.data[0];
       selectedRow.value = firstItem;
        if (firstItem.model) {
          loadEventData(firstItem.model);
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    loading.value = false;
  }
};
function addEventClick(opt) {
  console.log('addEventClick', opt)
  drawerApi.setData({
    // 表单值
    values: {},
    model: selectedRow.value,
    isUpdate: false,
  });
  drawerApi.open();
}
function reloadModelClick(opt) {
  console.log('reloadModelClick', opt)
}

onMounted(() => {
  fetchData();
});


</script>

<template>
  <div style="display: flex; flex-direction: column;min-height: 800px" class="p-2 h-full">
    <!-- 外层 Split: 左右分割 -->
    <n-split
     direction="horizontal"
      :min="0.1"
     default-size="200px"
     style="height: 100%;"
    >
      <!-- 左侧：数据列表 -->
      <template #1>
        <div style="height: 100%; overflow: auto;" class="bg-white">
          <n-spin :show="loading">
            <n-data-table
              :columns="columns"
              :data="tableData"
              :pagination="pagination"
              :bordered="false"
              :row-props="rowPropsMain"
              size="small"
              :row-class-name="(row) => isRowSelected(row) ? 'selected-row' : ''"
            />
          </n-spin>
        </div>
      </template>

      <!-- 右侧：嵌套 Split 容器 -->
      <template #2>
        <div style="height: 100%; padding: 0 10px  0 2px ;  background-color: #f5f5f5;">

          <!-- 内层 Split: 再次左右分割 -->
          <n-split
           direction="horizontal"
            :min="0.1"
           default-size="200px"
           style="height: 100%;"
          >
            <!-- 嵌套左侧：显示 allByModel 列表 -->
            <template #1>
              <div style="height: 100%;">
                <n-card style="height: 100%;" class="split-left">
                  <template #header>
                    <div v-if="selectedRow">
                      <n-button type="quaternary" size="tiny" class="add" @click="addEventClick">添加</n-button>
                      模型:{{selectedRow.name}}
                    </div>
                  </template>
                  <div v-if="eventData.length > 0">
                    <n-data-table
                      :columns="eventColumns"
                      :data="eventData"
                      :bordered="false"
                      size="small"
                      :pagination="false"
                      :row-props="rowPropsSplit"
                    />
                  </div>
                  <n-empty v-else description="暂无数据" />
                </n-card>
              </div>
            </template>

            <!-- 嵌套右侧：预留区域 -->
            <template #2>
              <n-card title="操作/扩展区域" style="height: 100%;">
                <p>右侧扩展内容区域</p>
              </n-card>
            </template>
          </n-split>

        </div>
      </template>
    </n-split>
    <Drawer @ok="reloadModelClick"/>
  </div>
</template>

<style scoped>
/* 确保容器高度撑满父元素，以便 Split 组件正常工作 */
:deep(.n-split-pane) {
  overflow: hidden;
}

/* 左侧表格行显示手型光标 - 多种选择器确保生效 */
:deep(.n-data-table__body tr) {
  cursor: pointer !important;
}

:deep(.n-data-table tbody tr) {
  cursor: pointer !important;
}

:deep(.n-data-table .n-data-table-tbody tr) {
  cursor: pointer !important;
}

/* 选中行的背景变色 - 使用更精确的选择器 */
:deep(.n-data-table .n-data-table-tbody tr.selected-row td) {
  background-color: #dee9fc !important;
}

:deep(.n-data-table .n-data-table-tbody tr.selected-row:hover td) {
  background-color: #dee9fc !important;
}
:deep(.split-left .n-card-header){
  padding-top: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e4e4e7;
  margin-bottom: 10px;
}

:deep(.split-left .n-card-header .add){
  float: right;
}
:deep(.split-left .n-card__content){
  padding-left: 0;
  padding-right: 0;
}
:deep(.split-left .n-card__content .n-data-table-thead){
  display: none;
}
</style>
