<script lang="ts" setup>
import type { RowVO } from '@pg/types';

import { computed, reactive, ref } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { requestClient } from '@pg/request';
import { useNode } from '@pg/utils';
import { NImage, NImageGroup, NPagination, NSpace, useMessage } from 'naive-ui';
import { type VxeGridInstance } from 'vxe-table';

import { PgTree } from '../../tree';
import ModalUpload from './ModalUpload.vue';
import { type Category, type Fetch, type UploadGroupItem } from './type';

const props = defineProps({
  category: {
    default: [],
    type: Array<Category>,
  },
  defaultLogo: {
    default: '',
    type: String,
  },
});
const emit = defineEmits(['select', 'register', 'ok']);

const message = useMessage();
const titleRef = ref('上传');
const selectIndex = ref(0);
const checkedNum = ref(1);
const fallbackImg = ref(props.defaultLogo);
const page = ref(1);
const pageCount = ref(1);
const pageTotal = ref(1);
const loading = ref(true);
const sourceData = ref({});
const uploadSetting = ref<UploadGroupItem>({
  key: '',
  maxNumber: 20,
  maxSize: 30,
  name: '',
});
const uploadFetch = ref<Fetch>({ url: '' });
const xGrid = ref<VxeGridInstance<RowVO>>();
const formParam = reactive({ catBack: '', catFront: '' });
const option = ref([
  { label: '自己上传', value: 'my' },
  { label: '远程下载', value: 'remote' },
  { label: '系统图片', value: 'sys' },
]);
const callback = ref(null);
const checkboxSelect = ref([]);
const checkboxSelectData = ref([]);
const checkboxSelectLengthComputed = computed(
  () => checkboxSelect.value.length,
);
const resultSuccess = <T = Recordable<any>,>(
  result: T,
  { message = 'ok' } = {},
) => ({
  code: '200',
  data: result,
  message,
  type: 'success',
});

const pageData = ref([]);

const pageDataComputed = computed(() => pageData.value);

function fetchList() {
  uploadList({ pageNum: page.value, pageSize: 24 }).then((d) => {
    // console.log('uploadList', d);
    pageData.value = [];
    d.data.forEach((item) => {
      item.checked = false;
      pageData.value.push(item);
    });
    // pageData.value = d.data;
    pageCount.value = d.totalPage;
    pageTotal.value = d.total;

    loading.value = false;
  });
}
const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    //modalApi.setState({ loading: true });
    //modalApi.setState({ loading: false });
  },
  onOpenChange(isOpen: boolean) {
    //modalApi.setState({ loading: true });
    checkboxSelect.value = [];
    checkboxSelectData.value = [];
    titleRef.value = '上传';
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      if (modalData.checkedNum) {
        checkedNum.value = modalData.checkedNum;
      }
      if (modalData.uploadSetting) {
        uploadSetting.value = modalData.uploadSetting;
      }
      if (modalData.uploadFetch) {
        uploadFetch.value = modalData.uploadFetch;
      }

      if (modalData.sourceData) {
        sourceData.value = modalData.sourceData;
      }
      if (modalData.callback) {
        callback.value = modalData.callback;
      }
      fetchList();
      modalApi.setState({ title: `${titleRef.value}` });
    }
    //modalApi.setState({ loading: false });
    loading.value = false;
  },
  title: '：',
});

/**
 * 重新加载
 */
function reloadTable() {
  const $grid = xGrid.value;
  if ($grid) {
    $grid.commitProxy('query');
  }
}

const reloadTree = ref(false);
const treeChang = (record, key) => {
  // console.log('record',record)
  // currenRecord.value= true
  // currenData.value = record
  formParam.catBack = record.key;
  reloadTable();
};
const treeChangFront = (record) => {
  // console.log('record',record)
  // currenRecord.value= true
  // currenData.value = record
  formParam.catFront = record.key;
  reloadTable();
};
/**
 * 树重载
 * @param e
 */
const treeOverload = (e, key) => {
  formParam.catBack = '';
  formParam.catFront = '';
  reloadTable();
};

/**
 * 重新加载
 */
function reloadPgTree() {
  reloadTree.value = true;
}

