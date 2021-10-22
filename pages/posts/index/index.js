const APP = getApp();
const MODEL = require('../../../utils/model.js');
const THUMB = require('../../../components/common/thumb/index.js');

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
  gotoPageByUrl(event) {
    let url = event.currentTarget.dataset.url;

    wx.navigateTo({url: url});
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
