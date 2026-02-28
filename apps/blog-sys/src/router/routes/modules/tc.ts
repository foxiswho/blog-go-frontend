import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'mdi:store',
      keepAlive: true,
      order: 1921,
      title: '租户',
    },
    name: 'tc',
    path: '/lq2/tc/index',
    children: [
      {
        meta: {
          title: '首页',
          icon: 'mdi:account-multiple',
        },
        name: 'tc-index',
        path: '/lq2/tc/index',
        component: () => import('#/viewsMc/tenant/index.vue'),
      },
      {
        meta: {
          title: '租户',
          icon: 'mdi:store-cog-outline',
        },
        name: 'tc-tenant',
        path: '/lq2/tc/tenant',
        component: () => import('#/viewsMc/tenant/index.vue'),
      },
      {
        meta: {
          title: '租户域名',
          icon: 'mdi:internet',
        },
        name: 'tc-tenant-domain',
        path: '/lq2/tc/tenant-domain',
        component: () => import('#/viewsMc/tenantDomain/index.vue'),
      },
      {
        meta: {
          title: '租户创始人',
          icon: 'mdi:account',
        },
        name: 'tc-tenant-account',
        path: '/lq2/tc/tenant-account',
        component: () => import('#/viewTc/tenantAccount/index.vue'),
      },
    ],
  },
];

export default routes;
