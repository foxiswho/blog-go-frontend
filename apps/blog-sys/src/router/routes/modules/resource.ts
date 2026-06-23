import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1001,
      title: '资源',
    },
    name: 'resource',
    path: '/lq2/ram/resource/index',
    children: [
      {
        meta: {
          title: '资源',
          icon: 'mdi:account-multiple',
        },
        name: 'resource-resource',
        path: '/lq2/ram/resource/index',
        component: () => import('#/viewsRam/resource/resource/index.vue'),
      },
      {
        meta: {
          title: '资源组权限',
          icon: 'mdi:account-key',
        },
        name: 'resource-group-authority',
        path: '/lq2/ram/resource/group-authority',
        component: () =>
          import('#/viewsRam/resource/resource-authority/group.vue'),
      },
      {
        meta: {
          title: '菜单',
          icon: 'mdi:account-key',
        },
        name: 'resource-menu',
        path: '/lq2/ram/resource/menu',
        component: () => import('#/viewsRam/resource/menu/index.vue'),
      },
      {
        meta: {
          title: '菜单资源组关系',
          icon: 'mdi:account-key',
        },
        name: 'resource-menu-relation',
        path: '/lq2/ram/resource/menu-relation',
        component: () => import('#/viewsRam/resource/menu-relation/group.vue'),
      },
    ],
  },
];

export default routes;
