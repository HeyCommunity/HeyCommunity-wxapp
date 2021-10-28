const {apiDomain} = require('../../../utils/env.js');
const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    defaultUserCoverImagePath: apiDomain + '/images/users/default-cover.jpg',
    defaultProfileWaveImagePath: apiDomain + '/images/users/profile-wave.gif',
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    _this.setData({appGlobalData: APP.globalData});
    APP.authInitedCallback = function() {
      _this.setData({appGlobalData: APP.globalData});
    };
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});
    if (this.data.appGlobalData.isAuth) this.refreshUserInfo();
  },

  /**
   * 刷新用户信息
   */
  refreshUserInfo() {
    let _this = this;

    if (this.data.appGlobalData.isAuth) {
      APP.HTTP.GET('users/mine').then(function(result) {
        APP.globalData.userInfo = result.data;
        _this.setData({appGlobalData: APP.globalData});

        // TODO: 更新 NoticeTabBarBadge
        APP.resetTabBarBadge();
      }).catch(function() {
        APP.AUTH.userLogout();
        _this.setData({appGlobalData: APP.globalData});
      });
    }
  },

  /**
   * goto 用户登录页
   */
  gotoAuthPage() {
    wx.navigateTo({url: '/pages/users/auth/index'});
  },

  /**
   * logoutHandler
   */
  logoutHandler() {
    let _this = this;

    wx.showModal({
      title: '提示',
      content: '确认要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({title: '正在退出登录'});

          APP.AUTH.userLogout().then(function() {
            wx.showModal({
              title: '你已安全地退出登录',
              showCancel: false,
            });
          }).catch(function() {
            wx.showModal({
              title: '你已退出登录',
              showCancel: false,
            });
          }).finally(function() {
            _this.setData({appGlobalData: APP.globalData});
            wx.hideLoading();
          });
        }
      },
    });
  }
});
