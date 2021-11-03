Page({
  data: {
    webPageUrl: null,
  },

  /**
   * onLoad
   */
  onLoad(options) {
    this.setData({
      webPageUrl: options.webPageUrl,
    });
  },
});
