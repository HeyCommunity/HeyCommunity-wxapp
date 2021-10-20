const APP = getApp();
const MODEL = require('../../../utils/model.js');

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

    // 获取动态
    setTimeout(function() {
      _this.setData({appGlobalData: APP.globalData});

      MODEL.getFirstPageModels();
    }, 2000);
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
