<script setup lang="ts">
import type { RowVO } from '@pg/types';
import type { Recordable } from '@vben/types';

import { computed, h, onMounted, reactive, ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben-core/popup-ui';

import { PgTree } from '@pg/components-n';

import {
  type VxeGridInstance,
  type VxeGridListeners,
  type VxeGridProps,
  VXETable,
} from 'vxe-table';

import { dialog, message } from '#/adapter';

import CategoryTpl from '#/viewsBlog/collectCategory/invoke/category.vue';
import ModalTagTpl from '#/viewsBasic/tags/relation/invoke/ModalTag.vue';
import { selectNodeAllPublic } from '#/viewsBlog/collectCategory/api';
import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  deleteIds as categoryDeleteIds,
  List,
} from './api';
import Edit from './components/drawerEdit.vue';
import { columns } from './data';
import { NTag, type SelectRenderTag } from 'naive-ui';
import { FluentWindowNew20Filled } from '@pg/icons';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(false);
const tabSelectActive = ref('system');
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = reactive({ categoryNo: '', tagsQuery: [] });

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  console.log('record', record);
  formParam.categoryNo = record.data.no;
  reloadTree();
  reloadTable();

  setTimeout(() => {
    reloadTree();
  }, 2000);
};
/**
 * 重新加载
 */
function reloadTree() {
  reloadTreeState.value = true;
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {
  formParam.categoryNo = '';
  formParam.tagsQuery = [];
  reloadTable();
};
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Edit,
});

const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: CategoryTpl,
});
/**
 * 树 搜索尾部菜单
 */
const menuDropdownOptions = [
  {
    label: '添加',
    key: '添加',
    props: {
      onClick: () => {
        modalApi.setData({
          // 表单值
          values: {},
          isUpdate: false,
        });
        modalApi.open();
      },
    },
  },
];

