<script lang="ts" setup>
import type { UploadFileInfo, UploadInst } from 'naive-ui';

import { computed, ref } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { AntDesignCloseOutlined } from '@pg/icons';
import { requestClient } from '@pg/request';
import { useQRCode } from '@vueuse/integrations/useQRCode';
import {
  NImage,
  NSpace,
  type UploadCustomRequestOptions,
  useMessage,
} from 'naive-ui';

import { UploadProps } from './props';
import { type Fetch, type UploadGroupItem } from './type';

const props = defineProps({
  ...UploadProps,
});
const emit = defineEmits(['select', 'register', 'ok']);
const message = useMessage();
const text = ref('https://vben.vvbin.cn');
// uploadFetch.urlQr
const qrcode = useQRCode(text, {
  errorCorrectionLevel: 'H',
  margin: 4,
});
const formRef = ref(null);
const pgUpFileRef = ref<null | UploadInst>(null);
const uploadSetting = ref<UploadGroupItem>({
  key: '',
  maxNumber: 20,
  maxSize: 30,
  name: '',
});
const uploadFetch = ref<Fetch>({ url: '', urlLink: '', urlQr: '', header: {} });
const titleRef = ref('上传');
const submitCustom = ref(false);
const emitsClose = ref(false);
const checkedNum = ref(1);
const finishData = ref({});
const methodDefault = ref('local');
const categoryDefault = ref('default');
const webUrlData = ref([]);
const formData = ref({
  category: 'default',
  fileList: [],
  method: 'local',
  webUrl: '',
  webUrlList: [],
});

const fileListLengthRef = ref(0);
const headers = computed(() => uploadFetch.value.header);
const bodyData = computed(() => {
  if (uploadFetch.value?.params) {
    return uploadFetch.value?.params;
  }
  return {};
});
const handleChange = (options: { fileList: UploadFileInfo[] }) => {
  fileListLengthRef.value = options.fileList.length;
  // console.log('options',options)
};
const uploadError = (options: {
  event?: ProgressEvent;
  file: UploadFileInfo;
}) => {
  // console.log('uploadError', options);
};

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    modalApi.setState({ loading: true });

    modalApi.setState({ loading: false });
  },
  onOpenChange(isOpen: boolean) {
    modalApi.setState({ loading: false });
    emitsClose.value = false;
    formData.value.webUrlList = [];
    formData.value.fileList = [];
    formData.value.webUrl = '';
    formData.value.category = 'default';
    formData.value.method = 'local';
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      if (modalData?.checkedNum) {
        checkedNum.value = modalData.checkedNum;
      }
      if (modalData?.uploadSetting) {
        uploadSetting.value = modalData.uploadSetting;
      }
      if (modalData?.uploadFetch) {
        uploadFetch.value = modalData.uploadFetch;
      }

      modalApi.setState({ title: `${titleRef.value}` });
    }
  },
  title: '：',
});

