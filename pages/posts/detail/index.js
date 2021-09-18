const APP = getApp();

Page({
  data: {
    skeletonVisible: true,
    post: null,
    postId: null,

    tabType: 'comment',
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
   * Tab 切换处理
   */
  tabSelectHandler(event) {
    this.setData({tabType: event.currentTarget.dataset.type});
  },

  /**
   * 获取 post
   */
  getPostData() {
    let _this = this;

    return new Promise(function(resolve, reject) {
      // 获取动态
      APP.HTTP.GET('posts/' + _this.data.postId).then(function(result) {
        _this.setData({post: result.data});
        _this.setData({skeletonVisible: false});

        resolve(result);
      }).catch(function(res) {
        if (APP.HTTP.wxRequestIsOk(res)) {
          wx.showModal({
            title: '提示',
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
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getPostData().finally(function() {
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
