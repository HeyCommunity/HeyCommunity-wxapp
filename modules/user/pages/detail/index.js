const APP = getApp();
const MODEL = require('../../../../utils/model-old.js');
const ENV = require('../../../../libraries/env.js');

Page({
  data: {
    appGlobalData: null,
    models: [],
    posts: [],

    userId: null,
    userInfo: null,
    defaultProfileWaveImagePath: ENV.apiDomain + '/images/users/profile-wave.gif',
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

    MODEL.init(this, 'posts/user-posts?user_id=' + this.data.userId);
    MODEL.getFirstPageModels();
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    let _this = this;

    APP.REQUEST.GET('users/' + _this.data.userId).then(function(result) {
      _this.setData({userInfo: result.data});

      wx.setNavigationBarTitle({
        title: result.data.nickname,
      });
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    wx.showLoading({title: '刷新中'});
    MODEL.getFirstPageModels().finally(function() {
      wx.hideLoading();
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 下拉加载更多
   */
  onReachBottom() {
    MODEL.getNextPageModels();
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: this.data.userInfo.nickname + '的主页',
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: this.data.userInfo.nickname + '的主页',
      imageUrl: this.data.userInfo.avatar,
    };
  },
});