// 提交事件
async function handleSubmit() {
  modalApi.setState({ loading: true });
  try {
    modalApi.setState({ loading: true });
    const data = formData.value;
    // console.log('getFieldValue', data);
    // 提交表单
    // 网络上传
    if (data.method === 'web') {
      if (!data.webUrlList || data.webUrlList <= 0) {
        message.warning('你没有选择任何数据');
        return false;
      }
      const param = {
        category: data.category,
        method: data.method,
        url: data.webUrlList,
      };
      requestClient
        .post(uploadFetch.value.urlLink, param, {
          errorMessageMode: 'message',
          successMessageMode: 'message',
          withToken: true,
        })
        .then((d) => {
          // console.log(data.method, d);
          emitsClose.value = true;
          emit('ok', { action: 'finish', finishData: d });
          setTimeout(() => {
            modalApi.close();
          }, 300);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (data.method === 'scan') {
      // 扫码上传
    } else {
      // console.log('data.method',data.method)
      // console.log('uploadFetch',uploadFetch)
      // console.log('pgUpFileRef',pgUpFileRef.value)
      // 上传
      pgUpFileRef.value?.submit();
    }
  } finally {
    // setTimeout(() => {
    //   setModalProps({confirmLoading: false});
    // }, 300)
  }
  modalApi.setState({ loading: false });
}

function handleFalse() {
  submitCustom.value = false;
  formData.value.submitCustom = false;
}

function handleTrue() {
  submitCustom.value = true;
  formData.value.submitCustom = true;
}

function handleMethod(act) {
  // 本地上传
  // 'local' == act,
  // 网络上传
  //  'web' == act,
  // 扫码上传
  // 'scan' == act
  formData.value.method = act;
  message.success(act);
}

function handleWebUrlDel(item, index) {
  webUrlData.value.splice(index, 1);
  // console.log('webUrlData.value', webUrlData.value);
  // 网络上传
  formData.value.webUrlList = webUrlData.value;
}

// 上传结束
function uploadFinish({ event, file }) {
  if (finishData.value[file.id]) {
    const obj = finishData.value[file.id];
    file.url = obj.url;
    file.thumbnailUrl = obj.url;
    file.percentage = 1;
  }
  return file;
}

//	当 file-list 改变时触发的回调函数
function updateFileList(fileList: UploadFileInfo[]) {
  // console.log('fileList', fileList);
  // console.log('fileList.length',fileList.length)
  // console.log('finishData.value.length', finishData.value)
  if (fileList.length === Object.keys(finishData.value).length) {
    // console.log('上传完成', finishData.value);
    emitsClose.value = true;
    emit('ok', { action: 'finish', finishData: finishData.value });
    setTimeout(() => {
      modalApi.close();

      message.success('本次上传完成～');
    }, 1000);
  }
}

// 上传照片
const customRequest = async ({
  action,
  data,
  file,
  headers,
  onError,
  onFinish,
  onProgress,
  withCredentials,
}: UploadCustomRequestOptions) => {
  // console.log('file', file);
  // console.log('headers', headers);
  // console.log('action', action);
  const formData = new FormData();
  if (data) {
    Object.keys(data).forEach((key) => {
      formData.append(
        key,
        data[key as keyof UploadCustomRequestOptions['data']],
      );
    });
  }
  formData.append('file', file.file as File);
  headers['Content-Type'] = `multipart/form-data;boundary = ${Date.now()}`;
  requestClient
    .post(action, formData, {
      errorMessageMode: 'message',
      isTransformResponse: false,
      successMessageMode: 'notification',
      withToken: true,
      headers: headers,
    })
    .then((json) => {
      // console.log('then.json', json);
      finishData.value[file.id] = json.data;
      emit('ok', { data: json.data, file });
      // Message.success()
      onFinish();
    })
    .catch((error) => {
      // console.log('errorn', error);
      // console.log('errorn.response', error.response);
      // console.log('errorn.cause', error.cause);
      message.success(error.message);
      onError();
    });
};
// 关闭动画完成执行的回调
function afterLeave() {
  // console.log('关闭动画完成执行的回调');
  if (!emitsClose.value) {
    emit('ok', { action: 'close' });
  }
}

function handleWebUrlClick() {
  if (formData.value.webUrl) {
    webUrlData.value.push(formData.value.webUrl);
    // downLoadWebUrlImg();
    formData.value.webUrlList = webUrlData.value;
  }
}

function handleValidateButtonClick(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (errors) {
      // console.log(errors);
      message.error('验证失败');
    } else {
      message.success('验证成功');
      //
      handleSubmit();
    }
  });
}
</script>

<template>
  <Modal
    :content-style="{ marginLeft: '2px', paddingTop: '0px' }"
    :style="{ width: '1000px', height: '720px' }"
    :title="titleRef"
    class="methodFast"
    @after-leave="afterLeave"
  >
    <n-form ref="formRef" :model="formData">
      <n-form-item label="上传方式">
        <n-radio-group
          v-model:value="methodDefault"
          name="method"
          @update:value="handleMethod"
        >
          <n-radio-button label="本地上传" value="local" />
          <n-radio-button label="网络上传" value="web" />
          <n-radio-button label="扫码上传" value="scan" />
        </n-radio-group>
      </n-form-item>
      <n-form-item v-if="'local' === formData.method" label="上传分组">
        <n-radio-group name="category" v-model:value="formData.category">
          <n-radio-button label="全部" value="all" />
          <n-radio-button label="默认" value="default" />
          <n-radio-button label="自己上传" value="my" />
          <n-radio-button label="远程下载" value="remote" />
          <n-radio-button label="系统图片" value="sys" />
          <n-radio-button label="网络图片" value="webUrl" />
        </n-radio-group>
      </n-form-item>
      <n-form-item v-if="'local' === formData.method" label="上传图片">
        <div class="flex flex-col">
          <n-upload
            ref="pgUpFileRef"
            :action="uploadFetch.url"
            :custom-request="customRequest"
            :data="bodyData"
            :default-upload="false"
            :headers="headers"
            :show-file-list="true"
            accept=".jpg,.png,.jpeg,.svg,.gif,.webp,.xlsx"
            list-type="image-card"
            multiple
            @change="handleChange"
            @error="uploadError"
            @finish="uploadFinish"
            @update:file-list="updateFileList"
          />
          <div class="flex" style="color: #bbb">
            建议上传图片最大宽度750px，不超过
            {{ uploadSetting.maxSize }}
            MB；仅支持jpeg、png格式，可拖拽调整上传顺序
          </div>
        </div>
      </n-form-item>
      <div v-if="'web' === formData.method" class="webUrl">
        <n-form-item label="网络图片">
          <NInput v-model:value="formData.webUrl" /><NButton
            @click="handleWebUrlClick"
            >提取照片</NButton
          >
        </n-form-item>
        <div class="list">
          <div
            v-for="(item, index) in webUrlData"
            :key="index"
            style="display: inline-block"
            class="mr-2"
          >
            <div class="flex" style="position: relative">
              <AntDesignCloseOutlined
                :size="15"
                style="position: absolute; right: 0; background-color: #fff"
                @click="handleWebUrlDel(item, index)"
              />
              <NImage :src="item" width="96" />
            </div>
          </div>
        </div>
      </div>
      <n-form-item v-if="'scan' === formData.method" label="二维码">
        <div class="flex">
          <NSpace
            class="flex flex-col flex-nowrap"
            style="flex-direction: column"
          >
            <img
              :src="qrcode"
              alt="qrcode"
              class="w-1/2"
              style="border: 1px solid #ddd"
            />
            <div
              class="flex justify-center"
              style="flex-direction: column; align-items: center"
            >
              <div class="flex">扫描二维码，快速上传手机图片</div>
              <div class="flex" style="color: #bbb">建议使用手机浏览器</div>
            </div>
          </NSpace>
          <NSpace
            class="ml-6 flex flex-col flex-nowrap"
            style="flex-direction: column"
          >
            <div>
              <VbenButton>刷新图库</VbenButton>
              <div style="line-height: 30px; color: #bbb">
                刷新图库按钮，可显示移动端上传成功的图片
              </div>
            </div>
            <div>xxxxx</div>
          </NSpace>
        </div>
      </n-form-item>
      <n-form-item>
        <NButton @click="handleValidateButtonClick">提交</NButton>
      </n-form-item>
    </n-form>

    <div class="hidden">
      <NButton @click="handleTrue">true</NButton>
      <NButton @click="handleFalse">false</NButton>
    </div>
  </Modal>
</template>
<style lang="less" scoped></style>
