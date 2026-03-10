import type { VxeTableDefines } from 'vxe-table';
import _XEUtils_ from 'xe-utils';
import { basicOptionsType } from "@pg/types";
import { z } from '#/adapter/form';
import {selectNodeAllPublic as selectNodeAllPublicModule} from "#/viewsBasic/module/api";
import {codeValueAllPublic} from "#/viewsBasic/data-dict/dict/api";
import {h} from "vue";
import {NTag} from "naive-ui";


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
