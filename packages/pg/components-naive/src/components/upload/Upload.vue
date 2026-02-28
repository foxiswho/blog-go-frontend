<template>
  <div class="w-full" v-bind="$attrs">
    <div class="upload">
      <div class="upload-card">
        <!--图片列表-->
        <div
          v-for="(item, index) in imgList"
          :key="`img_${index}`"
          :style="getCSSProperties"
          class="upload-card-item"
        >
          <div class="upload-card-item-info">
            <div class="img-box">
              <img :src="item" />
            </div>
            <div class="img-box-actions">
              <n-icon class="action-icon mx-2" size="18" @click="preview(item)">
                <AntDesignEyeOutlined />
              </n-icon>
              <n-icon class="action-icon mx-2" size="18" @click="remove(index)">
                <AntDesignDeleteOutlined />
              </n-icon>
            </div>
          </div>
        </div>

        <!--上传图片-->
        <div
          v-if="imgListComputed.length < maxNumber"
          :style="getCSSProperties"
          class="upload-card-item upload-card-item-select-picture"
        >
          <n-upload
            ref="attUp"
            :file-list-style="{ display: 'none' }"
            v-bind="getAttrs"
            v-model:value="getValue"
            @before-upload="beforeUpload"
            @finish="finish"
          >
            <div class="flex flex-col justify-center">
              <n-icon class="m-auto" size="18">
                <AntDesignPlusOutlined />
              </n-icon>
              <span class="upload-title">上传图片</span>
            </div>
          </n-upload>
        </div>
      </div>
    </div>

    <!--上传图片-->
    <n-space>
      <n-alert type="info" v-if="helpShow" class="flex w-full">
        单个文件不超过 {{ maxSize }} MB，最多只能上传 {{ maxNumber }} 个文件
        <br />
        {{ helpText }}
      </n-alert>
    </n-space>
  </div>

  <!--预览图片-->
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="预览"
    :bordered="false"
    :style="{ width: '520px' }"
  >
    <img :src="previewUrl" />
  </n-modal>
</template>

<script lang="ts" setup>
import { computed, watch, useAttrs, ref } from 'vue';
import {
  AntDesignEyeOutlined,
  AntDesignDeleteOutlined,
  AntDesignPlusOutlined,
} from '@pg/icons';
import { basicProps, uploadPropsDefault } from './props';
import { useMessage, useDialog } from 'naive-ui';
import type { UploadInst, UploadFileInfo } from 'naive-ui';
import { upload } from './setting';
import { isString } from '@vben/utils';
const attrs = useAttrs();
const props = defineProps({
  ...basicProps,
});
const emit = defineEmits(['uploadChange', 'delete', 'update:value']);
const attUpRef = ref<UploadInst | null>(null);
const getCSSProperties = computed(() => {
  return {
    width: `${props.width}px`,
    height: `${props.height}px`,
  };
});
const getValue = computed(() => {
  if (props.value && !Array.isArray(props.value)) {
    return props.value.split(',');
  }
  return [];
});
const uploadUrl = '';
const message = useMessage();
const dialog = useDialog();
const showModal = ref(false);
const previewUrl = ref('');
const originalImgList = ref([] as string[]);
const imgList = ref([] as string[]);
const getAttrs = computed(() => {
  Object.keys(uploadPropsDefault).forEach((key) => {
    if (!props.props.hasOwnProperty(key)) {
      // eslint-disable-next-line vue/no-mutating-props
      props.props[key] = uploadPropsDefault[key];
    }
  });
  return {
    ...attrs,
    ...props.props,
  };
});
//赋值默认图片显示
watch(
  () => props.value,
  (value) => {
    if (value) {
      let arr = [];
      if (!Array.isArray(value)) {
        arr = value.split(',');
      }
      console.log(' watch.value', arr);
      imgList.value = arr.map((item) => {
        return getImgUrl(item);
      });

      console.log('imgList.value', imgList.value);
    }
  },
  { immediate: true, deep: true },
);

