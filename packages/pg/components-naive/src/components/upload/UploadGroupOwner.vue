<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { MdiFileOutline, AntDesignCloseOutlined } from '@pg/icons';
import { requestClient } from '@pg/request';
import { useMessage } from 'naive-ui';
import draggable from 'vuedraggable';

import { isImage } from './setting';
import ModalUpload from './UploadGroup/ModalUploadList.vue';
import { UploadGroupProps } from './UploadGroup/props';

const props = defineProps({
  ...UploadGroupProps,
});

// const modelValue = defineModel<object>('modelValue');
const emit = defineEmits(['ok']);
const message = useMessage();
const dragging = ref(false);
const activatedUpload = ref('');
const uploadSetting = ref({});
const listData = ref({});
const modelValueData = ref({});
const draggingInfo = computed(() => (dragging.value ? 'under drag' : ''));
const listDataComputed = computed(() => listData.value);
const makeFileOwnerNum = ref(0);
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    modelValueData.value = newValue;

    console.log('modelValueData.oldValue=>',oldValue);
    console.log('modelValueData.newValue=>',newValue);
    console.log('modelValueData.value=>',modelValueData.value);
    getFileList();
  },
  { deep: true, immediate: true },
);

const checkMove = (e) => {
  window.console.log(`Future index: ${e.draggedContext.futureIndex}`);
};

const [ModalUploadCom, ModalUploadApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ModalUpload,
});
function modalUploadOk(val) {
  console.log('modalUploadOk=>', val);
  if (!listData.value[activatedUpload.value]) {
    listData.value[activatedUpload.value] = [];
  }
  if (val && val.data) {
    const sum = val.data.length + listData.value[activatedUpload.value].length;
    if (
      uploadSetting.value &&
      uploadSetting.value?.maxNumber &&
      sum > uploadSetting.value?.maxNumber
    ) {
      message.error(`超过限制数量: ${uploadSetting.value.maxNumber}`);
      return;
    }
    val.data.forEach((item) => {
      if (!listData.value[activatedUpload.value]) {
        listData.value[activatedUpload.value] = [];
      }
      listData.value[activatedUpload.value].push(item);
    });
  }
  emit('ok', { data: listData.value, owner: modelValueData.value });
}
// console.log('props.fetchSetting=>',props.fetchSetting);
/**
 * 添加 上传 图标
 * @param group
 */
const handleUpload = (group) => {
  if (props.enabled) {
    activatedUpload.value = group.key;
    uploadSetting.value = group;
    const uploadFetch = {
      header: {},
      params: {},
      url: '',
      urlLink: '',
      urlList: '',
      urlQr: '',
    };
    if (props.fetchSetting) {
      if (props.fetchSetting?.url) {
        uploadFetch.url = props.fetchSetting?.url;
      }
      if (props.fetchSetting?.urlQr) {
        uploadFetch.urlQr = props.fetchSetting?.urlQr;
      }
      if (props.fetchSetting?.urlLink) {
        uploadFetch.urlLink = props.fetchSetting?.urlLink;
      }
      if (props.fetchSetting?.urlList) {
        uploadFetch.urlList = props.fetchSetting?.urlList;
      }
      if (props.fetchSetting?.header) {
        Object.keys(props.fetchSetting?.header).forEach((key) => {
          uploadFetch.header[key] = props.fetchSetting.header[key];
        });
      }
      if (props.fetchSetting?.params) {
        Object.keys(props.fetchSetting?.params).forEach((key) => {
          uploadFetch.params[key] = props.fetchSetting.params[key];
        });
      }
    }
    // console.log('uploadSetting',uploadFetch);
    // console.log('uploadFetch',uploadFetch)
    ModalUploadApi.setData({
      callback: ({ data }) => {},
      isUpdate: false,
      sourceData: {},
      uploadFetch: uploadFetch,
      uploadSetting: group,
      values: {},
    });
    ModalUploadApi.open();
  }
};
/**
 * 删除指定 位置
 * @param item
 * @param index
 */
const delUploadItem = (item, index, key) => {
  if (listData.value[key] && listData.value[key].length > 0) {
    let fileOwner = '';
    for (const itemKey in props.group) {
      if (key === props.group[itemKey].key && props.group[itemKey]?.fileOwner) {
        fileOwner = props.group[itemKey].fileOwner;
      }
    }
    if (fileOwner) {
      fileOwnerDel({fileOwner:fileOwner,nos:[item.id]}).then((d) => {
        console.log('ddddd=>',d);
        listData.value[key].splice(index, 1);
      });
    }
  }
};
/**
 * 改名
 * @param item
 * @param index
 * @param key
 */
const changeFileName = (item, index, key) => {
  listData.value[key][index].edit = !(
    listData.value[key] && listData.value[key][index]?.edit
  );
};
/**
 * 保存修改
 * @param item
 * @param index
 * @param key
 */
const changeFileNameOk = (item, index, key) => {
  listData.value[key][index].edit = !(
    listData.value[key] && listData.value[key][index]?.edit
  );
};
/**
 * 中间省略
 * @param str
 * @param length
 */
