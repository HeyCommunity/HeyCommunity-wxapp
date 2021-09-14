const {apiDomain} = require('../../../utils/env.js');
const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    defaultUserCoverImagePath: apiDomain + '/images/users/default-cover.jpg',
    defaultProfileWaveImagePath: apiDomain + '/images/users/profile-wave.gif',

    userId: null,
    userInfo: null,
  },

  /**
   * onLoad
   */
  onLoad(options) {
    let _this = this;

    _this.setData({userId: options.id});
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});
    this.getUserInfo();
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    let _this = this;

    APP.HTTP.GET('users/' + _this.data.userId).then(function(result) {
      _this.setData({userInfo: result.data});

      wx.setNavigationBarTitle({
        title: result.data.nickname,
      });
    });
  },
});
