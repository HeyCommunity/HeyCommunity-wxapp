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
        _this.makeNotify({type: 'success', message: '欢迎回来, ' + result.data.nickname});
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

    // TODO: 心跳连接
    // 每隔 1 分钟发起一次请求，以记录用户最后活跃时间，以及获取未读通知数
    setInterval(function() {
      _this.HTTP.GET('users/ping');
    }, 1000 * 60);
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
