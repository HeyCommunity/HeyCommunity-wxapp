const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    notices: [],
  },

  /**
   * onShow
   */
  onShow() {
    let _this = this;

    _this.setData({appGlobalData: APP.globalData});

    if (APP.globalData.isAuth) {
      wx.startPullDownRefresh();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    if (APP.globalData.isAuth) {
      _this.getListData().then(function(result) {
        _this.setData({notices: result.data});
      }).finally(() => {
        wx.stopPullDownRefresh();
      });
    }
  },

  /**
   * 获取数据
   */
  getListData() {
    return new Promise(function(resolve, reject) {
      APP.HTTP.GET('notices').then(function(result, res) {
        resolve(result, res);
      }).catch(function(result, res) {
        reject(result, res);
      });
    });
  },
});
