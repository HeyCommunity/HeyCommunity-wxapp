const AUTH = require('./utils/auth.js');
const HTTP = require('./utils/http.js');
const OnFire = require('./utils/onfire.js');
import Notify from './miniprogram_npm/@vant/weapp/notify/notify';
const tdweapp = require('./utils/talkingData/tdweapp.js');

App({
  AUTH: AUTH,
  HTTP: HTTP,
  OnFire: OnFire,
  Notify: Notify,
  globalData: {
    isAuth: false,
    apiToken: null,
    userInfo: null,
    wechatUserInfo: null,
  },

  /**
   * onLaunch
   */
  onLaunch() {
    let _this = this;

    // 订阅 Notify
    this.OnFire.on('notify', function(options) {
      _this.Notify(options);
    });

    // 恢复用户及登录状态
    setTimeout(function () {
      AUTH.restoreLogin(_this).then(function(result) {
        _this.showNotify(result.data.nickname + ', 欢迎回来', 'primary');
      }).catch(function(res) {
        wx.login({
          success: function(res) {
            _this.HTTP.GET('users/login', {code: res.code}).then(function(result) {
              console.debug('未登录用户在后台进行注册，获取 apiToken => ' + result.data.token);
              _this.globalData.apiToken = result.data.token;
            });
          },
        });
      }).finally(function() {
        if (_this.authInitedCallback) _this.authInitedCallback();
      });
    }, 300)
  },

  /**
   * ShowNotify
   */
  showNotify(message, type) {
    let _this = this;
    if (type === undefined) type = 'success';

    setTimeout(function() {
      _this.Notify({
        message: message,
        type: type,
      });
    }, 100);
  },

  /**
   * 如果 isAuth = false, 则打开登录页面
   */
  needAuth() {
    if (this.globalData.isAuth) {
      return false;
    } else {
      wx.navigateTo({url: '/pages/users/auth/index'});
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
            wx.switchTab({url: '/pages/messages/index/index'});
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
      'pages/messages/index/index',
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
    if (forceReset === undefined) forceReset = true;

    if (this.globalData.userInfo.unread_notice_num) {
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      let currentPageUrl = currentPage.route;

      if (forceReset || currentPageUrl !== 'pages/messages/index/index') {
        let noticeTabBadgeText = String(this.globalData.userInfo.unread_notice_num);

        wx.setTabBarBadge({
          index: 1,
          text: noticeTabBadgeText,
        });

        console.debug('resetNoticeTabBarBadge: unread_notice_num => ' + this.globalData.userInfo.unread_notice_num);
      } else {
        this.OnFire.fire('noticeRefresh');

        console.debug('resetNoticeTabBarBadge: noticeRefresh');
      }
    } else {
      wx.removeTabBarBadge({index: 1});
    }
  },
})
