// eslint-disable-next-line n/no-extraneous-import
import { h } from 'vue';

// import { isFunction } from '@vben/utils';

import { VxeSwitch } from 'vxe-pc-ui';
// VXE事件拦截
import { VxeUI } from 'vxe-table';

export const useRenderer = () => {
  VxeUI.renderer.mixin({
    // PgInput: {
    //   // 可编辑激活模板
    //   renderEdit(renderOpts, params) {
    //     const { $table, column, row } = params;
    //     const { events } = renderOpts;
    //     // console.log('renderOpts',renderOpts)
    //     // console.log('params',params)
    //     let props = {};
    //     if (column.editRender.hasOwnProperty('editRender')) {
    //       props = column.editRender.props;
    //     }
    //     return [
    //       h(PgInput, {
    //         modelValue: row[column.field],
    //         props: {
    //           defaultValue: row[column.field],
    //           onBlur: (e) => {
    //             if (isFunction(events.blur)) {
    //               events.blur($table, row, e);
    //             }
    //             // console.info('row.end',row)
    //           },
    //           onChange: (e) => {
    //             events.click($table, row, e);
    //             // console.info('row.end',row)
    //           },
    //           placeholder: '请填写',
    //           type: 'text',
    //           ...props,
    //         },
    //         suffixButtonShow: true,
    //       }),
    //     ];
    //   },
    // },
    PgState: {
      renderTableDefault(renderOpts, params) {
        // console.log('renderOpts',renderOpts)
        // console.log('params',params)
        const { $table, row } = params;
        const { events } = renderOpts;
        const state = Number(row.state);
        if (state < 10) {
          return [
            h(VxeSwitch, {
              attrs: {},
              closeLabel: '停用',
              closeValue: 2,
              modelValue: row.state,
              onChange: (e) => {
                events.click($table, row, e);
                // console.info('row.end',row)
              },
              openLabel: '有效',
              openValue: 1,
              size: 'small',
            }),
          ];
        }
        if (state === 11) {
          return [
            h(
              'span',
              {
                attrs: {
                  color: 'red',
                },
              },
              '取消',
            ),
          ];
        }
        if (state === 12) {
          return [
            h(
              'span',
              {
                attrs: {
                  color: 'red',
                },
              },
              '弃置',
            ),
          ];
        }
        if (state === 13) {
          return [
            h(
              'span',
              {
                attrs: {
                  color: 'red',
                },
              },
              '批量删除',
            ),
          ];
        }
        return [
          h(
            'span',
            {
              attrs: {},
            },
            '其他',
          ),
        ];
      },
    },
    PgStateYesNoInt: {
      renderTableDefault(renderOpts, params) {
        const { $table, row } = params;
        const { events } = renderOpts;
        let field = 'state';
        if (Object.prototype.hasOwnProperty.call(renderOpts, 'field')) {
          field = renderOpts.field;
        }
        const state = Number(row[field]);
        if (state < 3 || state > 0) {
          return [
            h(VxeSwitch, {
              attrs: {},
              closeLabel: '否',
              closeValue: 2,
              modelValue: state,
              onChange: (e) => {
                events.click($table, row, e);
              },
              openLabel: '是',
              openValue: 1,
              size: 'small',
            }),
          ];
        }
        return [
          h(
            'span',
            {
              attrs: {},
            },
            '未定义',
          ),
        ];
      },
    },
  });
  console.log('渲染器完成');
};
