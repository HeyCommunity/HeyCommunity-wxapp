const APP = getApp();
const MODEL = require('../../../../utils/model-old.js');
const THUMB = require('../../../../components/common/thumb/script/index.js');

Page({
  data: {
    // TODO: model => post
    model: null,

    tabType: 'comment',
    entityClass: 'Modules\\Post\\Entities\\Post',
  },

  /**
   * onLoad
   */
  onLoad(options) {
    this.setData({modelId: options.id});

    wx.showLoading({title: '加载中'});
    MODEL.getModel(this, 'posts/' + this.data.modelId, {}, {showRequestFailModal: false}).catch(function(res) {
      if (APP.REQUEST.wxRequestIsOk(res)) {
        wx.showModal({
          title: '提示',
          content: '内容不存在或已被删除',
          showCancel: false,
          complete() {
            wx.switchTab({url: '../index/index'});
          }
        });
      } else {
        APP.REQUEST.showRequestFailModal(res);
      }
    }).finally(function() {
      wx.hideLoading();
    });
  },

  /**
   * onShow
   */
  onShow() {
    MODEL.getModel(this, 'posts/' + this.data.modelId, {}, {showRequestFailModal: false});
  },

  /**
   * Tab 切换处理
   */
  tabSelectHandler(event) {
    this.setData({tabType: event.currentTarget.dataset.type});
  },

  /**
   * 点赞处理
   */
  thumbHandler(event) {
    if (getApp().needAuth()) return;

    let _this = this;

    THUMB.thumbHandler(event, this.data.model).then(function() {
      _this.setData({model: _this.data.model});
    });
  },

  /**
   * 显示动态评论模态框
   */
  showPostCommentFormModal(event) {
    let post = this.data.model;
    let entityClass = this.data.entityClass;

    this.selectComponent('#comp-comment-form-modal').showCommentModal({
      entity: post,
      entityClass: entityClass,
    });
  },

  /**
   * 评论成功处理
   */
  commentSuccessfulHandler: function (event) {
    this.setData({model: event.detail.entity});

    // TODO: 订阅微信消息通知
  },

  /**
   * 显示动态评论回复模态框
   */
  showReplyCommentFormModal(event) {
    console.log('call showReplyCommentFormModal', event);

    let post = this.data.model;
    let entityClass = this.data.entityClass;
    let commentIndex = event.detail.commentIndex;
    let targetUserNickname = event.detail.targetUserNickname;

    this.selectComponent('#comp-comment-form-modal').showCommentModal({
      entity: post,
      entityClass: entityClass,
      commentIndex: commentIndex,
      targetUserNickname: targetUserNickname,
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    wx.showLoading({title: '加载中'});
    MODEL.getModel(this, 'posts/' + this.data.modelId).finally(function() {
      wx.hideLoading();
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: this.data.post.user_nickname + '发布的动态',
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    let imageUrl = null;
    if (this.data.post.images.length) imageUrl = this.data.post.images[0].file_path;

    return {
      title: this.data.post.user_nickname + '发布的动态',
      imageUrl: imageUrl,
    };
  },
});
