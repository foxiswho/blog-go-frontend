<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { VbenButton } from '@vben/common-ui';

import { YesNoOptions } from '@pg/types';

import { useVbenForm, usePgForm, notification } from '#/adapter';

import { existName, saveOrUpdate, addByTopic } from '../api';
import ArticleTable from '#/viewsBlog/topicRelation/invoke/articleTable.vue';
const showArticle = ref(true);
const selectData = ref([]);
const emit = defineEmits(['ok']);
const [Form, formApi] = usePgForm({
  tabs: {
    hide: true,
    active: 'home',
    group: [{ value: 'home', label: '基本' }],
    props: {
      onUpdateValue: (value) => {
        console.log('value', value);
      },
    },
  },
  schema: [
    {
      tabGroup: 'home',
      fieldName: 'topicNo',
      label: '话题编号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        readonly: true,
      },
      rules: 'required',
    },
    {
      tabGroup: 'home',
      fieldName: 'topicName',
      label: '话题',
      component: 'PgSpan',
      componentProps: {},
      rules: 'required',
    },
    // {
    //   tabGroup: 'home',
    //   fieldName: 'articleNo',
    //   label: '文章编号',
    //   component: 'Input',
    //   componentProps: {
    //     placeholder: '请输入',
    //     readonly: true,
    //   },
    //   suffix: () =>
    //     h(
    //       VbenButton,
    //       {
    //         onClick: async (e) => {
    //           const values = await formApi.getValues();
    //           //existName(values.name, values.id);
    //         },
    //       },
    //       () => h('span', { class: 'font-normal' }, '选择文章'),
    //     ),
    // },
    // {
    //   tabGroup: 'home',
    //   fieldName: 'name',
    //   label: '文章名称',
    //   component: 'Input',
    //   rules: 'required',
    //   componentProps: {
    //     placeholder: '请输入',
    //     readonly: true,
    //   },
    // },
    // {
    //   tabGroup: 'home',
    //   fieldName: 'description',
    //   label: '文章描述',
    //   component: 'Textarea',
    //   componentProps: {
    //     type: 'textarea',
    //     placeholder: '描述',
    //   },
    // },
    {
      fieldName: 'id',
      label: 'id',
      defaultValue: '0',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
  ],
  handleSubmit: onSubmit,
  showDefaultActions: false,
});
const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      let data = {};
      const modalData = modalApi.getData<Record<string, any>>();
      const options = {
        title: `话题文章：${modalData.isUpdate ? '编辑' : '新增'}`,
      };
      console.log('modalData=>', modalData);
      if (modalData.topic) {
        data['topicNo'] = modalData.topic.no;
        data['topicName'] = modalData.topic.name;

        options.title = options.title + '::' + modalData.topic.name;
      }
      formApi.setValues(data);

      modalApi.setState(options);
    }
  },
  title: '：',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    modalApi.setState({ loading: true });
    let data = {
      ...values,
      nos: [],
    };
    if (selectData.value.length > 0) {
      selectData.value.forEach((item) => {
        data.nos.push(item.no);
        console.log('item.', item);
      });
    } else {
      modalApi.setState({ loading: false });
      notification.error({
        content: '失败',
        meta: '没有选择任何数据',
        duration: 2500,
        keepAliveOnHover: true,
      });
      return;
    }
    addByTopic(data)
      .then((d) => {
        setTimeout(() => {
          emit('ok', values);
          modalApi.setState({ loading: false });
          modalApi.close();
        }, 900);
      })
      .catch((error) => {
        modalApi.setState({ loading: false });
      });
  } catch (error) {
    modalApi.setState({ loading: false });
    console.error(error);
  }
}
function okSelectData(opt) {
  console.log('opt', opt);
  selectData.value = opt;
}
</script>
<template>
  <Modal class="w-[1000px]">
    <Form />
    <ArticleTable v-if="showArticle" @ok="okSelectData"></ArticleTable>
  </Modal>
</template>
