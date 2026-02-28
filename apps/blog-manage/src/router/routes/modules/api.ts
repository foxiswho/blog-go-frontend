import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:video-input-component',
      keepAlive: true,
      order: 5000,
      title: '接口',
    },
    name: '接口',
    path: '/lq2/api',
    children: [
      {
        meta: {
          icon: 'mdi:memory',
          title: '接口外交官',
        },
        name: 'api-dipl',
        path: '/lq2/api/dipl',
        component: () => import('#/viewsApi/dipl/index.vue'),
      },
      {
        meta: {
          icon: 'mdi:layers-triple-outline',
          title: '分类',
        },
        name: 'api-dipl-cat',
        path: '/lq2/api/dipl-cat',
        component: () => import('#/viewsApi/diplCategory/index.vue'),
      },
    ],
  },
];

export default routes;
