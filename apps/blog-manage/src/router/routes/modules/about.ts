import type { RouteRecordRaw } from 'vue-router';

import {
  XF_GITHUB_URL,
  XF_DOC_URL, XF_GITHUB_URL_FRONTEND,
} from '@pg/constants';
import {
  SvgAntdvLogoIcon,
  SvgAntdvNextLogoIcon,
  SvgTDesignIcon,
} from '@vben/icons';

import { IFrameView } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'VbenAbout',
    path: '/about',
    component: () => import('#/views/_core/about/index.vue'),
    meta: {
      icon: 'lucide:copyright',
      title: $t('demos.vben.about'),
      order: 9999,
    },
    children: [
      {
        name: 'BlogDocument',
        path: '/about/document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: XF_DOC_URL,
          title: $t('demos.vben.document'),
        },
      },
      {
        name: 'BlogGithub',
        path: '/about/github',
        component: IFrameView,
        meta: {
          icon: 'mdi:github',
          link: XF_GITHUB_URL,
          title: 'Github',
        },
      },
      {
        name: 'Blog 问题&帮助',
        path: '/about/github',
        component: IFrameView,
        meta: {
          icon: 'mdi:github',
          link: `${XF_GITHUB_URL}/issues`,
          title: 'Blog 问题&帮助',
        },
      },
      {
        name: '后台前端 问题&帮助',
        path: '/about/github',
        component: IFrameView,
        meta: {
          icon: 'mdi:github',
          link: `${XF_GITHUB_URL_FRONTEND}/issues`,
          title: '后台前端 问题&帮助',
        },
      },
      {
        name: '关于',
        path: '/about/blog',
        component: () => import('#/viewsPub/about/index.vue'),
        meta: {
          icon: 'lucide:copyright',
          title: $t('demos.vben.about'),
          order: 9999,
        },
      },
    ],
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
  },
];

export default routes;
