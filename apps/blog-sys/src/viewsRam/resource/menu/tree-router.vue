<script setup lang="ts">
import type { MenuRecordRaw } from '@vben-core/typings';
import type { RowVO } from '@pg/types';

import { onMounted, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben-core/popup-ui';
import { MenuBadge } from '@vben-core/menu-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { IconifyIcon, Plus } from '@vben/icons';
import { message as Message } from '#/adapter';
import { useAccessStore } from '@vben/stores';
import { VXETable } from 'vxe-table';
import type {
  VxeGridInstance,
  VxeGridListeners,
  VxeGridProps,
} from 'vxe-table';

import DrawerEdit from './components/DrawerEdit.vue';
import {columns, columnsRouter} from './data';
import {$t} from "@vben/locales";
import {IFrameView} from "#/layouts";

const accessStore = useAccessStore();

function flattenAccessMenus(menus: MenuRecordRaw[]): any[] {
  console.log('menus 22222',menus)
  for (const menu of menus) {
    const hasChildren = menu.children && menu.children.length > 0;
    let typeMenu = hasChildren ? 'catalog' : 'menu';
    // console.log('menu?.component === IFrameView',menu?.component)
    // if(menu?.meta && menu?.meta?.link) {
    //   typeMenu = 'link';
    // }
    menu.component2 = '';
    if(menu?.meta &&menu?.meta?.iframeSrc) {
      menu.component2 = menu?.meta?.iframeSrc;
      typeMenu = 'embedded';
    }
    if (menu && menu.component && menu.component2==='') {
      const str = menu.component.toString();
      if(str) {
        if(str.indexOf('IFrameView') >0) {
          typeMenu = 'link';
          menu.component2 = menu.meta.link;
        } else {
          const match = str.match(/"([^"]+)"/);
          menu.component2 = match ? match[1] : '';
          menu.component2 = menu.component2.replace(/^.*\/src\//, '');
          menu.component2 = menu.component2.replace(/\?.*$/, '');
          // menu.component2 = match ? match[1] : '';
        }
      }
    }
    menu.typeMenu = typeMenu;
    menu.label = $t(menu.meta.title);
    menu.id = crypto.randomUUID();
    if (hasChildren) {
      flattenAccessMenus(menu.children!);
    }
  }
  console.log('menus',menus)
  return menus;
}

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
});

const xGrid = ref<VxeGridInstance<RowVO>>();
const gridOptions = reactive<VxeGridProps<RowVO>>({
  border: true,
  showHeaderOverflow: true,
  showOverflow: true,
  keepSource: true,
  id: 'full_0035',
  // height: '99%',
  minHeight: 800,
  rowConfig: {
    keyField: 'id',
    isHover: true,
    // useKey: true,
  },
  treeConfig: {
    //parentField: 'parentNo',
    rowField: 'id',
    childrenField: 'children',
    // transform: true,
    expandAll: true,
    showLine: true,
    showRootLine: true,
  },
  columnConfig: {
    resizable: true,
  },
  toolbarConfig: {
    refresh: true, // 显示刷新按钮
    import: false, // 显示导入按钮
    export: false, // 显示导出按钮
    print: false, // 显示打印按钮
    zoom: true, // 显示全屏按钮
    custom: true, // 显示自定义列按钮
  },
  proxyConfig: {
    seq: false, // 启用动态序号代理，每一页的序号会根据当前页数变化
    sort: false, // 启用排序代理，当点击排序时会自动触发 query 行为
    filter: false, // 启用筛选代理，当点击筛选时会自动触发 query 行为
    form: false, // 启用表单代理，当点击表单提交按钮时会自动触发 reload 行为
    // 只接收Promise，具体实现自由发挥
    ajax: {
      // 当点击工具栏查询按钮或者手动提交指令 query或reload 时会被触发
      query: () => {
        const data = flattenAccessMenus(accessStore.accessRoutes);
        return Promise.resolve({ items: data });
      },
    },
  },
  columns:columnsRouter,
});

const gridEvent: VxeGridListeners<RowVO> = {
  proxyQuery() {
    console.log('数据代理查询事件');
  },
  proxyDelete() {
    console.log('数据代理删除事件');
  },
  proxySave() {
    console.log('数据代理保存事件');
  },
};


const eventCopy = (row: RowVO) => {
  console.log('$grid.editRowEvent', row);

};


onMounted(() => {});

</script>

<template>
  <div class="grid2 h-full p-2">
    <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvent">
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 shrink-0">
            <IconifyIcon
              v-if="row.typeMenu === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.meta.icon"
              :icon="row.meta.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ row.label }}</span>
          <div class="items-center justify-end"></div>
        </div>
        <MenuBadge
          v-if="row.meta.badgeType"
          class="menu-badge"
          :badge="row.meta.badge"
          :badge-type="row.meta.badgeType"
          :badge-variants="row.meta.badgeVariants"
        />
      </template>
      <template #operate="{ row }">
        <n-button
          size="tiny"
          text
          tag="a"
          type="primary"
          @click="eventCopy(row)"
        >
          复制
        </n-button>
      </template>
    </vxe-grid>
  </div>
</template>

<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
