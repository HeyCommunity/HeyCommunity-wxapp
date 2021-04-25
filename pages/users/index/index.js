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

    getApp().globalData.isAuth = false;
    getApp().globalData.userInfo = null;
    _this.setData({userInfo: null});
    wx.removeStorage({key: 'apiToken'});

    HTTP.httpPost('users/logout', {}, function() {
      wx.hideLoading();
      wx.showModal({
        title: '你已安全登出',
        showCancel: false,
      });
    }, function() {
      wx.hideLoading();
      wx.showModal({
        title: '你已退出登录',
        showCancel: false,
      });
    });
  }
});
