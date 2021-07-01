const APP = getApp();

Page({
  data: {
    apiPath: 'posts',
    models: [],
    postId: null,
  },

  /**
   * onLoad
   */
  onLoad(options) {
    let _this = this;

    _this.setData({postId: options.id});
  },

  /**
   * onShow
   */
  onShow() {
    wx.startPullDownRefresh();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    // 获取动态
    APP.HTTP.GET('posts/' + _this.data.postId).then(function(result) {
      _this.setData({models: [result.data]});
    }).catch(function(res) {
      if (APP.HTTP.wxRequestIsOk(res)) {
        wx.showModal({
          title: '未找到动态',
          content: '动态不存在或已被删除',
          showCancel: false,
          complete(res) {
            wx.navigateBack();
          }
        });
      }
    }).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: this.data.models[0].user_nickname + '发布的动态',
    };
  },
});
