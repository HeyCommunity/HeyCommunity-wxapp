const {apiDomain} = require('../../../utils/env.js');
const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    defaultUserCoverImagePath: apiDomain + '/images/users/default-cover.jpg',
    defaultProfileWaveImagePath: apiDomain + '/images/users/profile-wave.gif',

    wxAppAccountInfo: null,
  },

  /**
   * onLoad
   */
  onLoad() {
    this.setData({wxAppAccountInfo: wx.getAccountInfoSync()});
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});
    this.refreshUserInfo();
  },

  /**
   * reset UserInfo
   */
  refreshUserInfo() {
    let _this = this;

    if (APP.globalData.isAuth) {
      APP.HTTP.GET('users/mine').then(function(result) {
        APP.globalData.userInfo = result.data;
        _this.setData({appGlobalData: APP.globalData});

        APP.resetTabBarBadge();
      });
    }
  },

  /**
   * goto 用户主页
   */
  gotoUserDetailPage() {
    if (! APP.needAuth()) {
      let userId = this.data.appGlobalData.userInfo.id;
      wx.navigateTo({url: '/pages/users/detail/index?id=' + userId});
    }
  },

  /**
   * needAuth
   */
  needAuth() {
    APP.needAuth();
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
