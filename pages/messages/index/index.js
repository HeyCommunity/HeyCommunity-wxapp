Page({
  data: {
    visibleMessage: false,
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
    this.setData({visibleMessage: false});
  },

  /**
   * showFakeMessages
   */
  showFakeMessages() {
    this.setData({visibleMessage: true});
  },
});
