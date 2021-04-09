const HTTP = require('../../../utils/http.js');

Page({
  data: {
    posts: [],
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    // 获取动态
    HTTP.httpGet('posts', {}, function(data) {
      _this.setData({posts: data});
    });
  },

  /**
   * goto 发布动态页面
   */
  gotoCreatePage() {
    wx.navigateTo({url: '/pages/posts/create/index'});
  },

  /**
   * 预览图片
   */
  previewImage(event) {
    wx.previewImage({
      urls: event.currentTarget.dataset.urls.map(image => image.file_path),
      current: event.currentTarget.dataset.url,
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    // 获取动态
    HTTP.httpGet('posts', {}, function(data) {
      _this.setData({posts: data});
      wx.stopPullDownRefresh();
    });
  },
});
