<script setup lang="ts">
import type { AboutProps, DescriptionItem } from './about';

import {computed, h, onMounted, ref, watch} from 'vue';

import {
  VBEN_DOC_URL,
  VBEN_GITHUB_URL,
  VBEN_PREVIEW_URL,
} from '@vben/constants';
import {
  XF_HOME_URL,
  XF_PREVIEW_URL,
  XF_GITHUB_URL,
  XF_DOC_URL, XF_GITHUB_URL_FRONTEND,
} from '@pg/constants';

import { VbenRenderContent } from '@vben-core/shadcn-ui';

import { Page } from '@vben/common-ui';
import {envInfoPublic} from "#/viewsPub/pub/api";

interface Props extends AboutProps {}

defineOptions({
  name: 'AboutUI',
});

withDefaults(defineProps<Props>(), {
  description:
    '是一个部署即可使用的博客。',
  name: '博客',
  title: '关于项目',
});

declare global {
  const __VBEN_ADMIN_METADATA__: {
    authorEmail: string;
    authorName: string;
    authorUrl: string;
    buildTime: string;
    dependencies: Record<string, string>;
    description: string;
    devDependencies: Record<string, string>;
    homepage: string;
    license: string;
    repositoryUrl: string;
    version: string;
  };
}

const renderLink = (href: string, text: string) =>
  h(
    'a',
    { href, target: '_blank', class: 'vben-link' },
    { default: () => text },
  );
const xfEnv = ref({});
const loadData = () => {
  // 获取项目信息
  envInfoPublic().then((d)=>{
    console.log(d);
    xfEnv.value = d;
  })
};

onMounted(() => {
  loadData();
});

const env = computed(() => xfEnv.value);

const {
  authorEmail,
  authorName,
  authorUrl,
  buildTime,
  dependencies = {},
  devDependencies = {},
  homepage,
  license,
  version,
  // vite inject-metadata 插件注入的全局变量
} = __VBEN_ADMIN_METADATA__ || {};

const vbenDescriptionItems = ref<DescriptionItem[]>([
  {
    content: env.value.BuildVersion,
    title: '项目版本号',
  },
  {
    content: env.value.BuildTime,
    title: '项目编译时间',
  },
  {
    content: env.value.BuildGitCommit,
    title: '项目HASH',
  },
  {
    content: license,
    title: '项目开源许可协议',
  },
  {
    content: version,
    title: '前端版本号',
  },
  {
    content: license,
    title: '开源许可协议',
  },
  {
    content: buildTime,
    title: '最后构建时间',
  },
  {
    content: renderLink(XF_HOME_URL, '点击查看'),
    title: '主页',
  },
  {
    content: renderLink(XF_DOC_URL, '点击查看'),
    title: '文档地址',
  },
  {
    content: renderLink(XF_PREVIEW_URL, '点击查看'),
    title: '预览地址',
  },
  {
    content: renderLink(XF_GITHUB_URL, '点击查看'),
    title: 'Github',
  },
  {
    content: renderLink(XF_GITHUB_URL_FRONTEND, '点击查看'),
    title: 'Github(后台界面)',
  },
  {
    content: h('div', [
      renderLink(authorUrl, `${authorName}  `),
      renderLink(`mailto:${authorEmail}`, authorEmail),
    ]),
    title: '作者',
  },
]);

const vbenDescriptionItemsComputed = computed(() => vbenDescriptionItems.value);
console.log(vbenDescriptionItemsComputed)
const dependenciesItems = Object.keys(dependencies).map((key) => ({
  content: dependencies[key],
  title: key,
}));

const devDependenciesItems = Object.keys(devDependencies).map((key) => ({
  content: devDependencies[key],
  title: key,
}));

watch(
  () => xfEnv.value,
  (newValue, oldValue) => {
    console.log('newValue',newValue);
    for (const key in vbenDescriptionItems.value) {
      const item = vbenDescriptionItems.value[key];
      if ('项目版本号'===item.title) {
        vbenDescriptionItems.value[key].content = newValue.BuildVersion;
      } else if ('项目编译时间'===item.title) {
        vbenDescriptionItems.value[key].content = newValue.BuildTime;
      }else if ('项目HASH'===item.title) {
        vbenDescriptionItems.value[key].content = newValue.BuildGitCommit;
      }
    }
  },
  { immediate: true }
)
const xfItems = ref<DescriptionItem[]>([
  {
    content: '1.26',
    title: 'GoLang',
  },
  {
    content: '1.12.0',
    title: 'Gin Framework',
  },
  {
    content: '1.2.5',
    title: 'GoSpring',
  },
  {
    content: 'postgreSql 17+',
    title: '数据库',
  },
  {
    content: '7+',
    title: 'redis',
  },
]);

</script>

<template>
  <Page :title="title">
    <template #description>
      <p class="text-foreground mt-3 text-sm leading-6">
        <a :href="VBEN_GITHUB_URL" class="vben-link" target="_blank">
          {{ name }}
        </a>
        {{ description }}
      </p>
    </template>
    <div class="card-box p-5">
      <div>
        <h5 class="text-foreground text-lg">基本信息</h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <template v-for="item in vbenDescriptionItemsComputed" :key="item.title">
            <div class="border-border border-t px-4 py-6 sm:col-span-1 sm:px-0">
              <dt class="text-foreground text-sm font-medium leading-6">
                {{ item.title }}
              </dt>
              <dd class="text-foreground mt-1 text-sm leading-6 sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>
    <div class="bg-white mt-5 pt-2">
      <n-tabs type="segment" animated>
        <n-tab-pane name="chap1" tab="项目">
          <div class="card-box pl-5 pr-5">
            <div>
              <h5 class="text-foreground text-lg">环境依赖</h5>
            </div>
            <div class="mt-4">
              <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <template v-for="item in xfItems" :key="item.title">
                  <div class="border-border border-t px-4 py-3 sm:col-span-1 sm:px-0">
                    <dt class="text-foreground text-sm">
                      {{ item.title }}
                    </dt>
                    <dd class="text-foreground/80 mt-1 text-sm sm:mt-2">
                      <VbenRenderContent :content="item.content" />
                    </dd>
                  </div>
                </template>
              </dl>
            </div>
          </div>
        </n-tab-pane>
        <n-tab-pane name="chap2" tab="后台管理前端">
          <div class="card-box pl-5 pr-5">
            <div>
              <h5 class="text-foreground text-lg">生产环境依赖</h5>
            </div>
            <div class="mt-4">
              <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <template v-for="item in dependenciesItems" :key="item.title">
                  <div class="border-border border-t px-4 py-3 sm:col-span-1 sm:px-0">
                    <dt class="text-foreground text-sm">
                      {{ item.title }}
                    </dt>
                    <dd class="text-foreground/80 mt-1 text-sm sm:mt-2">
                      <VbenRenderContent :content="item.content" />
                    </dd>
                  </div>
                </template>
              </dl>
            </div>
          </div>
          <div class="card-box mt-6 p-5">
            <div>
              <h5 class="text-foreground text-lg">开发环境依赖</h5>
            </div>
            <div class="mt-4">
              <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <template v-for="item in devDependenciesItems" :key="item.title">
                  <div class="border-border border-t px-4 py-3 sm:col-span-1 sm:px-0">
                    <dt class="text-foreground text-sm">
                      {{ item.title }}
                    </dt>
                    <dd class="text-foreground/80 mt-1 text-sm sm:mt-2">
                      <VbenRenderContent :content="item.content" />
                    </dd>
                  </div>
                </template>
              </dl>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>


  </Page>
</template>
