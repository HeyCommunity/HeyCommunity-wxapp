const HTTP = require('../../../utils/http.js');
const {apiDomain} = require('../../../utils/env.js');
const APP = getApp();

Page({
  data: {
    userCoverImagePath: apiDomain + '/images/users/default-cover.jpg',
    userInfo: null,

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
    this.setData({userInfo: getApp().globalData.userInfo});

    if (this.data.userInfo) {
      this.refreshUserInfo();
    }
  },

  /**
   * reset UserInfo
   */
  refreshUserInfo() {
    let _this = this;

    HTTP.httpGet('users/mine', {}, function(data) {
      APP.globalData.userInfo = data;
      _this.setData({userInfo: data});
    });
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
    getApp().needAuth();
  },

  /**
   * logoutHandler
   */
  logoutHandler() {
    let _this = this;

    wx.showLoading();

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
      _this.setData({userInfo: null});
      wx.hideLoading();
    });
  }
});
