<script lang="ts" setup>
import { h,ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';
import dayjs from 'dayjs';
import {
  PgMarkdownViewer,
} from '@pg/components-n';
import {getNanoidNo} from "@pg/utils";

import { usePgForm } from '#/adapter';
import {typeCodePublic} from "#/viewsBasic/data-dict/dict/api";
import { selectNodeAllPublic as departmentNode } from '#/viewsRam/department/api';
import { selectNodeAllPublic as groupNode } from '#/viewsRam/group/api';
import { selectNodeAllPublic as levelNode } from '#/viewsRam/level/api';
import { selectNodeAllPublic as positionNode } from '#/viewsRam/position/api';
import { selectNodeAllPublic as jobFunctionNode } from '#/viewsRam/jobFunction/api';
import { selectNodeAllPublic as postNode } from '#/viewsRam/post/api';
import { selectNodeAllPublic as roleNode } from '#/viewsRam/role/api';
import { selectNodeAllPublic as teamNode } from '#/viewsRam/team/api';
import {getNanoidNumber} from "@pg/utils";

import {detail, existAccount, existCode, existMail, existPhone, saveOrUpdate} from '../api';
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
            class:'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existAccount(values.account, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    // {
    //   tabGroup: 'home',
    //   fieldName: 'countryCode',
    //   label: '国际区号',
    //   component: 'PgTreeSelect',
    //   defaultValue: '86',
    //   componentProps: {
    //     api: selectNodePublicCountryCode,
    //     params: {},
    //     props: {
    //       filterable: true,
    //       placeholder: '请选择',
    //     },
    //   },
    // },
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
      description: () =>
        h(
          VbenButton,
          {
            variant: 'link',
            class:'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              const str = getNanoidNumber(10)
              const phone = `1${str}`;
              formApi.setFieldValue('phone',phone)
              if(!values.mail){
                formApi.setFieldValue('mail',phone+'@ajs.com')
              }
              if(!values.code){
                formApi.setFieldValue('code',phone)
              }
            },
          },
          () => h('span', { class: 'font-normal' }, '随机生成手机号'),
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
      label: '编号',
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
      suffix: () =>
        h(
          VbenButton,
          {
            class:'pg-button-size-small',
            onClick: async (e) => {
              formApi.setFieldValue('registerTime',dayjs().format('YYYY-MM-DD HH:mm:ss'))
            },
          },
          () => h('span', { class: 'font-normal' }, '此刻'),
        ),
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
      fieldName: 'jobFunction',
      label: '职务',
      component: 'PgTreeSelect',
      componentProps: {
        api: jobFunctionNode,
        convertNode: true,
        params: {},
        props: {
          placeholder: '请选择',
        },
        onOk: async (opt) => {
          console.log(opt);
          if(opt.text) {
            const values = await formApi.getValues();
            if(!values.jobTitle) {
              formApi.setFieldValue('jobTitle',opt.text)
            }
          }
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
      fieldName: 'post',
      label: '岗位',
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
      fieldName: 'position',
      label: '职位',
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
      fieldName: 'jobRank',
      label: '职级',
      component: 'Input',
    },
    {
      tabGroup: 'position',
      fieldName: 'positionDesc',
      label: '',
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
      if (values && Object.keys(values).length > 0) {
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
      } else {
        formApi.setValues({
          registerTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          avatar: getNanoidNo(32),
        });
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

const positionDesc = ref(`
### 逻辑关系
职务 (Job Function)
&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│
&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└──► 职衔 (Title) ── 是职务的具体命名，可加入区域/级别修饰
&nbsp;&nbsp;│
&nbsp;&nbsp;└──► 岗位 (Post) ── 将职务细化为一组具体的职责与任务
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;(结合组织单元、汇报关系)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;职位 (Position) ── 岗位在特定部门/团队的实例化，通常有唯一编号
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──► 由某个员工担任
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──► 对应一个 职级 (Grade)

### 实际案例

假设某公司：
 - 职务：软件工程师
 - 职衔：资深后端开发工程师
 - 岗位：后端开发岗（职责：写API、数据库设计、代码评审）
 - 职位：交易系统部后端开发岗（编号J-1024）
 - 职级：P7

对应关系：
 - 职务“软件工程师”包含岗位“后端开发岗”；
 - 该岗位在公司内可能有多个职位（如交易系统部、用户中心部各设一个后端开发岗职位）；
 - 每个职位由一名员工占据，该员工拥有职衔“资深后端开发工程师”和职级P7。
`);
const positionDescColumns = ref([
  {
    title: '概念',
    key: 'name',
    resizable: true,
    minWidth: 50,
  },
  {
    resizable: true,
    title: '含义',
    key: 'desc'
  },
  {
    resizable: true,
    title: '问题',
    key: 'why'
  },
  {
    resizable: true,
    title: '例子',
    key: 'demo'
  }
]);
const positionDescData = ref([
  {
    name: '职务',
    desc: '一类工作的职责角色',
    why: '做什么类型的工作？',
    demo: '销售、工程师、财务、行政',
  },
  {
    name: '职衔',
    desc: '正式的头衔名称',
    why: '对外叫什么？',
    demo: '华东区高级销售经理、首席架构师',
  },
  {
    name: '岗位',
    desc: '一组相对固定的职责与任务',
    why: '需要完成哪些具体工作？',
    demo: '市场调研岗、招聘专员岗、设备维护岗',
  },
  {
    name: '职位',
    desc: '组织中实际占据的坑位（一人一坑）',
    why: '这个坑位属于谁？',
    demo: '张三担任的市场调研岗（特定编制）',
  },
  {
    name: '职级',
    desc: '按价值/能力划分的等级',
    why: '在薪酬/晋升体系中排第几？',
    demo: 'P6、M2、高级、1-9级',
  },
]);
</script>
<template>
  <Drawer class="min-w-[800px]">
    <Form>
      <template #positionDesc>
        <div>
          <div>
            <n-data-table
              size="small"
              :columns="positionDescColumns"
              :data="positionDescData"
              :bordered="false"
            />
          </div>
          <div>
            <PgMarkdownViewer :value="positionDesc" style="font-size: 12px; background: #f5f5f5; padding: 8px; border-radius: 4px;" />
          </div>
        </div>
      </template>
    </Form>
  </Drawer>
</template>
