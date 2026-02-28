import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: '管理员',
    },
    name: 'manage',
    path: '/lq2/ram',
    children: [
      {
        meta: {
          title: '账户',
          icon: 'mdi:account-multiple',
        },
        name: 'ram-account',
        path: '/lq2/ram/account',
        component: () => import('#/viewsRam/account/index.vue'),
      },
      {
        meta: {
          title: '部门',
          icon: 'mdi:account-key',
        },
        name: 'ram-department',
        path: '/lq2/ram/department',
        component: () => import('#/viewsRam/department/index.vue'),
      },
      {
        meta: {
          title: '角色',
          icon: 'mdi:account-key',
        },
        name: 'ram-role',
        path: '/lq2/ram/role',
        component: () => import('#/viewsRam/role/index.vue'),
      },
      {
        meta: {
          title: '分组',
          icon: 'mdi:group',
        },
        name: 'ram-group',
        path: '/lq2/ram/group',
        component: () => import('#/viewsRam/group/index.vue'),
      },
      {
        meta: {
          title: '级别管理',
          icon: 'mdi:chemical-weapon',
        },
        name: 'ram-level',
        path: '/lq2/ram/level',
        component: () => import('#/viewsRam/level/index.vue'),
      },
      {
        meta: {
          title: '职务管理',
          icon: 'mdi:account-circle',
        },
        name: 'ram-position',
        path: '/lq2/ram/position',
        component: () => import('#/viewsRam/position/index.vue'),
      },
      {
        meta: {
          title: '岗位管理',
          icon: 'mdi:account-settings',
        },
        name: 'ram-post',
        path: '/lq2/ram/post',
        component: () => import('#/viewsRam/post/index.vue'),
      },
      {
        meta: {
          title: '团队管理',
          icon: 'mdi:account-settings',
        },
        name: 'ram-team',
        path: '/lq2/ram/team',
        component: () => import('#/viewsRam/team/index.vue'),
      },
      // {
      //   meta: {
      //     title: '扩展管理',
      //     icon: 'mdi:account-settings',
      //   },
      //   name: 'ram-ext',
      //   path: '/lq2/ext',
      //   component: () => import('#/viewsRam/group/index.vue'),
      // },
    ],
  },
];

export default routes;