const xGrid = ref<VxeGridInstance<RowVO>>();
const gridOptions = reactive<VxeGridProps<RowVO>>({
  stripe: true, // 斑马纹
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  id: 'full_role',
  // height: '99%',
  minHeight: 800,
  rowConfig: {
    keyField: 'id',
    isHover: true,
  },
  expandConfig: {
    expandAll: true,
  },
  cellConfig: {
    height: 80,
  },
  columnConfig: {
    resizable: true,
  },
  printConfig: {
    columns: [
      { field: 'name' },
      { field: 'nameFl' },
      { field: 'code' },
      { field: 'state' },
      { field: 'createAt' },
    ],
  },
  sortConfig: {
    trigger: 'cell',
    remote: true,
  },
  filterConfig: {
    remote: true,
  },
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100, 500, 1000],
  },
  formConfig: {
    titleWidth: 100,
    titleAlign: 'right',
    items: [
      {
        field: 'wd',
        title: '关键词',
        span: 6,
        itemRender: {
          name: '$input',
          props: { placeholder: '请输入', clearable: true },
        },
      },
      {
        field: 'no',
        title: '文章编号',
        span: 6,
        itemRender: {
          name: '$input',
          props: { placeholder: '请输入', clearable: true },
        },
      },
      {
        field: 'tagsQuery',
        title: '标签',
        span: 5,
        slots: { default: 'tagsQuery' },
      },
      {
        field: 'state',
        title: '状态',
        span: 6,
        folding: false,
        itemRender: {
          name: '$select',
          options: [
            { label: '停用', value: '2' },
            { label: '有效', value: '1' },
            { label: '弃置', value: '12' },
            { label: '取消', value: '11' },
          ],
          props: { clearable: true },
        },
      },
      {
        span: 24,
        align: 'center',
        collapseNode: true,
        itemRender: {
          name: '$buttons',
          children: [
            { props: { type: 'submit', content: '搜索', status: 'primary' } },
            { props: { type: 'reset', content: '重置' } },
          ],
        },
      },
    ],
  },
  toolbarConfig: {
    buttons: [
      { code: 'create', name: '新增' },
      { code: 'batchEnable', name: '批量有效' },
      { code: 'batchDisable', name: '批量停用' },
      { code: 'physicalDeletion', name: '物理删除' },
      {
        status: 'primary',
        icon: 'vxe-icon-ellipsis-v',
        size: 'mini',
        circle: true,
        dropdowns: [{ code: 'cacheOverride', name: '缓存更新' }],
      },
    ],
    slots: {
      // buttons: 'toolbar_buttons',
      // tools: 'toolbar_tools'
    },
    refresh: true, // 显示刷新按钮
    import: false, // 显示导入按钮
    export: false, // 显示导出按钮
    print: false, // 显示打印按钮
    zoom: true, // 显示全屏按钮
    custom: true, // 显示自定义列按钮
  },
  proxyConfig: {
    seq: true, // 启用动态序号代理，每一页的序号会根据当前页数变化
    sort: true, // 启用排序代理，当点击排序时会自动触发 query 行为
    filter: true, // 启用筛选代理，当点击筛选时会自动触发 query 行为
    form: true, // 启用表单代理，当点击表单提交按钮时会自动触发 reload 行为
    response: {
      // 对应响应结果 Promise<{ result: [], page: { total: 100 } }>
      result: 'data', // 配置响应结果列表字段
      total: 'total', // 配置响应结果总页数字段
    },
    // 只接收Promise，具体实现自由发挥
    ajax: {
      // 当点击工具栏查询按钮或者手动提交指令 query或reload 时会被触发
      query: ({ page, sorts, filters, form }) => {
        const queryParams: any = Object.assign({}, form);
        // 处理排序条件
        const firstSort = sorts[0];
        if (firstSort) {
          queryParams.sort = firstSort.field;
          queryParams.order = firstSort.order;
        }
        // 处理筛选条件
        filters.forEach(({ field, values }) => {
          queryParams[field] = values.join(',');
        });
        queryParams.pageSize = page.pageSize;
        queryParams.pageNum = page.currentPage;
        if (formParam) {
          for (const key in formParam) {
            queryParams[key] = formParam[key];
          }
        }
        return List(queryParams);
      },
      // 当点击工具栏删除按钮或者手动提交指令 delete 时会被触发
      delete: ({ body }) => {
        const { removeRecords } = body;
        const ids: [] = [];
        removeRecords.forEach((item) => {
          // 判断状态是否可删除
          if (item.state < 10) {
            ids.push(item.id);
          }
        });
        if (ids.length <= 0) {
          message.warning('你没有选择任何数据');
          return Promise.resolve();
        }
        return deleteIds(ids).then(() => {
          reloadTable();
        });
      },
    },
  },
  columns,
  importConfig: {
    remote: true,
    types: ['xlsx'],
    modes: ['insert'],
    // 自定义服务端导入
    importMethod({ file }) {
      const $grid = xGrid.value;
      const formBody = new FormData();
      formBody.append('file', file);
      return fetch(`/api/pub/import`, { method: 'POST', body: formBody })
        .then((response) => response.json())
        .then((data) => {
          VXETable.modal.message({
            content: `成功导入 ${data.result.insertRows} 条记录！`,
            status: 'success',
          });
          // 导入完成，刷新表格
          if ($grid) {
            $grid.commitProxy('query');
          }
        })
        .catch(() => {
          VXETable.modal.message({
            content: '导入失败，请检查数据是否正确！',
            status: 'error',
          });
        });
    },
  },
  exportConfig: {
    remote: true,
    types: ['xlsx'],
    modes: ['current', 'selected', 'all'],
    // 自定义服务端导出
    exportMethod({ options }) {
      return Promise.resolve();
    },
  },
  checkboxConfig: {
    labelField: 'id',
    reserve: true,
    highlight: true,
    range: true,
  },
});

