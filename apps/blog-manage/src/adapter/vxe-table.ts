import type { TableActionProps } from '@vben/common-ui';
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { ComponentPropsMap, ComponentType } from './component';

import { defineComponent, h, ref, watch } from 'vue';

import { useAccess } from '@vben/access';
import { VbenTableAction as VbenTableActionCore } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $te } from '@vben/locales';
import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '@vben/plugins/vxe-table';
import { get, isFunction, isString } from '@vben/utils';

import { objectOmit } from '@vueuse/core';
import {NButton, NImage, NImageGroup, NSwitch, NTag, NPopconfirm, useDialog} from 'naive-ui';
import { dialog } from '#/adapter/naive';
import { useVbenForm } from './form';
import { $t } from '#/locales';
import { updateDetail } from '#/viewsBasic/attachment/api';
import {stateYesNoOptionFormatter} from "@pg/types";
import {ROLE_ADMINISTRATOR} from "@pg/constants";

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'left',
        headerAlign: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'data',
            total: 'total',
            list: 'data',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    /**
     * 解决vxeTable在热更新时可能会出错的问题
     */
    vxeUI.renderer.forEach((_item, key) => {
      if (key.startsWith('Cell')) {
        vxeUI.renderer.delete(key);
      }
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const { column, row } = params;
        return h(NImage, { lazy:true,src: row[column.field], ...props });
      },
    });

    /**
     * 根据文件key获取图片URL列表渲染器
     * 通过 updateDetail API 获取图片信息，支持多图显示，无数据时显示空
     */
    vxeUI.renderer.add('CellImageKey', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const { column, row } = params;
        const key = row[column.field];

        /**
         * CellImageKey异步图片渲染组件
         * @param key - 文件拥有者标识，用于查询图片URL列表
         * @param imageProps - 传递给NImage的额外属性
         * @returns Vue VNode - 多图时使用NImageGroup包裹，无数据时返回null
         */
        return h(
          defineComponent({
            name: 'CellImageKeyRenderer',
            props: { fileKey: { default: '' }, imageProps: { default: () => ({}) }, limit: { default: 0 } },
            setup(props) {
              const imageList = ref<Array<{ name: string; url: string }>>([]);
              watch(
                () => props.fileKey,
                (newKey,old) => {
                  if (newKey&&newKey!=old) {
                    updateDetail(newKey).then((res) => {
                      imageList.value = res || [];
                    });
                  } else {
                    imageList.value = [];
                  }
                },
                { immediate: true },
              );

              return () => {
                if (imageList.value.length === 0) return null;
                const displayList = props.limit > 0 ? imageList.value.slice(0, props.limit) : imageList.value;
                const images = displayList.map((item) =>
                  h(NImage, { lazy: true, src: item.url, ...props.imageProps }),
                );
                return displayList.length > 1
                  ? h(NImageGroup, {}, { default: () => images })
                  : images[0];
              };
            },
          }),
          { fileKey: key, imageProps: props, limit: props?.limit ?? 0 },
        );
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          NButton,
          { size: 'small', type: 'primary', quaternary: true },
          { default: () => props?.text },
        );
      },
    });

    // 单元格渲染： Tag
    vxeUI.renderer.add('CellTag', {
      renderTableDefault({ options, props }, { column, row }) {
        const value = get(row, column.field);
        const tagOptions = options ?? [
          { color: 'success', label: $t('common.enabled'), value: 1 },
          { color: 'error', label: $t('common.disabled'), value: 0 },
        ];
        const tagItem = tagOptions.find((item) => item.value === value);
        return h(
          NTag,
          {
            ...props,
            ...objectOmit(tagItem ?? {}, ['label']),
          },
          { default: () => tagItem?.label ?? value },
        );
      },
    });

    vxeUI.renderer.add('CellSwitch', {
      renderTableDefault({ attrs, props }, { column, row }) {
        const loadingKey = `__loading_${column.field}`;
        const finallyProps = {
          checkedChildren: $t('common.enabled'),
          checkedValue: 1,
          unCheckedChildren: $t('common.disabled'),
          unCheckedValue: 0,
          ...props,
          checked: row[column.field],
          loading: row[loadingKey] ?? false,
          'onUpdate:checked': onChange,
        };
        async function onChange(newVal: any) {
          row[loadingKey] = true;
          try {
            const result = await attrs?.beforeChange?.(newVal, row);
            if (result !== false) {
              row[column.field] = newVal;
            }
          } finally {
            row[loadingKey] = false;
          }
        }
        return h(NSwitch, finallyProps);
      },
    });

    // 开关
    vxeUI.renderer.add('CellSwitchPg', {
      renderTableDefault({ attrs, props }, { column, row,$table }) {
        const finallyProps = {
          size:'small',
          inlinePrompt:true,
          checkedValue: 1,
          uncheckedValue: 2,
          ...props,
          value: row[column.field],
          onClick: async()=>{
            let newVal = row[column.field]&&1===row[column.field]?2:1;
            try {
              const result = await attrs?.beforeChange?.(newVal, row,$table);
              if (result !== false) {
                if ($table) {
                  row[column.field] = newVal;
                  $table.isUpdateByRow(row);
                }
                return new Promise((resolve) => {
                  return resolve(true)
                })
              }
              return new Promise((resolve) => {
                return resolve(false)
              })
            } catch (e) {
              console.error(e);
            } finally {
            }
          },
        };
        return h(NSwitch, finallyProps,{
          checked:() => '有效',
          unchecked:() => '停用',
        });
      },
    });

    vxeUI.renderer.add('CellSwitchPgYesNo', {
      renderTableDefault({ attrs, props }, { column, row,$table }) {
        const finallyProps = {
          size:'small',
          inlinePrompt:true,
          checkedValue: 1,
          uncheckedValue: 2,
          ...props,
          value: row[column.field],
          onClick: async()=>{
            let newVal = row[column.field]&&1===row[column.field]?2:1;
            try {
              const result = await attrs?.beforeChange?.(newVal, row,$table);
              if (result !== false) {
                if ($table) {
                  row[column.field] = newVal;
                  $table.isUpdateByRow(row);
                }
                return new Promise((resolve) => {
                  return resolve(true)
                })
              }
              return new Promise((resolve) => {
                return resolve(false)
              })
            } catch (e) {
              console.error(e);
            } finally {
            }
          },
        };
        return h(NSwitch, finallyProps,{
          checked:() => '是',
          unchecked:() => '否',
        });
      },
    });

    /**
     * 注册表格的操作按钮渲染器
     */
    vxeUI.renderer.add('CellOperation', {
      renderTableDefault({ attrs, options, props }, { column, row }) {
        const defaultProps = { size: 'small', type: 'link', ...props };
        let align: string;
        switch (column.align) {
          case 'center': {
            align = 'center';
            break;
          }
          case 'left': {
            align = 'start';
            break;
          }
          default: {
            align = 'end';
            break;
          }
        }
        const presets: Recordable<Recordable<any>> = {
          delete: {
            danger: true,
            text: $t('common.delete'),
          },
          edit: {
            text: $t('common.edit'),
          },
          detail: {
            text: $t('common.detail'),
          },
        };
        const operations: Array<Recordable<any>> = (
          options || ['edit', 'detail', 'delete']
        )
          .map((opt) => {
            if (isString(opt)) {
              return presets[opt]
                ? { code: opt, ...presets[opt], ...defaultProps }
                : {
                  code: opt,
                  text: $te(`common.${opt}`) ? $t(`common.${opt}`) : opt,
                  ...defaultProps,
                };
            } else {
              return { ...defaultProps, ...presets[opt.code], ...opt };
            }
          })
          .map((opt) => {
            const optBtn: Recordable<any> = {};
            Object.keys(opt).forEach((key) => {
              optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
            });
            return optBtn;
          })
          .filter((opt) => opt.show !== false);

        function renderBtn(opt: Recordable<any>, listen = true) {
          return h(
            NButton,
            {
              ...props,
              ...opt,
              icon: undefined,
              onClick: listen
                ? () =>
                  attrs?.onClick?.({
                    code: opt.code,
                    row,
                  })
                : undefined,
            },
            {
              default: () => {
                const content = [];
                if (opt.icon) {
                  content.push(
                    h(IconifyIcon, { class: 'size-5', icon: opt.icon }),
                  );
                }
                content.push(opt.text);
                return content;
              },
            },
          );
        }

        function renderConfirm(opt: Recordable<any>) {
          let viewportWrapper: HTMLElement | null = null;
          return h(
            NPopconfirm,
            {
              /**
               * 当popconfirm用在固定列中时，将固定列作为弹窗的容器时可能会因为固定列较窄而无法容纳弹窗
               * 将表格主体区域作为弹窗容器时又会因为固定列的层级较高而遮挡弹窗
               * 将body或者表格视口区域作为弹窗容器时又会导致弹窗无法跟随表格滚动。
               * 鉴于以上各种情况，一种折中的解决方案是弹出层展示时，禁止操作表格的滚动条。
               * 这样既解决了弹窗的遮挡问题，又不至于让弹窗随着表格的滚动而跑出视口区域。
               */
              getPopupContainer(el) {
                viewportWrapper = el.closest('.vxe-table--viewport-wrapper');
                return document.body;
              },
              placement: 'topLeft',
              title: $t('ui.actionTitle.delete', [attrs?.nameTitle || '']),
              ...props,
              ...opt,
              icon: undefined,
              onOpenChange: (open: boolean) => {
                // 当弹窗打开时，禁止表格的滚动
                if (open) {
                  viewportWrapper?.style.setProperty('pointer-events', 'none');
                } else {
                  viewportWrapper?.style.removeProperty('pointer-events');
                }
              },
              onConfirm: () => {
                attrs?.onClick?.({
                  code: opt.code,
                  row,
                });
              },
            },
            {
              default: () => renderBtn({ ...opt }, false),
              description: () =>
                h(
                  'div',
                  { class: 'truncate' },
                  $t('ui.actionMessage.deleteConfirm', [
                    row[attrs?.nameField || 'name'],
                  ]),
                ),
            },
          );
        }

        const btns = operations.map((opt) =>
          opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
        );
        return h(
          'div',
          {
            class: 'flex table-operations',
            style: { justifyContent: align },
          },
          btns,
        );
      },
    });

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add
  },
  useVbenForm,
});

