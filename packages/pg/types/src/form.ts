/**
 * 表单
 */
export const form = [
  { key: 'PgButton', label: '按钮', value: 'PgButton' },
  { key: 'PgInput', label: '文本框', value: 'PgInput' },
  { key: 'PgInputNumber', label: '数值文本框', value: 'PgInputNumber' },
  { key: 'PgInputTextarea', label: '多行文本框', value: 'PgInputTextarea' },
  { key: 'PgStrengthMeter', label: '密码框', value: 'PgStrengthMeter' },
  { key: 'PgRadioGroup', label: '单选框', value: 'PgRadioGroup' },
  { key: 'PgCheckboxGroup', label: '多选框', value: 'PgCheckboxGroup' },
  { key: 'PgSwitch', label: '开关', value: 'PgSwitch' },
  { key: 'PgTree', label: '树', value: 'PgTree' },
  { key: 'PgTreeSelect', label: '下拉选择树', value: 'PgTreeSelect' },
  { key: 'PgRate', label: '评分', value: 'PgRate' },
  { key: 'PgColorPicker', label: '颜色', value: 'PgColorPicker' },
  { key: 'PgDatePicker', label: '日期时间', value: 'PgDatePicker' },
  { key: 'PgTimePicker', label: '时间', value: 'PgTimePicker' },
  { key: 'PgImage', label: '图片显示', value: 'PgImage' },
  { key: 'PgUpload', label: '图片上传', value: 'PgUpload' },
];

/**
 * 表单-专属配置
 */
export const formSettingOptions = [
  // { label: '按钮', value: 'PgButton' ,key:'PgButton'},
  { key: 'PgInput', label: '文本框', value: 'PgInput' },
  { key: 'PgInputNumber', label: '数值文本框', value: 'PgInputNumber' },
  { key: 'PgInputTextarea', label: '多行文本框', value: 'PgInputTextarea' },
  { key: 'PgStrengthMeter', label: '密码框', value: 'PgStrengthMeter' },
  { key: 'PgRadioGroup', label: '单选框', value: 'PgRadioGroup' },
  { key: 'PgCheckboxGroup', label: '多选框', value: 'PgCheckboxGroup' },
  { key: 'PgSwitch', label: '开关', value: 'PgSwitch' },
  { key: 'PgTree', label: '树', value: 'PgTree' },
  { key: 'PgTreeSelect', label: '下拉选择树', value: 'PgTreeSelect' },
  { key: 'PgRate', label: '评分', value: 'PgRate' },
  { key: 'PgColorPicker', label: '颜色', value: 'PgColorPicker' },
  { key: 'PgDatePicker', label: '日期时间', value: 'PgDatePicker' },
  { key: 'PgTimePicker', label: '时间', value: 'PgTimePicker' },
  // { label: '图片显示', value: 'PgImage' ,key:'PgImage'},
  { key: 'PgUpload', label: '图片上传', value: 'PgUpload' },
];

/**
 * 表单
 */
export const formFormatter = ({ cellValue }) => {
  const item = form.find((item) => item.value === cellValue);
  return item ? item.label : '';
};

export const dataType = [
  { label: '布尔', value: 'bool' },
  { label: '字符串', value: 'string' },
  { label: '数值', value: 'number' },
  { label: '整数', value: 'bigint' },
];
export const formSetting = {
  PgButton: {
    style: {
      width: 100,
      widthUnit: 'px',
    },
  },
  // 多选框
  PgCheckboxGroup: {
    attribute: {
      options: {
        defaultDescription: '',
        defaultValue: '1',
        field: 'options',
        form: 'PgInputTextarea',
        placeholder: '参数方式例如:\n' + '1=>白色\n' + '2=>红色\n' + '3=>黑色',
      },
    },
  },
  PgInput: {
    attribute: {
      width: {
        defaultValue: '200',
        field: 'width',
        form: 'PgInput',
      },
    },
    style: {
      width: 100,
      widthUnit: 'px',
    },
  },
  PgInputNumber: {
    style: {
      width: 100,
      widthUnit: 'px',
    },
  },
  PgInputTextarea: {
    attribute: {
      height: {
        defaultValue: '5',
        field: 'height',
        form: 'PgInput',
      },
      width: {
        defaultValue: '200',
        field: 'width',
        form: 'PgInput',
      },
    },
    style: {
      height: 5,
      heightUnit: '',
      width: 100,
      widthUnit: 'px',
    },
  },
  // 单选框
  PgRadioGroup: {
    attribute: {
      options: {
        defaultDescription: '',
        defaultValue: '1',
        field: 'options',
        form: 'PgInputTextarea',
        placeholder: '参数方式例如:\n' + '1=>白色\n' + '2=>红色\n' + '3=>黑色',
      },
    },
  },
  PgStrengthMeter: {
    style: {
      width: 100,
      widthUnit: 'px',
    },
  },
  // 开关
  PgSwitch: {
    attribute: {
      defaultForm: 'PgSwitch',
      defaultValue: true,
    },
    props: {
      checkedValue: 'true',
      // 数据类型
      dataType: 'bool',
      uncheckedValue: 'false',
    },
  },

  // 下拉选择
  PgTreeSelect: {
    attribute: {
      options: {
        defaultDescription: '',
        defaultValue: '1',
        field: 'options',
        form: 'PgInputTextarea',
        placeholder: '参数方式例如:\n' + '1=>白色\n' + '2=>红色\n' + '3=>黑色',
      },
    },
  },

  // 上传
  PgUpload: {
    attribute: {
      defaultForm: 'PgRadioGroup',
      defaultValue: 'single',
    },
    consts: {
      options: [
        { label: '单图', value: 'single' },
        { label: '多图', value: 'more' },
        { label: '单文件', value: 'singleFile' },
        { label: '多文件', value: 'moreFile' },
      ],
    },
  },
};
