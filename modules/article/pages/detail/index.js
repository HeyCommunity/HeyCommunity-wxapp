const APP = getApp();
const MODEL = require('../../../../libraries/model.js');
const THUMB = require('../../../common/thumb/index.js');

Page({
  data: {
    appGlobalData: null,
    tabType: 'comment',

    entityClass: 'Modules\\Article\\Entities\\Article',
    modelId: null,
    model: null,
  },

  /**
   * onLoad
   */
  onLoad(options) {
    this.setData({modelId: options.id});

    wx.showLoading({title: '加载中'});
    this.getModelData().finally(function() {
      wx.hideLoading()
    })
  },

  /**
   * 点赞处理
   */
  thumbHandler(event) {
    let _this = this;

    let params = {
      entity_id: this.data.modelId,
      entity_class: this.data.entityClass,
      type: 'thumb_up',
      value: event.currentTarget.dataset.value,
    };

    THUMB.thumbHandler(params, this.data.model).then(function() {
      _this.setData({model: _this.data.model});
      _this.getModelData();
    });
  },

  /**
   * 显示评论模态框
   */
  showCommentFormModal() {
    this.selectComponent('#comp-comment-form-modal').showCommentModal({
      entity: this.data.model,
      entityClass: this.data.entityClass,
    });
  },

  /**
   * 监听 显示评论回复模态框 事件
   */
  listenShowReplyCommentFormModalEvent(event) {
    let commentIndex = event.detail.commentIndex;
    let targetUserNickname = event.detail.targetUserNickname;

    this.selectComponent('#comp-comment-form-modal').showCommentModal({
      entity: this.data.model,
      entityClass: this.data.entityClass,
      commentIndex: commentIndex,
      targetUserNickname: targetUserNickname,
    });
  },

  /**
   * 监听 评论成功 事件
   */
  listenCommentSuccessfulEvent(event) {
    this.setData({model: event.detail.entity});
  },

  /**
   * 监听 comments 数据更新事件
   */
  listenUpdateCommentsDataEvent(event) {
    this.data.model.comments = event.detail.comments;

    this.setData({model: this.data.model});
  },

  /**
   * 获取模型数据
   */
  getModelData() {
    let config = {
      apiPath: 'articles/' + this.data.modelId,
      dataKeyName: 'model',
      pageThis: this,
    };

    return new Promise(function(resolve, reject) {
      MODEL.getModel(config).then(function(result) {
        resolve(result);
      }).catch(function(res) {
        reject(res);
      });
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getModelData().finally(function() {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 下拉加载更多
   */
  onReachBottom() {
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    let config = {
      title: this.data.model.title,
    };

    if (this.data.model.cover) config.imageUrl = this.data.model.cover;

    return config;
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    let config = {
      title: this.data.model.title,
    };

    if (this.data.model.cover) config.imageUrl = this.data.model.cover;

    return config;
  },
});
