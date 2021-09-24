const APP = getApp();

Page({
  data: {
    about: null,
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    wx.showLoading({title: '加载中'});

    APP.HTTP.GET('system/about').then(function(result) {
      _this.setData({
        about: result.data,
      });

      wx.setNavigationBarTitle({title: result.data.title});
    }).finally(function() {
      wx.hideLoading();
    });
  },
});
