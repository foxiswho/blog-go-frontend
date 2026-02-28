<script lang="ts" setup>
import { h, markRaw, ref } from 'vue';
import { NTag, NButton } from 'naive-ui';
import { getNanoidNo, getNanoidNumber } from '@pg/utils';
import { useVbenDrawer, useVbenModal, VbenButton, z } from '@vben/common-ui';

import { IdentityTypeOptions, SexOptions } from '@pg/types';

import { usePgForm } from '#/adapter';
import { zPg } from '#/adapter/form';
import TenantModalTpl from '#/viewsMc/tenant/invoke/index.vue';
import { selectNodeAllPublic as departmentNode } from '#/viewsRam/department/api';
import { selectNodeAllPublic as groupNode } from '#/viewsRam/group/api';
import { selectNodeAllPublic as levelNode } from '#/viewsRam/level/api';
import { selectNodeAllPublic as positionNode } from '#/viewsRam/position/api';
import { selectNodeAllPublic as postNode } from '#/viewsRam/post/api';
import { selectNodeAllPublic as roleNode } from '#/viewsRam/role/api';
import { selectNodeAllPublic as teamNode } from '#/viewsRam/team/api';

import {
  existPhone,
  existCode,
  saveOrUpdate,
  detail,
  existIdentityCode,
  existRealName,
  existMail,
  existAccount,
} from '../api';
import PhoneAssTpl from '../modules/two-fields.vue';

