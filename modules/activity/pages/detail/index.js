const APP = getApp();
const MODEL = require('../../../../libraries/model.js');
const THUMB = require('../../../common/thumb/index.js');

Page({
  data: {
    entityClass: 'Modules\\Activity\\Entities\\Activity',
    modelId: null,
    model: null,

    tabType: 'detail',
    registrationConfirmModalVisible: false,

    // 评论模态框
    commentTextareaFocus: false,
    commentModalVisible: false,
    commentModalContent: null,
    commentModalType: null,
    commentModalEntityType: null,
    commentModalEntityId: null,
    commentModalCommentIndex: null,
    commentModalCommentId: null,
  },

  /**
   * onLoad
   */
  onLoad(options) {
    this.setData({modelId: options.id});

    wx.showLoading({title: '加载中'});
    this.getModelData().finally(function() {
      wx.hideLoading();
    });
  },

  /**
   * onShow
   */
  onShow() {
    this.getModelData();
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
   * 显示报名确认模块框
   */
  showRegistrationConfirmModal() {
    if (getApp().needAuth()) return;

    this.setData({registrationConfirmModalVisible: true});
  },

  /**
   * 隐藏报名确认模块框
   */
  hideRegistrationConfirmModal() {
    this.setData({registrationConfirmModalVisible: false});
  },

  /**
   * 活动报名处理
   */
  registerHandler() {
    if (getApp().needAuth()) return;

    let _this = this;
    let requestUrl = 'activities/' + this.data.model.id + '/register';

    this.hideRegistrationConfirmModal();

    wx.showLoading({title: '报名中'});
    APP.REQUEST.POST(requestUrl).then(function(result) {
      _this.setData({model: result.data});
      wx.showModal({
        title: '提示',
        content: '活动报名成功',
        showCancel: false,
      });
    }).catch(function(res) {
      wx.showModal({
        title: '报名失败',
        content: res.data.message ? res.data.message : '未知错误，请稍后重试',
        showCancel: false,
      });
    }).finally(function() {
      wx.hideLoading();
    });
  },

  /**
   * 预览图片
   */
  previewImage(event) {
    let image = event.currentTarget.dataset.image;
    let images = event.currentTarget.dataset.images;

    wx.previewImage({
      urls: images,
      current: image,
    });
  },

  /**
   * Tab 切换处理
   */
  tabSelectHandler(event) {
    this.setData({tabType: event.currentTarget.dataset.type});
  },

  /**
   * 进入用户主页
   */
  gotoUserDetailPage(event) {
    let userId = event.currentTarget.dataset.id;

    wx.navigateTo({url: '/pages/users/detail/index?id=' + userId});
  },

  /**
   * 打开地图
   */
  openMap() {
    let latitude = Number(this.data.model.latitude);
    let longitude = Number(this.data.model.longitude);

    wx.openLocation({
      name: this.data.model.address_name,
      address: this.data.model.address_full,
      latitude,
      longitude,
      scale: 13
    })
  },

  /**
   * 获取模型数据
   */
  getModelData() {
    let config = {
      apiPath: 'activities/' + this.data.modelId,
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
    wx.showLoading({title: '加载中'});
    this.getModelData().finally(function() {
      wx.hideLoading();
    });
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: '活动: ' + this.data.model.title,
      imageUrl: this.data.model.cover,
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '活动: ' + this.data.model.title,
      imageUrl: this.data.model.cover,
    };
  },
});