const afterFetch = (result) => {
  return useNode({
    data: result,
    // key 字段名称
    keyField: 'id',
    // label 字段名称
    labelField: 'name',
  }).getTreeData;
};

// 提交事件
function handleSubmit() {}

const [ModalUploadCom, ModalApiUpload] = useVbenModal({
  connectedComponent: ModalUpload,
});
/**
 * 上传完成
 * @param val
 */
const modalOk = (val) => {
  if (val?.action && (val?.action == 'finish' || val?.action == 'close')) {
    page.value = 1;
    fetchList();
  }
};
/**
 * 使用选中的图片
 */
const handleOkSelect = () => {
  if (
    uploadSetting.value?.maxNumber &&
    checkboxSelect.value.length > uploadSetting.value.maxNumber
  ) {
    message.error(`超过限制数量: ${uploadSetting.value.maxNumber}`);
    return;
  }
  const urlChecked = checkboxSelectData.value.map((item) => {
    return item.url;
  });
  emit('ok', {
    data: checkboxSelectData.value,
    value: urlChecked,
  });

  modalApi.close();

  setTimeout(() => {
    checkboxSelect.value = [];
    checkboxSelectData.value = [];
  }, 100);
};
/**
 * 上传图片按钮动作
 */
const handleUpload = () => {
  // console.log('list.uploadSetting.value',uploadSetting.value)
  // console.log('list.uploadFetch.value',uploadFetch.value)
  ModalApiUpload.setData({
    callback: ({ data }) => {},
    isUpdate: false,
    sourceData: {},
    uploadFetch: uploadFetch.value,
    uploadSetting: uploadSetting.value,
    values: {},
  });
  ModalApiUpload.open();
};
/**
 * 多选框动作
 * @param item
 * @param index
 */
const setCheckBox = (item, index) => {
  // console.log(index,'=>',item);
  if (pageData.value[index]?.checked === true) {
    pageData.value[index].checked = false;
    const indexCheck = checkboxSelect.value.indexOf(item.id);
    if (indexCheck > -1) {
      checkboxSelect.value.splice(index, 1);
    }
    // 重新计算选中的序号
    restSelectIndex();
  } else {
    selectIndex.value++;
    pageData.value[index].checked = true;
    pageData.value[index].selectIndex = selectIndex.value;
    checkboxSelectData.value.push(pageData.value[index]);
  }

  // console.log('all=>',pageData.value);
};

/**
 * 重新计算选中的序号
 */
function restSelectIndex() {
  checkboxSelectData.value = [];
  if (checkboxSelect.value.length > 0) {
    // 统计索引
    let selectIndexMap = new Map();
    checkboxSelect.value.forEach((item, index) => {
      selectIndexMap.set(item, index + 1);
    });
    // 重新 设置选中 和索引
    pageData.value.forEach((item) => {
      // console.log('pageData.value', item);
      const inde = selectIndexMap.get(item.id);
      if (inde) {
        item.selectIndex = inde;
        //item.checked = true;
        checkboxSelectData.value.push(item);
      } else {
        // item.checked = false;
        item.selectIndex = 0;
      }
      // console.log('item', item);
      // console.log('\n\n');
    });
    selectIndex.value = checkboxSelect.value.length;
    selectIndexMap = new Map();
  } else {
    selectIndex.value = 0;
  }
}

const uploadList = (params?) =>
  requestClient.post(uploadFetch.value.urlList, params, {
    successMessageMode: 'none',
    withToken: true,
  });
const updatePage = (page) => {
  loading.value = true;
  fetchList();
};
const itemDel = (item) => {};
function isImage(url) {
  return /\.(gif|jpg|jpeg|png|GIF|JPG|PNG|svg|SVG|webp|WEBP)$/.test(url);
}
</script>

