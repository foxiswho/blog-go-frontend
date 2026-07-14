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
    path: '/lq2/ram/resource',
    children: [
      {
        meta: {
          title: '资源',
          icon: 'carbon:software-resource',
        },
        name: 'resource-resource',
        path: '/lq2/ram/resource/index',
        component: () => import('#/viewsRam/resource/resource/index.vue'),
      },
      {
        meta: {
          title: '资源组',
          icon: 'grommet-icons:resources',
        },
        name: 'resource-group',
        path: '/lq2/ram/resource/group',
        component: () => import('#/viewsRam/resource/group/index.vue'),
      },
      {
        meta: {
          title: '资源组分类',
          icon: 'boxicons:component',
        },
        name: 'resource-group-category',
        path: '/lq2/ram/resource/group-category',
        component: () => import('#/viewsRam/resource/group-category/index.vue'),
      },
      {
        meta: {
          title: '资源组权限',
          icon: 'streamline-freehand:human-resources-hierarchy',
        },
        name: 'resource-group-authority',
        path: '/lq2/ram/resource/group-authority',
        component: () =>
          import('#/viewsRam/resource/resource-authority/group.vue'),
      },
      // {
      //   meta: {
      //     title: '菜单',
      //     icon: 'mdi:account-key',
      //   },
      //   name: 'resource-menu',
      //   path: '/lq2/ram/resource/menu',
      //   component: () => import('#/viewsRam/resource/menu/index.vue'),
      // },
      {
        meta: {
          title: '菜单',
          icon: 'mdi-light:menu',
        },
        name: 'resource-menu',
        path: '/lq2/ram/resource/menu',
        component: () => import('#/viewsRam/resource/menu/index.vue'),
      },
      {
        meta: {
          title: '菜单-本地路由数据',
          icon: 'clarity:router-line',
        },
        name: 'resource-menu3-router',
        path: '/lq2/ram/resource/menu3-router',
        component: () => import('#/viewsRam/resource/menu/tree-router.vue'),
      },
    ],
  },
];

export default routes;