const gridEvent: VxeGridListeners<RowVO> = {
  proxyQuery() {
    console.log('数据代理查询事件');
  },
  proxyDelete() {
    console.log('数据代理删除事件');
  },
  proxySave() {
    console.log('数据代理保存事件');
  },
  toolbarButtonClick({ code }) {
    const $grid = xGrid.value;
    if ($grid) {
      switch (code) {
        // 批量 停用
        case 'batchDisable': {
          const checkboxRecords = $grid.getCheckboxRecords();
          if (checkboxRecords.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          const ids = [];
          checkboxRecords.forEach((item) => {
            console.log('$grid.item', item);
            if (item.state == 1) {
              ids.push(item.id);
            } else {
              $grid.setCheckboxRow(item, false);
            }
          });
          if (ids.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          batchSelectDisable(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
        // 批量 有效
        case 'batchEnable': {
          console.log('$grid.getCheckboxRecords()', $grid.getCheckboxRecords());
          const checkboxRecords = $grid.getCheckboxRecords();
          if (checkboxRecords.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          const ids = [];
          checkboxRecords.forEach((item) => {
            console.log('$grid.item', item);
            if (item.state === 2) {
              ids.push(item.id);
            } else {
              $grid.setCheckboxRow(item, false);
            }
          });
          if (ids.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          batchSelectEnable(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
        // 缓存更新
        case 'cacheOverride': {
          cacheOverride();
          break;
        }
        case 'create': {
          formDrawerApi.setData({
            // 表单值
            values: {},
            parent: currenData.value?.data,
            isUpdate: false,
          });
          formDrawerApi.open();
          break;
        }
        case 'myExport': {
          $grid.exportData({
            type: 'csv',
          });
          break;
        }
        case 'myInsert': {
          $grid.insert({
            name: 'xxx',
          });
          break;
        }
        case 'mySave': {
          const { insertRecords, removeRecords, updateRecords } =
            $grid.getRecordset();
          VXETable.modal.message({
            content: `新增2 ${insertRecords.length} 条，删除 ${removeRecords.length} 条，更新 ${updateRecords.length} 条`,
            status: 'success',
          });
          break;
        }
        // 物理删除
        case 'physicalDeletion': {
          const checkboxRecords = $grid.getCheckboxRecords();
          if (checkboxRecords.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          const ids = [];
          checkboxRecords.forEach((item) => {
            console.log('$grid.item', item);
            ids.push(item.id);
          });
          if (ids.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          batchSelectPhysicalDeletion(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
        // 删除恢复
        case 'recovery': {
          const checkboxRecords = $grid.getCheckboxRecords();
          if (checkboxRecords.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          const ids = [];
          checkboxRecords.forEach((item) => {
            console.log('$grid.item', item);
            if (item.state > 10) {
              ids.push(item.id);
            } else {
              $grid.setCheckboxRow(item, false);
            }
          });
          if (ids.length <= 0) {
            message.warning('你没有选择任何数据');
            return;
          }
          batchSelectRecovery(ids, () => {
            reloadTable();
            $grid.setAllCheckboxRow(false);
          });
          break;
        }
      }
    }
  },
  toolbarToolClick({ code }) {
    const $grid = xGrid.value;
    if ($grid) {
      switch (code) {
        case 'myInsert': {
          $grid.insert({
            name: 'xxx',
          });
          break;
        }
        case 'myPrint': {
          $grid.print();
          break;
        }
        case 'mySave': {
          const { insertRecords, removeRecords, updateRecords } =
            $grid.getRecordset();
          VXETable.modal.message({
            content: `新增 ${insertRecords.length} 条，删除 ${removeRecords.length} 条，更新 ${updateRecords.length} 条`,
            status: 'success',
          });
          break;
        }
      }
    }
  },
};

const hasActiveEditRow = (row: RowVO) => {
  const $grid = xGrid.value;
  if ($grid) {
    return $grid.isEditByRow(row);
  }
  return false;
};
const editRowEvent = (row: RowVO) => {
  formDrawerApi.setData({
    // 表单值
    values: row,
    isUpdate: true,
  });
  formDrawerApi.open();
};

const clearRowEvent = () => {
  const $grid = xGrid.value;
  if ($grid) {
    $grid.clearEdit();
  }
};
const saveRowEvent = async (row: RowVO) => {
  const $grid = xGrid.value;
  if ($grid) {
    await $grid.clearEdit();
    gridOptions.loading = true;
    // 模拟异步保存
    setTimeout(() => {
      gridOptions.loading = false;
      VXETable.modal.message({
        content: `${JSON.stringify(row)}`,
        status: 'success',
      });
    }, 300);
  }
};
/**
 * 删除 指定行数据
 * @param row
 */
const removeRowEvent = async (row: RowVO) => {
  const type = await VXETable.modal.confirm('您确定要删除该数据?');
  const $grid = xGrid.value;
  if ($grid && type === 'confirm') {
    deleteIds([row.id]);
    await $grid.remove(row);
  }
};
/**
 * 删除 指定数据
 * @param row
 */
const removeTreeEvent = (row: RowVO) => {
  dialog.warning({
    title: '确认删除',
    content: `是否[删除]选中数据[ ${row.name} ]，操作后数据不可恢复`,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      categoryDeleteIds([row.id]).then(() => {
        setTimeout(() => {
          reloadTree();
        }, 2000);
      });
    },
  });
};

onMounted(() => {});

/**
 * 重新加载
 */
function reloadTable() {
  const $grid = xGrid.value;
  if ($grid) {
    $grid.commitProxy('query');
  }
}

function treeChangOverload() {
  reloadTable();
  treeOverload();
}

/**
 * 树右键菜单
 * @param option
 */
const rightClickMenuOptions = ({ option }) => {
  return [
    {
      label: '添加下级',
      key: '添加下级',
      props: {
        onClick: () => {
          modalApi.setData({
            // 表单值
            values: {},
            parent: option.data,
            isUpdate: false,
          });
          modalApi.open();
        },
      },
    },
    {
      label: '修改',
      key: '修改',
      props: {
        onClick: () => {
          modalApi.setData({
            // 表单值
            values: option.data,
            isUpdate: true,
          });
          modalApi.open();
        },
      },
    },
    {
      label: '删除',
      key: '删除',
      props: {
        onClick: () => {
          removeTreeEvent(option.data);
        },
      },
    },
  ];
};
const optionsTags = ref([]);
const [ModalTag, modalTagApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ModalTagTpl,
});
const renderTag: SelectRenderTag = ({ option, handleClose }) => {
  // console.log('renderTag', option)
  return h(
    NTag,
    {
      type: option.data.attributeMap.type as
        | 'default'
        | 'error'
        | 'info'
        | 'success'
        | 'warning',
      bordered: option.data.attributeMap.bordered,
      color: option.data.attributeMap.color,
      round: option.data.attributeMap.round,
      size: option.data.attributeMap.size,
      strong: option.data.attributeMap.strong,
      closable: true,
      onMousedown: (e: FocusEvent) => {
        e.preventDefault();
      },
      onClose: (e: MouseEvent) => {
        e.stopPropagation();
        handleClose();
      },
    },
    { default: () => option.label },
  );
};
async function modalOkTags(e) {
  console.log('modalOkTags', e);
  const $grid = xGrid.value;
  if (e && $grid) {
    //const values = await formApi.getValues();
    const values = $grid.getFormData();
    console.log('search', values);
    let tagsQuery = [];
    if (values.hasOwnProperty('tagsQuery')) {
      if (!values.tagsQuery) {
        values.tagsQuery = [];
      }
      tagsQuery = [];
      for (const i in values.tagsQuery) {
        tagsQuery.push(values.tagsQuery[i]);
      }
    }
    for (const i in e) {
      const obj = e[i];
      const tag = {
        label: obj.name,
        value: obj.tagNo,
        data: obj,
      };
      const index = optionsTags.value.indexOf(tag);
      if (index === -1) {
        optionsTags.value.push(tag);
        // optionsTags.value.splice(index,1)
      }

      const index2 = tagsQuery.indexOf(obj.code);
      if (index2 === -1) {
        tagsQuery.push(obj.code);
      }
      // console.log('index2',index2, tagsQuery,obj);
    }
    //
    //console.log('optionsTags', optionsTags.value);
    console.log('tagsQuery', tagsQuery);
    //formApi.setFieldValue('tagsQuery', tagsQuery);
    formParam.tagsQuery = tagsQuery;
  } else {
    formParam.tagsQuery = [];
  }
}
function iconclick(e) {
  // console.log('xxxxx', e);
  modalTagApi.setData({
    values: {},
    isUpdate: false,
  });
  modalTagApi.open();
}
</script>

<template>
  <div>
    <NLayout class="h-full p-2" has-sider>
      <NLayoutSider class="min-w-[160px]" width="160">
        <PgTree
          :api="selectNodeAllPublic"
          :is-node-all="true"
          :params="{ by: 'no' }"
          :menu-dropdown-options="menuDropdownOptions"
          :reload="reloadTreeComputed"
          :right-click-menu="true"
          :right-click-menu-options="rightClickMenuOptions"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </NLayoutSider>
      <NLayout class="w-[calc(100%-160px)]">
        <NLayoutContent>
          <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvent">
            <template #tagsQuery>
              <n-select
                placeholder="选择"
                :show="false"
                v-model:value="formParam.tagsQuery"
                multiple
                :render-tag="renderTag"
                :options="optionsTags"
                @update:value="
                  (opt) => {
                    //formApi.setFieldValue('tagsQuery', opt);
                  }
                "
              >
                <template #arrow>
                  <FluentWindowNew20Filled
                    @click="iconclick"
                    style="
                      width: 30px;
                      height: 30px;
                      margin-top: -5px;
                      margin-left: -5px;
                      color: #020617;
                    "
                    class="size-10 transition-none hover:text-black"
                  />
                </template>
              </n-select>
            </template>
            <template #operate="{ row }">
              <vxe-button
                icon="vxe-icon-edit"
                mode="text"
                title="编辑"
                @click="editRowEvent(row)"
              />
              <!--              <vxe-button-->
              <!--                icon="vxe-icon-delete"-->
              <!--                mode="text"-->
              <!--                status="danger"-->
              <!--                title="删除"-->
              <!--                @click="removeRowEvent(row)"-->
              <!--              />-->
            </template>
            <template #nameAll="{ row }">
              <div>
                <h2 class="text-2xl font-medium">{{ row.name }}</h2>
              </div>
              <div>
                {{ row.description }}
              </div>
            </template>
            <template #expandContent="{ row }">
              <dl class="expandContent m-2">
                <dd class="title">
                  <n-tag
                    v-if="row.typeContent === 'original'"
                    type="success"
                    size="small"
                  >
                    原
                  </n-tag>
                  <n-tag
                    v-if="row.typeContent === 'repost'"
                    type="error"
                    size="small"
                  >
                    转
                  </n-tag>
                  <n-tag
                    v-if="row.typeContent === 'translation'"
                    type="error"
                    size="small"
                  >
                    译
                  </n-tag>

                  <n-tag
                    v-if="row.typeReading === 'unread'"
                    size="small"
                    class="mt-2"
                  >
                    未读
                  </n-tag>
                  <n-tag
                    v-if="row.typeReading === 'warning'"
                    type="info"
                    size="small"
                    class="mt-2"
                  >
                    读中
                  </n-tag>
                  <n-tag
                    v-if="row.typeReading === 'completed'"
                    type="info"
                    size="small"
                    class="mt-2"
                  >
                    已读
                  </n-tag>
                </dd>
                <dd class="content">
                  <n-grid x-gap="12" :cols="1" class="ml-2">
                    <n-gi>
                      <div
                        v-if="row.tagsStyle"
                        class="flex flex-row flex-wrap leading-6"
                      >
                        标签：
                        <div v-for="item in row.tagsStyle" class="mr-2">
                          <NTag
                            size="small"
                            :bordered="item.attributeMap.bordered"
                            :type="item.attributeMap.type"
                            :color="item.attributeMap.color"
                            :size="item.attributeMap.size"
                            :strong="item.attributeMap.strong"
                            :round="item.attributeMap.round"
                            class="cursor-pointer"
                          >
                            {{ item.name }}
                          </NTag>
                        </div>
                      </div>
                      <div v-else>标签：{{ row.tags }}</div>
                    </n-gi>
                    <n-gi> 操作时间：{{ row.operationTime }} </n-gi>
                    <n-gi> 编号：{{ row.no }} </n-gi>
                  </n-grid>
                </dd>
              </dl>
            </template>
          </vxe-grid>
        </NLayoutContent>
      </NLayout>
      <FormDrawer @ok="reloadTable" />
      <Modal @ok="reloadTree" />
    </NLayout>
    <ModalTag @ok="modalOkTags" />
  </div>
</template>

<style scoped>
.grid2 .vxe-tools--wrapper {
  margin-right: 0.8em;
}
.goods,
.goods dd {
  padding: 0px;
  margin: 0px;
}
.goods {
  display: flex;
}
.goods .image {
  margin-right: 10px;
}
dl.expandContent {
  display: flex;
}
dl.expandContent dd {
  padding: 0px;
  margin: 0px;
}
dl.expandContent dd.content {
  width: 100%;
}
dl.expandContent dd.title {
  flex: 0 0 60px;
  text-align: center;
  border-right: 1px solid #dbd4d4;
}
</style>
