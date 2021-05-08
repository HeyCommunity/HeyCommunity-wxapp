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

    // 恢复用户及登录状态
    AUTH.restoreLogin(this, function() {
      if (_this.userLoginedCallback) _this.userLoginedCallback();
    });

    // 订阅 Notify
    this.OnFire.on('notify', function(options) {
      _this.Notify(options);
    });
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
})
