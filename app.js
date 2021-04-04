const AUTH = require('./utils/auth.js');

App({
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

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.wechatUserInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
  },

  /**
   * 如果 isAuth = false, 则打开登录页面
   */
  needAuth() {
    if (this.globalData.isAuth) {
      return true;
    } else {
      wx.navigateTo({url: '/pages/users/auth/index'});
      return false;
    }
  },
})
