import { createApp, watchEffect } from 'vue';

import { registerAccessDirective } from '@vben/access';
import { registerLoadingDirective } from '@vben/common-ui';
import { providePluginsOptions } from '@vben/plugins';
import { preferences } from '@vben/preferences';
import { initStores } from '@vben/stores';
import '@vben/styles';
import '@vben/styles/naive';

import { useTitle } from '@vueuse/core';

import { $t, setupI18n } from '#/locales';
import { router } from './router';

import { initComponentAdapter } from './adapter/component';
import { initSetupPgForm, initSetupVbenForm, useVbenForm } from './adapter/form';
import App from './app.vue';
// import { initTimezone } from './timezone-init';

// 离线图标注册：编译时从 @iconify/json 提取数据，运行时不再远程拉取
import '#/icons/setup';
import naive from 'naive-ui';
// 完整导入 UI 组件库
import VxeUI from 'vxe-pc-ui';
// 完整导入 表格库
import VxeUITable from 'vxe-table';

import 'vxe-pc-ui/lib/style.css';
import 'vxe-table/lib/style.css';
import './style/style.css';

async function bootstrap(namespace: string) {
  // 初始化组件适配器
  await initComponentAdapter();

  // 初始化表单组件
  await initSetupVbenForm();
  await initSetupPgForm();

  // 注入插件全局配置
  providePluginsOptions({
    form: { useVbenForm },
  });

  // 设置弹窗的默认配置
  // setDefaultModalProps({
  //   fullscreenButton: false,
  // });
  // 设置抽屉的默认配置
  // setDefaultDrawerProps({
  //   zIndex: 1020,
  // });

  const app = createApp(App);

  // 注册v-loading指令
  registerLoadingDirective(app, {
    loading: 'loading', // 在这里可以自定义指令名称，也可以明确提供false表示不注册这个指令
    spinning: 'spinning',
  });

  app.use(naive);
  // 国际化 i18n 配置
  await setupI18n(app);

  // 配置 pinia-tore
  await initStores(app, { namespace });

  // 初始化时区HANDLER
  // initTimezone();

  // 安装权限指令
  registerAccessDirective(app);

  // 初始化 tippy
  const { initTippy } = await import('@vben/common-ui/es/tippy');
  initTippy(app);

  // 表单设计器
  app.use(VxeUI);
  app.use(VxeUITable);
  // 配置路由及路由守卫
  app.use(router);

  // 配置Motion插件
  const { MotionPlugin } = await import('@vben/plugins/motion');
  app.use(MotionPlugin);

  // 动态更新标题
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle =
        (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });

  app.mount('#app');
}

export { bootstrap };
