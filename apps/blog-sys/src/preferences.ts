import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    defaultAvatar: '/static/avatar-v1.webp',
    /** 登录注册页面布局 */
    authPageLayout: 'panel-center',
    logo: {
      enable: true,
      source: '/static/logo-v1.webp',
    },
  },
  theme: {
    mode: 'light',
  },
  tabbar: {
    /** 标签页风格 */
    styleType: 'card',
  },
  widget: {
    /** 是否启用全屏部件 */
    fullscreen: true,
    /** 是否启用全局搜索部件 */
    globalSearch: false,
    /** 是否启用语言切换部件 */
    languageToggle: false,
    /** 是否开启锁屏功能 */
    lockScreen: true,
    /** 是否显示通知部件 */
    notification: false,
    /** 显示刷新按钮 */
    refresh: true,
    /** 是否显示侧边栏显示/隐藏部件 */
    sidebarToggle: true,
    /** 是否显示主题切换部件 */
    themeToggle: false,
  },
  copyright: {
    /** 版权公司名 */
    companyName: '仙域科技',
    /** 版权公司名链接 */
    companySiteLink: '仙域科技',
    /** 版权日期 */
    date: '2025',
    /** 版权是否可见 */
    enable: false,
    /** 备案号 */
    icp: 'ICP1111111',
    /** 备案号链接 */
    icpLink: '',
    /** 设置面板是否显示*/
    settingShow: true,
  },
});
