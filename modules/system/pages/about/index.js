const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    about: null,
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    this.setData({appGlobalData: APP.globalData});

    wx.showLoading({title: '加载中'});
    APP.REQUEST.GET('system/about').then(function(result) {
      _this.setData({
        about: result.data,
      });

      wx.setNavigationBarTitle({title: result.data.title});
    }).finally(function() {
      wx.hideLoading();
    });
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: '关于 - ' + APP.globalData.wxappName,
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '关于 - ' + APP.globalData.wxappName,
    };
  },
});
