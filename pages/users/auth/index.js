const HTTP = require('../../../utils/http.js');
const AUTH = require('../../../utils/auth.js');

Page({
  data: {
    canUseUserOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
  },

  /**
   * onLoad
   */
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  /**
   * 用户登录处理
   */
  userLoginHandler(event) {
    getApp().globalData.wechatUserInfo = event.detail.userInfo;

    // 通过 wx.login res.code 到后台, 从而完成用户的注册和登录
    wx.login({
      success: res => {
        // 获取 token
        HTTP.httpGet('users/mine-token', {code: res.code}, function(data) {
          getApp().globalData.apiToken = data.token;
          console.info('got and set apiToken => ' + data.token);

          // 更新用户资料
          HTTP.httpPost('users/mine', event.detail.userInfo, function(data) {
            if (AUTH.userLogin(data)) {
              wx.navigateBack();
            }
          });
        });
      },
    });
  },
})