export const useVbenVxeGrid = <T extends Record<string, any>>(
  ...rest: Parameters<typeof useGrid<T, ComponentType, ComponentPropsMap>>
) => useGrid<T, ComponentType, ComponentPropsMap>(...rest);

/**
 * 表格操作按钮组件
 *
 * 在适配器内部统一注入权限判断（hasPermission），使用方无需再传入 `:has-permission`。
 * 通过 action 的 `auth` 字段声明权限码，结合 `useAccess().hasAccessByCodes` 判断是否展示。
 * 如需自定义权限逻辑，仍可显式传入 `:has-permission` 覆盖默认行为。
 */
export const VbenTableAction = defineComponent(
  (props: TableActionProps, { attrs, slots }) => {
    const { hasAccessByCodes,hasAccessByRoles } = useAccess();
    function hasPermission(auth?: string | string[]) {
      if (!auth) return true;
      if (hasAccessByRoles([ROLE_ADMINISTRATOR])) return true;
      return hasAccessByCodes(Array.isArray(auth) ? auth : [auth]);
    }
    return () =>
      h(VbenTableActionCore, { hasPermission, ...props, ...attrs }, slots);
  },
  {
    name: 'VbenTableAction',
    inheritAttrs: false,
  },
);

export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};
export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;
export type * from '@vben/plugins/vxe-table';
/**
 * confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
export function modalConfirm(content: string, title: string) {
  // const dialog = useDialog();
  return new Promise((reslove, reject) => {
    dialog.info({
      title: title,
      content: content,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        reslove(true);
      },
      onNegativeClick: () => {
        reject(new Error('已取消'));
      },
    });
  });
}
export function confirmSwitch(name: string, state: number) {
  const status = stateYesNoOptionFormatter({cellValue: state})
  return modalConfirm(`你要将【${name}】的状态切换为 【${status}】 吗？`, `切换状态`);
}
