const HTTP = require('../../../utils/http.js');
const {apiDomain} = require('../../../utils/env.js');

Page({
  data: {
    userCoverImagePath: apiDomain + '/images/users/default-cover.jpg',
    userInfo: null,
  },

  /**
   * onLoad
   */
  onLoad() {
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({userInfo: getApp().globalData.userInfo});
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
   * logout
   */
  logout() {
    let _this = this;

    wx.showLoading();

    HTTP.httpPost('users/logout', {}, function() {
      getApp().globalData.isAuth = false;
      getApp().globalData.userInfo = null;
      _this.setData({userInfo: null});
      wx.removeStorage({key: 'apiToken'});

      wx.hideLoading();
      wx.showModal({
        title: '你已安全登出',
        showCancel: false,
      });
    }, function() {
      wx.hideLoading();
    });
  }
});
