Page({
  data: {
  },

  /**
   * onLoad
   */
  onLoad() {
  },

  /**
   * goto WebPage
   */
  gotoWebPage(event) {
    let webPageUrl = event.currentTarget.dataset.link;

    wx.navigateTo({url: '/pages/web-page/index?webPageUrl=' + webPageUrl});
  },
});
