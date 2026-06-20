<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { IdentityTypeOptions } from '@pg/types';

import { usePgForm } from '#/adapter';
import { selectNodeAllPublic as departmentNode } from '#/viewsRam/department/api';
import { selectNodeAllPublic as groupNode } from '#/viewsRam/group/api';
import { selectNodeAllPublic as levelNode } from '#/viewsRam/level/api';
import { selectNodeAllPublic as positionNode } from '#/viewsRam/position/api';
import { selectNodeAllPublic as postNode } from '#/viewsRam/post/api';
import { selectNodeAllPublic as roleNode } from '#/viewsRam/role/api';
import { selectNodeAllPublic as teamNode } from '#/viewsRam/team/api';

import {detail, existPhone, saveOrUpdate, existAccount, existMail, existCode} from '../api';
import {selectNodePublicCountryCode} from "#/viewsBasic/country/api";
import {typeCodePublic} from "#/viewsBasic/data-dict/dict/api";
import {uploadFn} from "#/viewsBasic/attachment/api";
import {getNanoidNo} from "@pg/utils";
const emit = defineEmits(['ok']);
const [Form, formApi] = usePgForm({
  tabs: {
    active: 'home',
    group: [
      { value: 'home', label: '基本' },
      { value: 'position', label: '职务' },
      { value: 'my', label: '个人' },
      { value: 'other', label: '其他' },
    ],
  },
  schema: [
    {
      tabGroup: 'home',
      fieldName: 'account',
      label: '账号',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入',
      },
      suffix: () =>
        h(
          VbenButton,
          {
            size: 'xs',
            class:'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existAccount(values.account, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'countryCode',
      label: '国际区号',
      component: 'PgTreeSelect',
      defaultValue: '86',
      componentProps: {
        api: selectNodePublicCountryCode,
        params: {},
        props: {
          filterable: true,
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'phone',
      label: '手机号',
      rules: 'required',
      component: 'Input',
      suffix: () =>
        h(
          VbenButton,
          {
            class:'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existPhone(values.phone, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'mail',
      label: '邮箱',
      rules: 'required',
      component: 'Input',
      suffix: () =>
        h(
          VbenButton,
          {
            class:'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existMail(values.mail, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'code',
      label: '编码',
      rules: 'required',
      component: 'Input',
      suffix: () =>
        h(
          VbenButton,
          {
            class:'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existCode(values.code, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'name',
      label: '名称',
      rules: 'required',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'realName',
      label: '真实姓名',
      rules: 'required',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'identityCode',
      label: '身份编号',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'registerTime',
      label: '注册时间',
      component: 'PgDatePicker',
      special: 'DatePicker',
      componentProps: {
        isTimestamp: false,
        type: 'datetime',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
        // formattedValue:'2022-11-10 11:11:11',
        // defaultValue:'2022-11-10 11:11:11',
        shortcuts: {
          昨天: () => Date.now() - 24 * 60 * 60 * 1000,
        },
        // onUpdateValue: ( value, formattedValue ) => {
        //   console.log('OnUpdateValue', value, formattedValue)
        //   formApi.setFieldValue('registerTime', dayjs(formattedValue));
        // },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'description',
      label: '描述',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '描述',
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'departmentNo',
      label: '主部门',
      component: 'PgTreeSelect',
      componentProps: {
        api: departmentNode,
        params: {},
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'departments',
      label: '多部门',
      component: 'PgTreeSelect',
      componentProps: {
        api: departmentNode,
        params: {},
        props: {
          multiple: true,
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'typeIdentity',
      label: '身份类型',
      component: 'PgTreeSelect',
      componentProps: {
        api: typeCodePublic,
        params: 'typeIdentity',
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'roles',
      label: '角色',
      component: 'PgTreeSelect',
      componentProps: {
        api: roleNode,
        params: {},
        props: {
          multiple: true,
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'levelNo',
      label: '级别',
      component: 'PgTreeSelect',
      componentProps: {
        api: levelNode,
        convertNode: true,
        params: {},
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'groupNo',
      label: '分组',
      component: 'PgTreeSelect',
      componentProps: {
        api: groupNode,
        params: {},
        props: {
          placeholder: '请选择',
        },
      },
    },

    {
      tabGroup: 'home',
      fieldName: 'teams',
      label: '团队',
      component: 'PgTreeSelect',
      componentProps: {
        api: teamNode,
        params: {},
        props: {
          multiple: true,
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'position',
      fieldName: 'position',
      label: '职务',
      component: 'PgTreeSelect',
      componentProps: {
        api: positionNode,
        convertNode: true,
        params: {},
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'position',
      fieldName: 'job',
      label: '职位',
      component: 'PgTreeSelect',
      componentProps: {
        api: postNode,
        convertNode: true,
        params: {},
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'position',
      fieldName: 'jobTitle',
      label: '职衔',
      component: 'Input',
    },
    {
      tabGroup: 'position',
      fieldName: 'jobRank',
      label: '职级',
      component: 'Input',
    },
    {
      tabGroup: 'home',
      fieldName: 'avatar',
      label: '头像',
      component: 'PgUploadGroupOwner',
    },
    // {
    //   tabGroup: 'home',
    //   fieldName: 'avatar',
    //   label: '头像',
    //   component: 'PgUploadGroupOwner',
    //   componentProps: {
    //     isStandalone: true,
    //     fetchSetting: {
    //       uploadFn: uploadFn,
    //       module: 'account',
    //     },
    //     group: [
    //       {
    //         // name: '主图',
    //         key: 'main',
    //         // description: '其他说明 图片大小：宽 500px ,高 400px,图片大小：宽 500px ,高 400px',
    //         headerExtra: ',图片大小：宽 500px ,高 400px',
    //         width: '500px',
    //         height: '400px',
    //         maxNumber: 1,
    //         maxSize: 30,
    //       },
    //     ],
    //   },
    // },
    // {
    //   tabGroup: 'my',
    //   fieldName: 'birthday',
    //   label: '生日',
    //   component: 'DatePicker',
    //   componentProps: {
    //     isTimestamp: false,
    //     type: 'date',
    //     format: 'yyyy-MM-dd',
    //     valueFormat: 'yyyy-MM-dd',
    //     // formattedValue:'2022-11-10 11:11:11',
    //     // defaultValue:'2022-11-10 11:11:11',
    //     shortcuts: {
    //       '昨天': () => new Date().getTime() - 24 * 60 * 60 * 1000,
    //     },
    //     // onUpdateValue: (value, formattedValue) => {
    //     //     console.log('OnUpdateValue', value, formattedValue)
    //     // }
    //   },
    // },
    {
      tabGroup: 'my',
      fieldName: 'sex',
      label: '性别',
      component: 'PgTreeSelect',
      componentProps: {
        api: typeCodePublic,
        params: 'sex',
        props: {
          placeholder: '请选择',
        },
      },
    },
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
  showDefaultActions: false,
});
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      if (values) {
        if(isUpdate) {
          detail(values.id).then(response => {
            console.log('response', response);
            let data = {
              ...response,
            };
            if(!data.avatar){
              data.avatar= getNanoidNo(32);
            }
            formApi.setValues(data);
          });
        }else {
          formApi.setValues({
            ...values,
            avatar: getNanoidNo(32),
          });
        }
      }

      drawerApi.setState({ title: `账号：${isUpdate ? '编辑' : '新增'}` ,loading: false});
    }
  },
  title: '账号：',
});

/**
 * 提交
 */
async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values = await formApi.getValues();
  console.log('values:', values);
  drawerApi.lock();
  try {
    drawerApi.setState({
      loading: true,
      confirmLoading: true,
    });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    saveOrUpdate(values, isUpdate)
      .then((d) => {
        setTimeout(() => {
          emit('ok', values);
          drawerApi.close();

          drawerApi.setState({
            loading: false,
            confirmLoading: false,
          });
        }, 2500);
      });
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>
<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
