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
  globalData: {
    hcInfo: null,
    wxappAccountInfo: null,
    wxappName: null,
    wxappVersion: null,

    isAuth: false,
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
    this.globalData.wxappAccountInfo = wx.getAccountInfoSync();                                   // 当前小程序帐号信息
    this.globalData.wxappVersion = this.globalData.wxappAccountInfo.miniProgram.version;          // 当前小程序版本号
    if (! this.globalData.wxappVersion) this.globalData.wxappVersion = this.globalData.wxappAccountInfo.miniProgram.envVersion;

    // 恢复用户及登录状态
    AUTH.restoreLogin(_this).then(function(result) {
      _this.showNotify(result.data.nickname + ', 欢迎回来', 'primary');
    }).catch(function(res) {
      wx.login({
        success: function(res) {
          let loginCode = res.code;
          _this.REQUEST.GET('users/login', {code: loginCode}, {showRequestFailModal: false}).then(function(result) {
            _this.globalData.apiToken = result.data.token;
            console.debug('未登录用户在后台进行注册，获取 apiToken => ' + result.data.token);
          }).catch(function(res) {
            _this.WXLog.addFilterMsg('AUTH-ERR');
            _this.WXLog.warn('用户半登录失败 code => ' + loginCode);
          });
        },
      });
    }).finally(function() {
      if (_this.authInitedCallback) _this.authInitedCallback();
    });

    // SystemSettings
    this.REQUEST.GET('system/settings', {}, {showRequestFailModal: false}).then(function(result) {
      _this.globalData.systemSettings = result.data;
    });
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
   * UserPingHandler
   */
  userPingHandler(result) {
    console.debug('gotUserPingData', result);

    if (result.data && result.data.unread_notice_num) {
      let beforeUnReadNoticeNum = this.globalData.userInfo.unread_notice_num;
      let currentUnReadNoticeNum = result.data.unread_notice_num;
      let newNoticeNum = currentUnReadNoticeNum - beforeUnReadNoticeNum;

      if (newNoticeNum > 0) {
        this.Notify({
          message: '收到 ' + newNoticeNum + ' 条新通知 \n 点击查看',
          type: 'primary',
          duration: 6000,
          onClick: function() {
            wx.switchTab({url: '/pages/notices/index/index'});
          },
        });

        this.globalData.userInfo.unread_notice_num = currentUnReadNoticeNum;

        this.resetNoticeTabBarBadge();
      }
    }
  },

  /**
   * Reset TabBar Badge
   */
  resetTabBarBadge() {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let currentPageUrl = currentPage.route;

    let tabPages = [
      'pages/posts/index/index',
      'pages/notices/index/index',
      'pages/users/index/index',
    ];

    if (this.globalData.isAuth) {
      if (tabPages.includes(currentPageUrl)) {
        this.resetNoticeTabBarBadge(false);      // 设置通知页面的 TabBarBadge
      } else {
        console.debug('resetTabBarBadge: 当前页面为非 TabBar 页面，跳过设置');
      }
    } else {
      // 删除所有 TabBarBadge
      wx.removeTabBarBadge({index: 1});
      // wx.removeTabBarBadge({index: 0});
      // wx.removeTabBarBadge({index: 2});

      console.debug('resetTabBarBadge: 用户未登录，移除所有 TabBarBadge');
    }
  },

  /**
   * resetNoticeTabBarBadge
   */
  resetNoticeTabBarBadge(forceReset) {
    if (this.globalData.userInfo.unread_notice_num) {
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      let currentPageUrl = currentPage.route;

      let noticeTabBadgeText = String(this.globalData.userInfo.unread_notice_num);
      wx.setTabBarBadge({
        index: 1,
        text: noticeTabBadgeText,
      });
      console.debug('resetNoticeTabBarBadge: unread_notice_num => ' + this.globalData.userInfo.unread_notice_num);

      if (currentPageUrl === 'pages/notices/index/index') {
        this.OnFire.fire('noticeRefresh');
        console.debug('resetNoticeTabBarBadge: noticeRefresh');
      }
    } else {
      wx.removeTabBarBadge({index: 1});
    }
  },
})
