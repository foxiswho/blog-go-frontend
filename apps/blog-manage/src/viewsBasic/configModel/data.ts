import type { VxeTableDefines } from 'vxe-table';
import _XEUtils_ from 'xe-utils';
import { basicOptionsType } from "@pg/types";

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
    rules: 'required',
    componentProps: {
      placeholder: '请输入模型标识',
    },
  },
  {
    tabGroup: 'home',
    fieldName: 'table',
    label: '数据库表',
    component: 'Input',
    componentProps: {
      placeholder: '请输入对应数据库表名',
    },
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
  },
  {
    tabGroup: 'home',
    fieldName: 'modelCategory',
    label: '模型种类',
    component: 'Input',
    componentProps: {
      placeholder: '请输入模型种类',
    },
  },
  {
    tabGroup: 'home',
    fieldName: 'moduleSub',
    label: '子模块',
    component: 'Input',
    componentProps: {
      placeholder: '请输入所属子模块',
    },
  },
  {
    tabGroup: 'home',
    fieldName: 'description',
    label: '描述',
    component: 'Textarea',
    componentProps: {
      placeholder: '请输入描述',
    },
  },
  {
    fieldName: 'id',
    label: 'ID',
    component: 'Input',
    dependencies: {
      show: false,
      triggerFields: ['name'],
    },
  },
];

export const fieldColumns: any[] = [
  { type: 'checkbox', width: 60 },
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
    params: {
      options: [
        { label: '字符串', value: 'string' },
        { label: '整数', value: 'int' },
        { label: '布尔', value: 'bool' },
        { label: '浮点数', value: 'float' },
        { label: 'JSON', value: 'json' },
        { label: '文本', value: 'text' },
      ],
    },
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
