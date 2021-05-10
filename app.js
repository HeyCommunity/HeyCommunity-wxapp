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
        _this.makeNotify({type: 'success', message: result.data.nickname + ', 欢迎回来'});
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
   * Make Notify
   * 用于页面跳转显示 Notify
   */
  makeNotify(notify) {
    let _this = this;
    setTimeout(function() {
      _this.Notify(notify);
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
    console.debug('GotuserPingData', result);

    if (result.data && result.data.unread_notice_num) {
      this.globalData.userInfo.unread_notice_num = result.data.unread_notice_num;
    }

    this.resetTabBarBadge();
  },

  /**
   * Reset TabBar Badge
   */
  resetTabBarBadge() {
    // 设置通知 TabBarBadge
    if (this.globalData.isAuth && this.globalData.userInfo.unread_notice_num) {
      let noticeTabBadgeText = String(this.globalData.userInfo.unread_notice_num);

      wx.setTabBarBadge({
        index: 1,
        text: noticeTabBadgeText,
      })
    } else {
      wx.removeTabBarBadge({
        index: 1,
      });
    }
  },
})
