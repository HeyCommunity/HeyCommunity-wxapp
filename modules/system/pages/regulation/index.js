const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    regulation: null,
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    this.setData({appGlobalData: APP.globalData});

    wx.showLoading({title: '加载中'});
    APP.REQUEST.GET('system/regulation').then(function(result) {
      _this.setData({
        regulation: result.data,
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
      title: APP.globalData.wxappName + '《社区准则》',
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: APP.globalData.wxappName + '《社区准则》',
    };
  },
});
