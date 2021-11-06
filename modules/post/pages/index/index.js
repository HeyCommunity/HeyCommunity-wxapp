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

    APP.authInitedCallback = function() {
      _this.setData({appGlobalData: APP.globalData});
      MODEL.getFirstPageModels();
    };

    // 订阅创建页面的 newPost 事件，把新创建的动态添加到动态列表中
    APP.OnFire.on('newPost', function(post) {
      _this.data.models.unshift(post);
      _this.setData({models: _this.data.models});
    });
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});
    // MODEL.getFirstPageModels();
  },

  /**
   * 更新 Post 处理
   */
  updatePostDataHandler(event) {
    let postIndex = event.detail.postIndex;
    let postKey = 'models[' + postIndex + ']';
    let post = event.detail.post;

    this.setData({[postKey]: post});
  },

  /**
   * 更新 PostComments 处理
   */
  updatePostCommentsDataHandler(event) {
    let postIndex = event.detail.entityIndex;
    let postKey = 'models[' + postIndex + ']';
    let post = this.data.models[postIndex];
    post.comments = event.detail.comments;

    this.setData({[postKey]: post});
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
   * 显示动态评论模态框
   */
  showPostCommentFormModal(event) {
    console.log('call showPostCommentFormModal', event);

    let postIndex = event.detail.postIndex;
    let post = this.data.models[postIndex];
    let entityClass = this.data.entityClass;

    this.selectComponent('#comp-comment-form-modal').showCommentModal({
      entity: post,
      entityIndex: postIndex,
      entityClass: entityClass,
    });
  },

  /**
   * 显示动态评论回复模态框
   */
  showReplyCommentFormModal(event) {
    console.log('call showReplyCommentFormModal', event);

    let postIndex = event.detail.entityIndex;
    let post = this.data.models[postIndex];
    let entityClass = this.data.entityClass;
    let commentIndex = event.detail.commentIndex;
    let targetUserNickname = event.detail.targetUserNickname;

    this.selectComponent('#comp-comment-form-modal').showCommentModal({
      entity: post,
      entityIndex: postIndex,
      entityClass: entityClass,
      commentIndex: commentIndex,
      targetUserNickname: targetUserNickname,
    });
  },

  /**
   * 评论成功处理
   */
  commentSuccessfulHandler(event) {
    console.log('commentSuccessfulHandler event:', event);

    let post = event.detail.entity;
    let postIndex = event.detail.entityIndex;

    let postKey = 'models[' + postIndex + ']';
    this.setData({[postKey]: post});
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
