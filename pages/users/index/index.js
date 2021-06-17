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
   * goto WebPage
   */
  gotoWebPage(event) {
    let webPageUrl = event.currentTarget.dataset.link;

    wx.navigateTo({url: '/pages/web-page/index?webPageUrl=' + webPageUrl});
  },

  /**
   * goto HeyCommunity 页面
   */
  gotoHeyCommunityPage() {
    wx.navigateTo({url: '/pages/users/hey-community/index'});
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

    wx.showLoading({title: '正在退出'});

    APP.AUTH.userLogout().then(function() {
      wx.showModal({
        title: '你已安全登出',
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
});
