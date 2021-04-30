const APP = getApp();

Page({
  data: {
    notices: [],
    visibleMessage: false,
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    _this.onPullDownRefresh();
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({visibleMessage: false});
  },

  /**
   * showFakeMessages
   */
  showFakeMessages() {
    this.setData({visibleMessage: true});
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    // 获取动态
    APP.HTTP.GET('notices').then(function(result) {
      _this.setData({notices: result.data});
    }).finally(() => {
      wx.stopPullDownRefresh();
    });
  },
});
