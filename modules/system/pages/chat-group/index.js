Page({
  data: {
  },

  /**
   * onLoad
   */
  onLoad() {
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: '产品交流群 - ' + APP.globalData.wxappName,
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '产品交流群 - ' + APP.globalData.wxappName,
    };
  },
});
