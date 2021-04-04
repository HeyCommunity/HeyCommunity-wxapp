Page({
  data: {
    userInfo: null,
  },

  /**
   * onLoad
   */
  onLoad() {
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({userInfo: getApp().globalData.userInfo});
  },

  /**
   * goto WebPage
   */
  gotoWebPage(event) {
    let webPageUrl = event.currentTarget.dataset.link;

    wx.navigateTo({url: '/pages/web-page/index?webPageUrl=' + webPageUrl});
  },

  /**
   * needAuth
   */
  needAuth() {
    getApp().needAuth();
  },
});