<template>
  <Modal class="methodFast w-[900px]">
    <NLayout class="h-full p-2 pt-0" has-sider>
      <NLayoutSider
        :content-style="{ minWidth: '200px' }"
        class="flex"
        style="width: 200px; padding-top: 8px"
      >
        <n-tabs type="segment">
          <n-tab-pane
            v-for="item in props.category"
            v-if="props.category && props.category.length > 0"
            :name="item.key"
            :tab="item.name"
          >
            <PgTree
              :after-fetch="afterFetch"
              :api="item.func"
              :right-click-menu="false"
              @ok="treeChang($event, item.key)"
              @overload="treeOverload($event, item.key)"
            />
          </n-tab-pane>
          <n-tab-pane v-else name="def" tab="分类" />
        </n-tabs>
      </NLayoutSider>
      <NLayoutContent class="upManage flex">
        <n-spin :show="loading">
          <div class="menu ml-4 pt-2">
            <n-badge
              :max="15"
              :value="checkboxSelectLengthComputed"
              class="z-30"
            >
              <VbenButton
                :disabled="checkboxSelectLengthComputed <= 0"
                type="info"
                @click="handleOkSelect"
              >
                使用选中图片
              </VbenButton>
            </n-badge>
            <VbenButton class="ml-4" type="info" @click="handleUpload">
              上传图片
            </VbenButton>
            <VbenButton class="ml-4">删除图片</VbenButton>
            <NSelect
              :options="option"
              class="ml-4"
              style="width: 200px; display: inline-block"
            />
          </div>
          <n-checkbox-group v-model:value="checkboxSelect">
            <NImageGroup>
              <div
                :loading="loading"
                class="itemWrap ml-4 mt-4 flex h-full flex-wrap"
              >
                <template v-for="(item, index) in pageDataComputed" key="index">
                  <n-popover placement="right" trigger="hover">
                    <template #trigger>
                      <NSpace
                        class="m2 item"
                        style="
                          flex-flow: column;
                          position: relative;
                          width: 102px;
                          max-height: 102px;
                          min-height: 100px;
                        "
                      >
                        <div class="selected flex-justify-end flex flex-row">
                          <!--                          <n-tag-->
                          <!--                            v-if="item?.checked"-->
                          <!--                            class="color-white cursor-pointer bg-blue-500"-->
                          <!--                            round-->
                          <!--                            size="small"-->
                          <!--                            type="info"-->
                          <!--                            @click="setCheckBox(item, index)"-->
                          <!--                          >-->
                          <!--                            {{ item.selectIndex }}-->
                          <!--                          </n-tag>-->
                          <n-checkbox
                            :default-checked="
                              item.checked === false ? false : true
                            "
                            :value="item.id"
                            @click="setCheckBox(item, index)"
                          />
                        </div>
                        <div v-if="isImage(item.url)">
                          <NImage
                            :alt="item.sourceName"
                            :class="`${item?.checked ? '' : 'img'}`"
                            :fallback-src="fallbackImg"
                            :src="item.url"
                            :title="item.sourceName"
                            class="border-1 border-solid border-blue-500"
                            style="width: 100px; height: 100px"
                            lazy
                          />
                        </div>
                        <div v-else>
                          <span
                            class="icon bi:filetype-{{item.ext.replace('.','')}}"
                          ></span>
                        </div>

                        <div
                          :alt="item.sourceName"
                          :title="item.sourceName"
                          class="title text-ellipsis"
                          style="
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                          "
                        >
                          {{ item.sourceName }}
                        </div>
                      </NSpace>
                    </template>
                    <div class="flex flex-col">
                      <n-button quaternary @click="itemDel(item)">
                        删除
                      </n-button>
                    </div>
                  </n-popover>
                </template>
              </div>
            </NImageGroup>
          </n-checkbox-group>
          <div class="mt-10 flex justify-center">
            <NPagination
              v-model:page="page"
              :item-count="pageTotal"
              :page-sizes="[24, 48]"
              show-quick-jumper
              @update:page="updatePage"
            >
              <template #prefix> 共 {{ pageTotal }} 条 </template>
            </NPagination>
          </div>
        </n-spin>
      </NLayoutContent>
    </NLayout>
    <ModalUploadCom @ok="modalOk" />
  </Modal>
</template>
<style lang="less" scoped>
.upManage {
  .menu {
    line-height: 31px;
  }

  .itemWrap {
    .item {
      .selected {
        position: absolute;
        width: 80px;
        height: 20px;
        top: 7px;
      }

      .title {
        text-align: center;
      }

      .img {
        border-color: whitesmoke;
      }
    }
  }
}
</style>
