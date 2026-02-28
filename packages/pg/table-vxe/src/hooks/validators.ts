// VXE事件拦截
import { VxeUI } from 'vxe-table';
// 表格内校验
export const useValidators = () => {
  VxeUI.validators.mixin({
    // 文本框不能为空
    pgInput: {
      cellValidatorMethod({ cellValue }) {
        if (!cellValue) {
          return new Error('请填写');
        }
      },
    },
    pgInputNumber: {
      cellValidatorMethod({ cellValue }) {
        if (undefined === cellValue) {
          return new Error('请填写');
        }
        if (null === cellValue) {
          return new Error('请填写');
        }
        if (0 === cellValue) {
          return new Error('请填写');
        }
      },
    },
    // 文本框不能为空
    pgInputSelect: {
      cellValidatorMethod({ cellValue }) {
        if (!cellValue) {
          return new Error('请双击选择');
        }
      },
    },
  });
};
