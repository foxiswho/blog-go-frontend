<script setup lang="ts">
import type { Fetch, AnyUploadFn } from './UploadGroup/type';

import { computed, ref, watch } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { isFunction } from '@vben-core/shared/utils';

import { MdiFileOutline, AntDesignCloseOutlined } from '@pg/icons';
import { useMessage } from 'naive-ui';
import draggable from 'vuedraggable';

import { isImage } from './setting';
import ModalUploadList from './UploadGroup/ModalUploadList.vue';
import { UploadGroupProps } from './UploadGroup/props';
import { emptyUploadFn } from './UploadGroup/type';
import { getNanoidNo } from '@pg/utils';

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
const modelValueData = ref('');
const draggingInfo = computed(() => (dragging.value ? 'under drag' : ''));
const listDataComputed = computed(() => listData.value);
const makeFileOwnerNum = ref(0);
const fetchSetting = ref<Fetch>({
  url: '',
  uploadFn: emptyUploadFn,
});
if (isFunction(props.fetchSetting?.uploadFn)) {
  fetchSetting.value.uploadFn = props.fetchSetting?.uploadFn;
}
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (props.isStandalone) {
      if (typeof newValue === 'string' && newValue) {
        modelValueData.value = newValue;
      } else {
        modelValueData.value = 'context-auto-' + getNanoidNo(32);
      }
    } else {
      if (typeof newValue === 'object' && newValue && Object.keys(newValue).length > 0) {
        modelValueData.value = { ...newValue };
      } else {
        modelValueData.value = {};
        props.group.forEach((g) => {
          modelValueData.value[g.key] = 'context-auto-' + getNanoidNo(32);
        });
      }
    }

    console.log('modelValueData.newValue=>', modelValueData.value);
    getFileList();
  },
  { deep: true, immediate: true },
);

const checkMove = (e) => {
  window.console.log(`Future index: ${e.draggedContext.futureIndex}`);
};

const [ModalUploadCom, ModalUploadApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ModalUploadList,
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
    let ids = [];
    val.data.forEach((item) => {
      if (!listData.value[activatedUpload.value]) {
        listData.value[activatedUpload.value] = [];
      }
      listData.value[activatedUpload.value].push(item);
      //
      ids.push(item.id);
    });
    if (isFunction(fetchSetting.value?.uploadFn)) {
      const param = {
        ...fetchSetting.value.params,
        fileOwner:val.fileOwner,
        fileOwnerSub:activatedUpload.value,
        nos: ids,
      };
      fetchSetting.value
        ?.uploadFn(param, {
          type: 'updateByFileOwner',
          config: {
            successMessageMode: 'none',
            errorMessageMode: 'message',
            withToken: true,
          },
        });
    }
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
    if (props.fetchSetting) {
      if (props.fetchSetting?.header) {
        Object.keys(props.fetchSetting?.header).forEach((key) => {
          fetchSetting.value.header[key] = props.fetchSetting.header[key];
        });
      }
      if (props.fetchSetting?.params) {
        Object.keys(props.fetchSetting?.params).forEach((key) => {
          fetchSetting.value.params[key] = props.fetchSetting.params[key];
        });
      }
      if (isFunction(props.fetchSetting?.uploadFn)) {
        fetchSetting.value.uploadFn = props.fetchSetting?.uploadFn;
      }
    }
    let fileOwner = '';
    if (props.isStandalone) {
      fileOwner = modelValueData.value;
    } else {
      fileOwner = modelValueData.value[group.key];
      if (!fileOwner) {
        fileOwner = 'context-auto-' + getNanoidNo(32);
        modelValueData.value[group.key] = fileOwner;
      }
    }
    console.log('fileOwner', fileOwner);
    ModalUploadApi.setData({
      callback: ({ data }) => {},
      isUpdate: false,
      sourceData: fileOwner,
      fileOwner: fileOwner,
      fetchSetting: fetchSetting.value,
      uploadSetting: {
        ...group,
        params: {
          fileOwner: fileOwner,
          fileOwnerSub: group.key,
        },
      },
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
    if (typeof modelValueData.value === 'object') {
      fileOwner = modelValueData.value[key];
    } else {
      fileOwner = modelValueData.value;
    }
    if (fileOwner) {
      if (isFunction(fetchSetting.value?.uploadFn)) {
        const param = {
          ...fetchSetting.value.params,
          fileOwner: fileOwner,
          nos: [item.id],
        };
        fetchSetting.value
          ?.uploadFn(param, {
            type: 'ownerDel',
            config: {
              successMessageMode: 'none',
              withToken: true,
            },
          })
          .then((d) => {
            console.log('ddddd=>', d);
            if (d) {
              listData.value[key].splice(index, 1);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
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

function getFileList() {
  const parData = [];
  let fileOwner = [];
  if (props.isStandalone) {
    fileOwner = [modelValueData.value];
    const firstGroup = props.group[0];
    if (firstGroup) {
      parData.push({
        group: firstGroup.key,
        fileOwner: modelValueData.value,
      });
    }
  } else {
    if (modelValueData.value && typeof modelValueData.value === 'object') {
      for (const key in modelValueData.value) {
        parData.push({
          group: key,
          fileOwner: modelValueData.value[key],
        });
        fileOwner.push(modelValueData.value[key]);
      }
    }
  }
  if (isFunction(fetchSetting.value?.uploadFn)) {
    const param = {
      ...fetchSetting.value.params,
      groupData: parData,
      fileOwner: fileOwner,
    };
    console.log('param', param);
    fetchSetting.value
      ?.uploadFn(param, {
        type: 'detail',
      }).then((d) => {
        listData.value = {};
        if(d) {
          d.forEach(item => {
            const keyX = item.fileOwnerSub ?? (props.isStandalone ? (props.group[0]?.key ?? 'main') : 'main');
            if (!listData.value[keyX]) {
              listData.value[keyX] = [];
            }
            listData.value[keyX].push(item);
          });
        }
      });
  }
}
</script>
<template>
  <n-list class="pgUploadList ml-2">
    <n-list-item
      v-for="(group, index) in (props.isStandalone ? [props.group[0]] : props.group)"
      :key="group?.key || index"
      v-show="group"
    >
      <n-thing content-style="margin-top: 10px;">
        <template v-if="group?.name" #header>
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
              --n-dragger-border: 1px dashed rgb(224 224 230);
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

                  <div v-if="isImage(item.url)||'ajs'===item.bucket">
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
                          style="

--n-padding-left: 0; --n-padding-right: 0"
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
