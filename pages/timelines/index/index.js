const HTTP = require('../../../utils/http.js');

Page({
  data: {
    timelines: [],
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    // 获取动态
    HTTP.httpGet('timelines', {}, function(data) {
      _this.setData({timelines: data});
    });
  },

  /**
   * goto 发布动态页面
   */
  gotoCreatePage() {
    wx.navigateTo({url: '/pages/timelines/create/index'});
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;
    _this.setData({timelines: []});

    // 获取动态
    HTTP.httpGet('timelines', {}, function(data) {
      _this.setData({timelines: data});
      wx.stopPullDownRefresh();
    });
  },
});
