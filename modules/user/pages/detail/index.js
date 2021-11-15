const APP = getApp();
const MODEL = require('../../../../libraries/model.js');
const ENV = require('../../../../libraries/env.js');

Page({
  data: {
    appGlobalData: null,
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

    MODEL.init({
      apiPath: 'posts/user-posts?user_id=' + this.data.userId,
      dataKeyName: 'posts',
      pageThis: this,
    });
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
   * 监听 Post 数据更新事件
   */
  listenUpdatePostDataEvent(event) {
    let post = event.detail.post;
    let postIndex = event.detail.postIndex;
    let dataKeyName = 'posts[' + postIndex + ']';

    this.setData({[dataKeyName]: post});
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
    let title = this.data.userInfo.nickname + '的' + this.data.appGlobalData.wxappName + '主页';
    if (this.data.userInfo.bio) title = this.data.userInfo.nickname + ': ' + this.data.userInfo.bio;

    return {
      title: title,
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    let title = this.data.userInfo.nickname + '的' + this.data.appGlobalData.wxappName + '主页';

    return {
      title: title,
      imageUrl: this.data.userInfo.avatar,
    };
  },
});
