const APP = getApp();

Page({
  data: {
    skeletonVisible: true,
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
    this.getPostData();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getPostData().finally(function() {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 获取 post
   */
  getPostData() {
    let _this = this;

    return new Promise(function(resolve, reject) {
      // 获取动态
      APP.HTTP.GET('posts/' + _this.data.postId).then(function(result) {
        _this.setData({models: [result.data]});
        _this.setData({skeletonVisible: false});

        resolve(result);
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

        reject(res);
      });
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
