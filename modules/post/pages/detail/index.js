const APP = getApp();
const MODEL = require('../../../../libraries/model.js');
const THUMB = require('../../../common/thumb/index.js');

Page({
  data: {
    post: null,

    tabType: 'comment',
    entityClass: 'Modules\\Post\\Entities\\Post',
  },

  /**
   * onLoad
   */
  onLoad(options) {
    this.setData({postId: options.id});

    wx.showLoading({title: '加载中'});
    this.getPostData().finally(function() {
      wx.hideLoading();
    });
  },

  /**
   * onShow
   */
  onShow() {
    this.getPostData();
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
    let _this = this;

    let params = {
      entity_id: this.data.post.id,
      entity_class: this.data.entityClass,
      type: 'thumb_up',
      value: event.currentTarget.dataset.value,
    };

    THUMB.thumbHandler(params, this.data.post).then(function() {
      _this.setData({post: _this.data.post});
      _this.getPostData();
    });
  },


  /**
   * 显示评论模态框
   */
  showCommentFormModal() {
    let post = this.data.post;
    let entityClass = this.data.entityClass;

    this.selectComponent('#comp-comment-form-modal').showCommentModal({
      entity: post,
      entityClass: entityClass,
    });
  },

  /**
   * 监听 显示评论回复模态框 事件
   */
  listenShowReplyCommentFormModalEvent(event) {
    let post = this.data.post;
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
   * 监听 评论成功 事件
   */
  listenCommentSuccessfulEvent(event) {
    let post = event.detail.entity;

    this.setData({post: post});
  },

  /**
   * 监听 comments 数据更新事件
   */
  listenUpdateCommentsDataEvent(event) {
    let post = this.data.post;
    let comments = event.detail.comments;

    post.comments = comments;

    this.setData({post: post});
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    wx.showLoading({title: '加载中'});

    this.getPostData().finally(function() {
      wx.hideLoading();
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 获取 post 数据
   */
  getPostData() {
    let config = {
      apiPath: 'posts/' + this.data.postId,
      dataKeyName: 'post',
      pageThis: this,
    }

    return new Promise(function(resolve, reject) {
      MODEL.getModel(config, {}, {showRequestFailModal: false}).then(function(result) {
        resolve(result);
      }).catch(function(res) {
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

        reject(res);
      });
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
