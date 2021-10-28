const APP = getApp();

Page({
  data: {
    appGlobalData: null,
  },

  /**
   * onLoad
   */
  onLoad() {
    this.setData({appGlobalData: APP.globalData});
  },
});
