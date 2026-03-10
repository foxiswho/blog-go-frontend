import type { VxeTableDefines } from 'vxe-table';
import _XEUtils_ from 'xe-utils';
import { basicOptionsType } from "@pg/types";
import { z } from '#/adapter/form';
import {selectNodeAllPublic as selectNodeAllPublicModule} from "#/viewsBasic/module/api";
import {codeValueAllPublic} from "#/viewsBasic/data-dict/dict/api";
import {h} from "vue";
import {NTag} from "naive-ui";

export const columns: any[] = [
  { type: 'checkbox', width: 60 },
  { field: 'name', title: '名称', minWidth: 160 },
  { field: 'model', title: '模型', width: 160 },
  { field: 'table', title: '数据库表', width: 160 },
  {
    field: 'typeSys',
    title: '系统类型',
    width: 120,
    formatter: ({ cellValue }: any) => {
      return cellValue === 'system' ? '系统' : '普通';
    },
  },
  { field: 'modelCategory', title: '模型种类', width: 160 },
  { field: 'moduleSub', title: '子模块', width: 160 },
  { field: 'description', title: '描述', minWidth: 200 },
  {
    field: 'createAt',
    title: '创建时间',
    width: 160,
    formatter({ cellValue }: any) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss');
    },
  },
  { title: '操作', width: 160, field: 'right', slots: { default: 'operate' }, fixed: 'right' },
];

export const formSchema = [
  {
    tabGroup: 'home',
    fieldName: 'name',
    label: '名称',
    component: 'Input',
    rules: 'required',
    componentProps: {
      placeholder: '请输入模型名称',
    },
  },
  {
    tabGroup: 'home',
    fieldName: 'model',
    label: '模型英文名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入模型标识',
    },
    rules: z.string().min(1, { message: '模型英文名称必填' }).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
      message: '模型英文名称字符格式错误' // 自定义错误提示
    }),
    descriptionPg: () =>
      h(
        NTag,
        { class: '', type: 'info', size: 'small', bordered: false },
        '仅包含大小写字母、下划线、数字，首字符必须是英文字母',
      ),
  },
  {
    tabGroup: 'home',
    fieldName: 'table',
    label: '数据库表',
    component: 'Input',
    componentProps: {
      placeholder: '请输入对应数据库表名',
    },
    rules: z.string().min(1, { message: '表名必填' }).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
      message: '表名字符格式错误' // 自定义错误提示
    }),
    descriptionPg: () =>
      h(
        NTag,
        { class: '', type: 'info', size: 'small', bordered: false },
        '仅包含大小写字母、下划线、数字，首字符必须是英文字母',
      ),
  },
  {
    tabGroup: 'home',
    fieldName: 'typeSys',
    label: '系统类型',
    component: 'Select',
    defaultValue: 'general',
    componentProps: {
      options: [
        { label: '普通', value: 'general' },
        { label: '系统', value: 'system' },
      ],
    },
    rules: 'required',
  },
  {
    tabGroup: 'home',
    fieldName: 'modelCategory',
    label: '模型种类',
    defaultValue: 'table',
    component: 'PgTreeSelect',
    componentProps: {
      api: codeValueAllPublic,
      params: { by: 'no', typeCode:'basic:modelCategory' },
      props: {
        filterable: true,
        placeholder: '请选择码值',
      },
    },
    rules: 'required',
  },
  {
    tabGroup: 'home',
    fieldName: 'moduleSub',
    label: '子模块',
    defaultValue: '',
    component: 'PgTreeSelect',
    componentProps: {
      api: selectNodeAllPublicModule,
      params: { by: 'no' },
      props: {
        filterable: true,
        placeholder: '请选择所属子模块',
      },
    },
    rules: 'required',
  },
  {
    tabGroup: 'home',
    fieldName: 'description',
    label: '描述',
    component: 'Textarea',
    componentProps: {
      type: 'textarea',
      placeholder: '请输入描述',
    },
  },
  {
    fieldName: 'id',
    label: 'ID',
    defaultValue:  '0',
    component: 'Input',
    dependencies: {
      show: false,
      triggerFields: ['name'],
    },
  },
];

export const fieldColumns: any[] = [
  { type: 'checkbox', width: 60 },
  { field: 'id', title: 'id', visible: false},
  { field: 'name', title: '字段名称', minWidth: 150, editRender: { autoFocus: 'input' } },
  { field: 'field', title: '字段标识', minWidth: 150, editRender: { autoFocus: 'input' } },
  {
    field: 'show',
    title: '显示',
    width: 100,
    editRender: {},
  },
  {
    field: 'binary',
    title: '二进制',
    width: 100,
    editRender: {},
  },
  { field: 'defaultValue', title: '默认值', width: 150, editRender: { autoFocus: 'input' } },
  {
    field: 'valueType',
    title: '值类型',
    width: 120,
    editRender: {},
  },
  {
    field: 'formCode',
    title: '表单类型',
    width: 150,
    editRender: {},
    params: {
      options: [
        { label: '文本输入', value: 'input_text' },
        { label: '数字输入', value: 'input_number' },
        { label: '开关', value: 'switch' },
        { label: '下拉选择', value: 'select' },
        { label: '多行文本', value: 'textarea' },
      ],
    },
  },
  {
    field: 'parameterSource',
    title: '参数源',
    width: 120,
    editRender: {},
    params: {
      options: [
        { label: '手动', value: 'manual' },
        { label: '系统', value: 'system' },
        { label: '外部接口', value: 'api' },
      ],
    },
  },
  {
    field: 'rules',
    title: '验证规则',
    minWidth: 200,
    editRender: {},
    params: {
      options: [
        { label: '必填', value: 'required' },
        { label: '数字', value: 'number' },
        { label: '邮箱', value: 'email' },
        { label: '手机号', value: 'phone' },
      ],
    },
  },
  { title: '操作', width: 100, slots: { default: 'operate' }, fixed: 'right' },
];
