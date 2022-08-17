const APP = getApp();
const PAGINATION = require('../../../../libraries/pagination.js');

Page({
  pagination: null,
  data: {
    appGlobalData: null,
    sectionHeaderElem: null,
    sectionContentElem: null,

    banners: [
      {id: 1, imagePath: APP.ENV.apiDomain + '/images/wxapp/banners/1.png', url: null},
      {id: 2, imagePath: APP.ENV.apiDomain + '/images/wxapp/banners/2.png', url: null},
      {id: 3, imagePath: APP.ENV.apiDomain + '/images/wxapp/banners/3.png', url: null},
    ],
    feeds: [],
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    this.pagination = new PAGINATION({
      apiPath: 'feeds',
      dataKeyName: 'feeds',
      pageThis: this,
    });

    APP.getSystemSettingsSuccessCallback = function() {
      _this.setData({appGlobalData: APP.globalData});
      wx.setNavigationBarTitle({title: APP.globalData.wxappName});
    }

    APP.authInitedCallback = function() {
      _this.setData({appGlobalData: APP.globalData});

      _this.pagination.getFirstPageData();
    };
  },

  /**
   * onReady
   */
  onReady() {
    this.setData({
      sectionHeaderElem: () => wx.createSelectorQuery().select('#section-header'),
      sectionContentElem: () => wx.createSelectorQuery().select('#section-content'),
    });
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});
  },

  /**
   * goto 页面
   */
  gotoPage(event) {
    let url = event.currentTarget.dataset.url;

    wx.navigateTo({url: url});
  },

  /**
   * 切换 Tab
   */
  switchTab(event) {
    console.log(event);
    wx.switchTab({
      url: event.currentTarget.dataset.url,
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.pagination.getFirstPageData().finally(function() {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 下拉加载更多
   */
  onReachBottom() {
    this.pagination.getNextPageData();
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: APP.globalData.wxappName + ': ' + APP.globalData.wxappSlogan,
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: APP.globalData.wxappName + ': ' + APP.globalData.wxappSlogan,
    };
  },
});
