const APP = getApp();
const MODEL = require('../../../utils/model-old.js');
const THUMB = require('../../../components/common/thumb/script/index.js');

Page({
  data: {
    model: null,

    tabType: 'comment',
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
            wx.switchTab({url: '/pages/posts/index/index'});
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
   * 进入用户主页
   */
  gotoUserDetailPage(event) {
    let userId = event.currentTarget.dataset.id;

    wx.navigateTo({url: '/pages/users/detail/index?id=' + userId});
  },

  /**
   * Tab 切换处理
   */
  tabSelectHandler(event) {
    this.setData({tabType: event.currentTarget.dataset.type});
  },

  /**
   * 显示动态 ActionSheet
   */
  showPostActionSheet() {
    wx.showModal({content: 'call showPostActionSheet'});
  },

  /**
   * 显示评论 ActionSheet
   */
  showCommentActionSheet() {
    wx.showModal({content: 'call showCommentActionSheet'});
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
   * 打开评论弹出层
   */
  showCommentModal(event) {
    this.selectComponent('#comp-comment-modal').showCommentModal(event);
  },

  /**
   * 更新 Post 数据
   */
  updatePostDataHandler: function (event) {
    this.setData({model: event.detail.entity});
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
   * 评论成功处理
   */
  commentSuccessfulHandler: function (event) {
    this.setData({model: event.detail.entity});

    // TODO: 订阅微信消息通知
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
