const APP = getApp();
const MODEL = require('../../../../utils/model-old.js');

Page({
  data: {
    appGlobalData: null,
    models: [],
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    MODEL.init(_this, 'posts');

    // 延后 1 秒，以便 app.js 中获取 token 后再请求动态
    setTimeout(function() {
      _this.setData({appGlobalData: APP.globalData});

      MODEL.getFirstPageModels();
    }, 1000);
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});
    MODEL.getFirstPageModels();
  },

  /**
   * goto 页面
   */
  gotoPage(event) {
    let url = event.currentTarget.dataset.url;

    wx.navigateTo({url: url});
  },

  /**
   * 显示 评论模态框
   */
  showCommentModal(event) {
    this.selectComponent('#comp-comment-modal').showCommentModal({
      entity: event.detail.post,
      entityIndex: event.detail.postIndex,
    });
  },

  /**
   * 隐藏评论模态框
   */
  hideCommentModal() {
    wx.showModal({content: 'call hideCommentModal'});
  },

  /**
   * 点赞处理
   */
  thumbUpHandler() {
    wx.showModal({content: 'call thumbUpHandler'});
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
