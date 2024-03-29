const ENV = require('./libraries/env.js');
const AUTH = require('./libraries/auth.js');
const REQUEST = require('./libraries/request.js');
const OnFire = require('./libraries/onfire.js');
const WXLog = require('./libraries/wxlog.js');
import Notify from './miniprogram_npm/@vant/weapp/notify/notify.js';

App({
  ENV: ENV,
  AUTH: AUTH,
  REQUEST: REQUEST,
  OnFire: OnFire,
  Notify: Notify,
  WXLog: WXLog,

  // 通知数角标在 TabBar 的位置
  noticeBadgeAtTabBarIndex: 4,
  noticeTabBarPageUrl: 'modules/notice/index/index',

  // callback
  getSystemSettingsSuccessCallback: null,
  authInitedCallback: null,

  globalData: {
    hcInfo: null,
    wxappAccountInfo: null,
    wxappName: null,
    wxappVersion: null,

    isAuth: false,
    apiTrackToken: null,
    apiToken: null,
    userInfo: null,
    wechatUserInfo: null,
    systemSettings: null,
  },

  /**
   * onLaunch
   */
  onLaunch() {
    let _this = this;

    // 初始化小程序信息
    this.globalData.hcInfo = ENV.hcInfo;                                                          // HeyCommunity 信息
    this.globalData.wxappName = ENV.wxappName;                                                    // 当前小程序名称
    this.globalData.wxappSlogan = ENV.wxappSlogan;                                                // 当前小程序口号
    this.globalData.wxappAccountInfo = wx.getAccountInfoSync();                                   // 当前小程序帐号信息
    this.globalData.wxappVersion = this.globalData.wxappAccountInfo.miniProgram.envVersion;       // 当前小程序版本号
    if (this.globalData.wxappVersion === 'release') this.globalData.wxappVersion = 'v' + this.globalData.wxappAccountInfo.miniProgram.version;

    // SystemSettings
    this.REQUEST.GET('system/settings', {}, {showRequestFailModal: false}).then(function(result) {
      _this.globalData.systemSettings = result.data;

      if (_this.getSystemSettingsSuccessCallback) _this.getSystemSettingsSuccessCallback();
    });

    // 恢复用户及登录状态
    AUTH.restoreLogin(_this).then(function(result) {
      _this.Notify({message: _this.globalData.userInfo.nickname + ', 欢迎回来', type: 'primary'});
    }).catch(function(res) {
    }).finally(function() {
      if (_this.authInitedCallback) _this.authInitedCallback();
    });

    AUTH.enableUserTrack();     // 启用用户追踪
  },

  /**
   * 如果 isAuth = false, 则打开登录页面
   */
  needAuth() {
    if (this.globalData.isAuth) {
      return false;
    } else {
      wx.navigateTo({url: '/modules/user/pages/auth/index'});
      return true;
    }
  },

  /**
   * 重设通知角标
   */
  resetNoticeBadgeAtTabBar() {
    // 获取当前页面 URL
    let getCurrentPageUrl = function() {
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];

      return currentPage.route;
    }

    // 如果已登录且未读通知数大于 0
    if (this.globalData.isAuth && this.globalData.userInfo.unread_notice_num) {
      wx.setTabBarBadge({
        index: this.noticeBadgeAtTabBarIndex,
        text: String(this.globalData.userInfo.unread_notice_num),
      });
      console.debug('resetNoticeBadgeAtTabBar: unread_notice_num => ' + this.globalData.userInfo.unread_notice_num);

      // 如果当前正处于通知 TabBar 页面，则触发 noticeRefresh 事件，以更新页面中的通知数据
      if (getCurrentPageUrl() === this.noticeTabBarPageUrl) {
        this.OnFire.fire('noticeRefresh');
        console.debug('resetNoticeBadgeAtTabBar: noticeRefresh');
      }
    } else {
      wx.removeTabBarBadge({index: this.noticeBadgeAtTabBarIndex});
    }
  },
})
