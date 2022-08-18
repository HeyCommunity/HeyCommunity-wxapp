const APP = getApp();
const PAGINATION = require('../../../../libraries/pagination.js');

Page({
  pagination: null,
  data: {
    appGlobalData: null,

    models: [],
    tabType: 'active',
  },

  /**
   * onLoad
   */
  onLoad() {
    this.pagination = new PAGINATION({
      apiPath: 'activities',
      dataKeyName: 'models',
      pageThis: this,
    });

    this.getModelsData();
  },

  /**
   * onShow
   */
  onShow() {
  },

  /**
   * Tab 切换处理
   */
  tabSelectHandler(event) {
    this.setData({tabType: event.currentTarget.dataset.type});
    this.getModelsData({type: this.data.tabType});
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.pagination.getFirstPageData({type: this.data.tabType}).finally(function() {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    this.pagination.getNextPageData();
  },

  /**
   * 获取 Models
   */
  getModelsData(params) {
    this.pagination.getFirstPageData(params);
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: '活动 - ' + APP.globalData.wxappName,
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '活动 - ' + APP.globalData.wxappName,
    };
  },
});
