import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: '博客',
    },
    name: 'blog',
    path: '/lq2/blog/article',
    children: [
      {
        meta: {
          title: '文章',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-article',
        path: '/lq2/blog/article',
        component: () => import('#/viewsBlog/article/index.vue'),
      },
      {
        meta: {
          title: '文章分类',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-article-cat',
        path: '/lq2/blog/article-category',
        component: () => import('#/viewsBlog/articleCategory/index.vue'),
      },
      {
        meta: {
          title: '主题',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-topic',
        path: '/lq2/blog/topic',
        component: () => import('#/viewsBlog/topic/index.vue'),
      },
      {
        meta: {
          title: '主题分类',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-topic-cat',
        path: '/lq2/blog/topic-cat',
        component: () => import('#/viewsBlog/topicCategory/index.vue'),
      },
      {
        meta: {
          title: '收集',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-collect',
        path: '/lq2/blog/collect',
        component: () => import('#/viewsBlog/collect/index.vue'),
      },
      {
        meta: {
          title: '收集分类',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-collect-cat',
        path: '/lq2/blog/collect-cat',
        component: () => import('#/viewsBlog/collectCategory/index.vue'),
      },
    ],
  },
];

export default routes;
