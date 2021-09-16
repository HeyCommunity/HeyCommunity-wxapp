const {apiDomain} = require('../../../utils/env.js');
const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    defaultUserCoverImagePath: apiDomain + '/images/users/default-cover.jpg',

    userInfo: null,
  },

  /**
   * onLoad
   */
  onLoad() {
    this.setData({userInfo: APP.globalData.userInfo});
  },

  /**
   * onShow
   */
  onShow() {
    this.getUserInfo();
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    let _this = this;

    APP.HTTP.GET('users/mine').then(function(result) {
      _this.setData({userInfo: result.data});
    });
  },
});
