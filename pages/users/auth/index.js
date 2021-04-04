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
  userLoginHandler() {
    wx.getUserProfile({
      desc: '登录小程序',
      success: (res) => {
        let wechatUserInfo = res.userInfo;
        getApp().globalData.wechatUserInfo = wechatUserInfo;

        wx.login({
          success: res => {
            // 通过 wx.login res.code 发送到后台, 从而完成用户的注册和登录
            AUTH.userLogin(res.code, function() {
              // 登录成功后更新用户资料；TODO: 不要自动更新用户资料，而是在我的页面让用户手动触发
              AUTH.userUpdateInfo(wechatUserInfo, function() {
                wx.navigateBack();
              });
            });
          },
        });
      }
    });
  },
})