//自定义设置确定 :default-upload="props.submitCustom"
watch(
  () => props.submitCustom,
  (val) => {
    //确定
    if (true === val) {
      attUpRef.value?.submit();
    }
  },
);

const imgListComputed = computed(() => {
  return imgList.value;
});

//预览
function preview(url: string) {
  showModal.value = true;
  previewUrl.value = url;
}

//删除
function remove(index: number) {
  dialog.info({
    title: '提示',
    content: '你确定要删除吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      imgList.value.splice(index, 1);
      originalImgList.value.splice(index, 1);
      emit('uploadChange', originalImgList.value);
      emit('delete', originalImgList.value);
    },
    onNegativeClick: () => {},
  });
}

//组装完整图片地址
function getImgUrl(url: string): string {
  return /(^http|https:\/\/)/g.test(url) ? url : `${uploadUrl}${url}`;
}

function checkFileType(fileType: string) {
  return upload.fileType.includes(fileType);
}

//上传之前
function beforeUpload({ file }) {
  const fileInfo = file.file;
  const { maxSize, accept } = props;
  const acceptRef = (isString(accept) && accept.split(',')) || [];

  // 设置最大值，则判断
  if (maxSize && fileInfo.size / 1024 / 1024 >= maxSize) {
    message.error(`上传文件最大值不能超过${maxSize}M`);
    return false;
  }
  console.log('fileInfo.type', fileInfo.type);
  // 设置类型,则判断
  const fileType = upload.fileType;
  if (acceptRef.length > 0 && !checkFileType(fileInfo.type)) {
    message.error(`只能上传文件类型为${fileType.join(',')}`);
    return false;
  }

  return true;
}

//上传结束
function finish({ event: Event }) {
  //console.log('event',event)
  const res = eval('(' + event.target.response + ')');
  const infoField = upload.apiSetting.infoField;
  const { code } = res;
  const message = res.msg || res.message || '上传失败';
  const result = res[infoField];
  //成功
  if (code === '200') {
    let imgUrl: string = getImgUrl(result.url);
    imgList.value.push(imgUrl);
    originalImgList.value.push(result.url);
    emit('uploadChange', originalImgList.value);
    // console.log(' props.type', props.type)
    if ('string' === props.type) {
      emit('update:value', originalImgList.value.join(','));
    } else {
      emit('update:value', originalImgList.value);
    }
  } else message.error(message);
}
</script>

<style lang="less">
.upload {
  width: 100%;
  overflow: hidden;

  &-card {
    width: auto;
    height: auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    &-item {
      margin: 0 8px 8px 0;
      position: relative;
      padding: 8px;
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;

      &:hover {
        background: 0 0;

        .upload-card-item-info::before {
          opacity: 1;
        }

        &-info::before {
          opacity: 1;
        }
      }

      &-info {
        position: relative;
        height: 100%;
        width: 100%;
        padding: 0;
        overflow: hidden;

        &:hover {
          .img-box-actions {
            opacity: 1;
          }
        }

        &::before {
          position: absolute;
          z-index: 1;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          opacity: 0;
          transition: all 0.3s;
          content: ' ';
        }

        .img-box {
          position: relative;
          //padding: 8px;
          //border: 1px solid #d9d9d9;
          border-radius: 2px;

          & img {
            width: 100px;
          }
        }

        .img-box-actions {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 10;
          white-space: nowrap;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: space-between;

          &:hover {
            background: 0 0;
          }

          .action-icon {
            color: rgba(255, 255, 255, 0.85);

            &:hover {
              cursor: pointer;
              color: #fff;
            }
          }
        }
      }

      & .n-upload-trigger {
        width: 100%;
        padding-top: 20px;
        padding-bottom: 20px;
      }

      & .upload-title {
        text-align: center;
      }
    }

    &-item-select-picture {
      border: 1px dashed #d9d9d9;
      border-radius: 2px;
      cursor: pointer;
      background: #fafafa;
      color: #666;

      .upload-title {
        color: #666;
      }
    }
  }
}
</style>
