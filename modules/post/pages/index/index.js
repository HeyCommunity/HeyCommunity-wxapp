const APP = getApp();
const MODEL = require('../../../../libraries/model.js');

Page({
  data: {
    appGlobalData: null,
    posts: [],

    entityClass: 'Modules\\Post\\Entities\\Post',
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    MODEL.init({
      apiPath: 'posts',
      dataKeyName: 'posts',
      pageThis: this,
    });

    MODEL.getFirstPageModels();
    APP.authInitedCallback = function() {
      _this.setData({appGlobalData: APP.globalData});
      MODEL.getFirstPageModels();
    };

    // 订阅创建页面的 newPost 事件，把新创建的动态添加到动态列表中
    APP.OnFire.on('newPost', function(post) {
      _this.data.posts.unshift(post);
      _this.setData({posts: _this.data.posts});
    });
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});
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
   * goto 页面
   */
  gotoPage(event) {
    let url = event.currentTarget.dataset.url;

    wx.navigateTo({url: url});
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    MODEL.getFirstPageModels().finally(function() {
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
      title: this.data.appGlobalData.wxappName + '动态列表',
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    let imageUrl = null;

    return {
      title: this.data.appGlobalData.wxappName + '动态列表',
    };
  },
});