const emit = defineEmits(['ok']);
const recordData = ref<any>({});
const [ModalTenant, modalApiTenant] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: TenantModalTpl,
});
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
      fieldName: 'tenantNoName',
      label: '所属租户',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
        readonly: true,
      },
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formApi.getValues();
              modalApiTenant.setData({
                // 表单值
                values: values,
                isUpdate: true,
                number: 1,
              });
              modalApiTenant.open();
            },
          },
          () => h('span', { class: 'font-normal' }, '选择'),
        ),
    },
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
            onClick: async (e) => {
              const values = await formApi.getValues();
              existAccount(values.account, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
      descriptionPg: () =>
        h(
          NTag,
          { class: '', type: 'info', size: 'small', bordered: false },
          '检测唯一',
        ),
    },
    {
      tabGroup: 'home',
      component: markRaw(PhoneAssTpl),
      defaultValue: ['86', ''],
      disabledOnChangeListener: false,
      fieldName: 'phoneAssemble',
      formItemClass: 'col-span-1',
      label: '手机号',
      rules: zPg
        .array(zPg.string().optional())
        .length(2, '请选择国家并输入手机号码')
        .refine((v) => !!v[0], {
          message: '请选择国家',
        })
        .refine((v) => !!v[1] && v[1] !== '', {
          message: '输入手机号码',
        })
        .refine((v) => v[1]?.match(/^[1|2]\d{10}$/), {
          // 使用全角空格占位，将错误提示文字挤到手机号码输入框的下面
          message: '　　　　　　　　　号码格式不正确',
        }),
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formApi.getValues();
              existPhone(values.phoneAssemble[1], values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
      descriptionPg: () =>
        h('div', [
          h(NTag, { class: '', type: 'info', size: 'small', bordered: false }, [
            '检测唯一',
          ]),
          h(
            NButton,
            {
              size: 'tiny',
              ghost: true,
              type: 'info',
              class: 'ml-2',
              onClick: async (e) => {
                const values = await formApi.getValues();
                let phoneAssemble = [
                  values.phoneAssemble[0],
                  '2' + getNanoidNumber(10),
                ];
                formApi.setFieldValue('phoneAssemble', phoneAssemble);
              },
            },
            '随机生成',
          ),
        ]),
    },
    // {
    //   tabGroup: 'home',
    //   fieldName: 'countryCode',
    //   label: '国际区号',
    //   component: 'Input',
    //   defaultValue: '',
    //   componentProps: {
    //     placeholder: '请输入',
    //   },
    // },
    // {
    //   tabGroup: 'home',
    //   fieldName: 'phone',
    //   label: '手机号',
    //   rules: 'required',
    //   component: 'Input',
    //   suffix: () =>
    //     h(
    //       VbenButton,
    //       {
    //         onClick: async (e) => {
    //           const values = await formApi.getValues();
    //           existName(values.phone, values.id);
    //         },
    //       },
    //       () => h('span', { class: 'font-normal' }, '查重'),
    //     ),
    // },
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
            onClick: async (e) => {
              const values = await formApi.getValues();
              existMail(values.mail, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
      descriptionPg: () =>
        h('div', [
          h(NTag, { class: '', type: 'info', size: 'small', bordered: false }, [
            '检测唯一',
          ]),
          h(
            NButton,
            {
              size: 'tiny',
              ghost: true,
              type: 'info',
              class: 'ml-2',
              onClick: async (e) => {
                formApi.setFieldValue(
                  'mail',
                  '2' + getNanoidNo(10) + '@demo.com',
                );
              },
            },
            '随机生成',
          ),
        ]),
    },
    {
      tabGroup: 'home',
      fieldName: 'code',
      label: '标志',
      rules: 'required',
      defaultValue: '系统自动建立',
      component: 'Input',
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formApi.getValues();
              existCode(values.code, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
      descriptionPg: () =>
        h('div', [
          h(NTag, { class: '', type: 'info', size: 'small', bordered: false }, [
            '检测唯一',
          ]),
          h(
            NButton,
            {
              size: 'tiny',
              ghost: true,
              type: 'info',
              class: 'ml-2',
              onClick: async (e) => {
                formApi.setFieldValue('code', 'DEMO:' + getNanoidNo(16));
              },
            },
            '随机生成',
          ),
        ]),
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
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formApi.getValues();
              existRealName(values.realName, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
      descriptionPg: () =>
        h(
          NTag,
          { class: '', type: 'info', size: 'small', bordered: false },
          '后端不检测唯一',
        ),
    },
    {
      tabGroup: 'home',
      fieldName: 'identityCode',
      label: '身份编号',
      component: 'Input',
      suffix: () =>
        h(
          VbenButton,
          {
            onClick: async (e) => {
              const values = await formApi.getValues();
              existIdentityCode(values.identityCode, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
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
        params: { by: 'no' },
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
        params: { by: 'no' },
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
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: IdentityTypeOptions,
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'roles',
      label: '角色',
      defaultValue: [],
      component: 'PgTreeSelect',
      componentProps: {
        api: roleNode,
        params: { by: 'no' },
        filterQueryAsync: true,
        props: {
          multiple: true,
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'levelNo',
      label: '主级别',
      component: 'PgTreeSelect',
      componentProps: {
        api: levelNode,
        params: { by: 'no' },
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'levels',
      label: '多级别',
      defaultValue: [],
      component: 'PgTreeSelect',
      componentProps: {
        api: levelNode,
        params: { by: 'no' },
        props: {
          multiple: true,
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
        params: { by: 'no' },
        props: {
          placeholder: '请选择',
        },
      },
    },
    {
      tabGroup: 'home',
      fieldName: 'groups',
      label: '多组',
      defaultValue: [],
      component: 'PgTreeSelect',
      componentProps: {
        api: groupNode,
        params: { by: 'no' },
        props: {
          multiple: true,
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
        params: { by: 'no' },
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
        params: { by: 'no' },
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
        params: { by: 'no' },
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
      component: 'Input',
    },
    {
      tabGroup: 'my',
      fieldName: 'birthday',
      label: '生日',
      component: 'PgDatePicker',
      special: 'DatePicker',
      componentProps: {
        clearable: true,
        isTimestamp: false,
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
        // formattedValue:'2022-11-10 11:11:11',
        // defaultValue:'2022-11-10 11:11:11',
        shortcuts: {
          昨天: () => new Date().getTime() - 24 * 60 * 60 * 1000,
        },
        // onUpdateValue: (value, formattedValue) => {
        //     console.log('OnUpdateValue', value, formattedValue)
        // }
      },
    },
    {
      tabGroup: 'my',
      fieldName: 'sex',
      label: '性别',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: SexOptions,
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
    {
      fieldName: 'tenantNo',
      label: 'tenantNo',
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
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const modelData = drawerApi.getData<Record<string, any>>();
      if (modelData.values && modelData.isUpdate) {
        recordData.value = { ...modelData.values };
        detail(modelData.values.id).then((d) => {
          recordData.value = {
            ...d,
            phoneAssemble: [d.cc, d.phone],
          };
          console.log('detail=>', recordData.value);
          formApi.setValues({
            ...recordData.value,
          });
        });
      }

      drawerApi.setState({
        title: `账号：${modelData.isUpdate ? '编辑' : '新增'}`,
        loading: false,
      });
    }
  },
  title: '账号：',
  loading: false,
  confirmLoading: false,
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    let data = {
      ...values,
    };
    data.cc = data.phoneAssemble[0];
    data.phone = data.phoneAssemble[1];
    saveOrUpdate(data, isUpdate)
      .then((d) => {
        setTimeout(() => {
          drawerApi.setState({
            loading: false,
            confirmLoading: false,
          });
          drawerApi.close();
          emit('ok', data);
        }, 2500);
      })
      .catch((error) => {
        drawerApi.setState({
          loading: false,
          confirmLoading: false,
        });
      });
  } catch (error) {
    drawerApi.setState({ loading: false, confirmLoading: false });
    console.error(error);
  }
}
function modalOk(opt) {
  console.log('modalOk', opt);
  if (opt && opt.length > 0) {
    const record = opt[0];
    formApi.setValues({ tenantNo: record.no, tenantNoName: record.name });
  }
}
</script>
<template>
  <Drawer>
    <Form />
    <ModalTenant @ok="modalOk" />
  </Drawer>
</template>
