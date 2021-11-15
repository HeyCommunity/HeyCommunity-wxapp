const APP = getApp();
const PAGINATION = require('../../../../libraries/pagination.js');

Page({
  pagination: null,
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

    this.pagination = new PAGINATION({
      apiPath: 'posts',
      dataKeyName: 'posts',
      pageThis: this,
    });

    this.pagination.getFirstPageData();

    APP.authInitedCallback = function() {
      _this.setData({appGlobalData: APP.globalData});
      _this.pagination.getFirstPageData();
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
   * 监听 post 数据更新事件
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
    this.pagination.getFirstPageData().finally(function() {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 下拉加载更多
   */
  onReachBottom() {
    this.pagination.getNextPageData();
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: this.data.appGlobalData.wxappName + ': ' + this.data.appGlobalData.wxappSlogan,
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: this.data.appGlobalData.wxappName + ': ' + this.data.appGlobalData.wxappSlogan,
    };
  },
});
