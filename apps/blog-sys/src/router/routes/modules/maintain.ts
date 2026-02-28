import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 2021,
      title: '维护',
    },
    name: 'maintain',
    path: '/lq2/basic/area',
    children: [
      // {
      //   meta: {
      //     title: '首页',
      //     icon: 'mdi:account-multiple',
      //   },
      //   name: 'basic-index',
      //   path: '/lq2/basic/index',
      //   component: () => import('#/viewsRam/resource/resource/index.vue'),
      // },
      {
        meta: {
          title: '省市区',
          icon: 'mdi:account-multiple',
        },
        name: 'basic-area',
        path: '/lq2/basic/area',
        component: () => import('#/viewsBasic/area/index.vue'),
      },
      {
        meta: {
          title: '国家',
          icon: 'mdi:account-key',
        },
        name: 'basic-country',
        path: '/lq2/basic/country',
        component: () => import('#/viewsBasic/country/index.vue'),
      },
      {
        meta: {
          title: '附件列表',
          icon: 'mdi:account-key',
        },
        name: 'basic-attachment',
        path: '/lq2/basic/attachment',
        component: () => import('#/viewsBasic/attachment/index.vue'),
      },
      {
        meta: {
          title: '数据字典',
          icon: 'mdi:account-key',
        },
        name: 'basic-data-dictionary',
        path: '/lq2/basic/data-dictionary',
        component: () => import('#/viewsBasic/data-dict/dict/index.vue'),
      },
      {
        meta: {
          title: '数据快照',
          icon: 'mdi:account-key',
        },
        name: 'basic-data-snapshot',
        path: '/lq2/basic/data-snapshot',
        component: () =>
          import('#/viewsBasic/data-snapshot/snapshot/index.vue'),
      },
      {
        meta: {
          title: '模块',
          icon: 'mdi:account-key',
        },
        name: 'basic-module',
        path: '/lq2/basic/module',
        component: () => import('#/viewsBasic/module/index.vue'),
      },
      {
        meta: {
          title: '说明',
          icon: 'mdi:account-key',
        },
        name: 'basic-explain',
        path: '/lq2/basic/explain',
        children: [
          {
            meta: {
              title: '说明',
              icon: 'mdi:account-key',
            },
            name: 'basic-explain-index',
            path: '/lq2/basic/explain-index',
            component: () => import('#/viewsBasic/explain/list/index.vue'),
          },
          {
            meta: {
              title: '说明分类',
              icon: 'mdi:account-key',
            },
            name: 'basic-explain-category',
            path: '/lq2/basic/explain-category',
            component: () => import('#/viewsBasic/explain/category/index.vue'),
          },
        ],
      },
      {
        meta: {
          title: '任务',
          icon: 'mdi:account-key',
        },
        name: 'basic-task',
        path: '/lq2/basic/task',
        children: [
          {
            meta: {
              title: '任务',
              icon: 'mdi:account-key',
            },
            name: 'basic-task-index',
            path: '/lq2/basic/task-index',
            component: () => import('#/viewsBasic/task/list/index.vue'),
          },
          {
            meta: {
              title: '任务分类',
              icon: 'mdi:account-key',
            },
            name: 'basic-task-category',
            path: '/lq2/basic/task-category',
            component: () => import('#/viewsBasic/task/category/index.vue'),
          },
        ],
      },
    ],
  },
];

export default routes;
