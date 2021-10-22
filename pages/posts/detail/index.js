const APP = getApp();
const MODEL = require('../../../utils/model.js');
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
      if (APP.HTTP.wxRequestIsOk(res)) {
        wx.showModal({
          title: '提示',
          content: '内容不存在或已被删除',
          showCancel: false,
          complete(res) {
            wx.navigateBack();
          }
        });
      } else {
        APP.HTTP.showRequestFailModal(res);
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
   * 点赞处理
   */
  thumbHandler(event) {
    THUMB.thumbHandler(event, this);
  },

  /**
   * 打开评论弹出层
   */
  showCommentModal(event) {
    this.selectComponent('#comp-comment-modal').showCommentModal(this, event);
  },

  /**
   * 显示 ActionSheet
   */
  showPostActionSheet(event) {
    this.selectComponent('#comp-post-actionSheet').showPostActionSheet(this, event);
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    wx.showLoading({title: '加载中'});
    APP.MODEL.getModel(this, 'posts/' + this.data.modelId).finally(function() {
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