function textEllipsisCenter(str, length = 13, fisrtIndex = 6) {
  if (!str) {
    return '';
  }
  // 中间显示省略号，截取显示括号内容
  let last = 0;
  const all = str.length;
  const fisrt = str.slice(0, Math.max(0, fisrtIndex));
  // 没有中文括号（
  if (str.includes('（')) {
    last = str.lastIndexOf('（');
  } else {
    // 也没有英文括号(
    if (str.includes('(')) {
      // 有英文括号(，就从英文括号开始截取
      last = str.lastIndexOf('(');
    } else {
      last = all - 5;
    }
  }
  // 如果长度大于13个字符才显示省略号
  if (all > length) {
    return `${fisrt}...${str.substring(last, all)}`;
  }
  return str;
}

const fileOwnerList = (params?) =>
  requestClient.post(props.fetchSetting.urlByOwner, params, {
    successMessageMode: 'none',
    withToken: true,
  });
const fileOwnerDel = (params?) =>
  requestClient.post(props.fetchSetting.urlByOwnerDel, params, {
    successMessageMode: 'none',
    withToken: true,
  });
function getFileList() {
  let parData = [];
  if (modelValueData.value) {
    for (const key in modelValueData.value) {
      parData.push({
        group: key,
        fileOwner: modelValueData.value[key],
      });
    }
  }
  if (parData && parData.length > 0) {
    fileOwnerList({groupData: parData}).then((d) => {
      console.log('ddddd=>',d)
      if (d && d.groupData) {
        listData.value = d.groupData;
      }
    });
  }
}
</script>
<template>
  <n-list class="pgUploadList ml-2">
    <n-list-item v-for="group in props.group" :key="group.key">
      <n-thing content-style="margin-top: 10px;">
        <template #header>
          {{ group.name }}
        </template>
        <template #header-extra>
          <n-tag :bordered="false" size="small" type="info">
            单个文件不超过
            <span class="color-red">{{ group?.maxSize }}</span> MB，最多只能上传
            <span class="color-red">{{ group?.maxNumber }}</span> 个文件{{
              group?.headerExtra
            }}
          </n-tag>
        </template>
        <template #description>
          <div
            v-if="group?.descriptionIsHtml"
            v-html="group?.description"
          ></div>
          <n-tag
            v-else-if="group?.description"
            :bordered="false"
            size="small"
            type="info"
          >
            {{ group?.description }}
          </n-tag>
        </template>
        <n-image-group>
          <n-space
            class="pgImgGroup flex"
            style="
              --n-dragger-border-hover: 1px dashed #18a058;
              --n-dragger-border: 1px dashed rgb(224, 224, 230);
            "
          >
            <draggable
              :group="{ name: 'people', pull: 'clone' }"
              :list="listDataComputed[group.key]"
              :move="checkMove"
              class="list-group flex"
              ghost-class="ghost"
              item-key="name"
              @end="dragging = false"
              @start="dragging = true"
            >
              <template #item="{ element: item, index }">
                <div class="position-relative m1 flex-col">
                  <AntDesignCloseOutlined
                    v-if="props.enabled"
                    alt="删除"
                    class="absolute right-0 z-10 cursor-pointer"
                    style="top: -8px; right: -8px"
                    @click="delUploadItem(item, index, group.key)"
                  />

                  <div v-if="isImage(item.url)">
                    <n-image :src="item.url" width="100" />
                  </div>
                  <div v-else>
                    <MdiFileOutline class="icon" size="100" />
                  </div>
                  <n-popover placement="bottom" trigger="hover">
                    <template #trigger>
                      <div class="title font-size-3 flex justify-center">
                        <div v-if="item.sourceName">
                          {{ textEllipsisCenter(item.sourceName, 13, 4) }}
                        </div>
                        <div v-else>没有名称</div>
                      </div>
                    </template>
                    <n-space
                      v-if="props.enabled"
                      class="flex flex-col"
                      style="flex-flow: column"
                    >
                      <div class="flex">
                        <n-button
                          quaternary
                          @click="changeFileName(item, index, group.key)"
                        >
                          改名
                        </n-button>
                        <n-button
                          quaternary
                          @click="delUploadItem(item, index, group.key)"
                        >
                          删除
                        </n-button>
                      </div>
                      <div v-if="item?.edit" class="flex">
                        <NInput
                          v-if="item?.edit"
                          v-model:value="item.sourceName"
                          style="--n-padding-left: 0; --n-padding-right: 0"
                        />
                        <VbenButton
                          class="ml-1"
                          quaternary
                          type="info"
                          @click="changeFileNameOk(item, index, group.key)"
                        >
                          确定
                        </VbenButton>
                      </div>
                    </n-space>
                  </n-popover>
                </div>
              </template>
            </draggable>
            <div
              class="n-upload-trigger n-upload-trigger--image-card"
              style="background-color: rgb(250 250 252)"
            >
              <div
                class="n-upload-dragger border-1 flex h-full items-center justify-center border-dashed"
                @click="handleUpload(group)"
              >
                <MdiFileOutline
                  alt="添加3"
                  class="size-8 cursor-pointer"
                  icon="ion:add"
                />
              </div>
            </div>
          </n-space>
        </n-image-group>
      </n-thing>
    </n-list-item>
    <ModalUploadCom :category="props.category" @ok="modalUploadOk" />
  </n-list>
</template>

<style scoped lang="less">
.pgUploadList {
  :deep(.n-thing-header) {
    justify-content: flex-start;
    .n-thing-header__extra {
      margin-left: 20px;
    }
  }
  .n-upload-trigger.n-upload-trigger--image-card {
    width: 100px;
    height: 100px;
  }
}
</style>
