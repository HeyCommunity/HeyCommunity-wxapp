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
    } else {
      _this.setData({notices: []});
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

  /**
   * 删除通知
   */
  noticeDelete(event) {
    let _this = this;
    let noticeId = event.currentTarget.dataset.id;
    let noticeIndex = event.currentTarget.dataset.index;

    APP.HTTP.POST('notices/delete', {id: noticeId}).then(function() {
      _this.data.notices.splice(noticeIndex, 1);
      _this.setData({notices: _this.data.notices});
    });
  },

  /**
   * 通知设为已读
   */
  noticeSetIsRead(event) {
    let _this = this;
    let noticeId = event.currentTarget.dataset.id;
    let noticeIndex = event.currentTarget.dataset.index;

    APP.HTTP.POST('notices/set-isread', {id: noticeId}).then(function(result) {
      _this.data.notices[noticeIndex] = result.data;
      _this.setData({notices: _this.data.notices});
    });
  },

  /**
   * 通知设为未读
   */
  noticeSetUnRead(event) {
    let _this = this;
    let noticeId = event.currentTarget.dataset.id;
    let noticeIndex = event.currentTarget.dataset.index;

    APP.HTTP.POST('notices/set-unread', {id: noticeId}).then(function(result) {
      _this.data.notices[noticeIndex] = result.data;
      _this.setData({notices: _this.data.notices});
    });
  },

  /**
   * messageMove 开始
   */
  messageTouchStart(e) {
    this.setData({MessageTouchStart: e.touches[0].pageX})
  },

  /**
   * messageMove 计算方向
   */
  messageTouchMove(e) {
    if (e.touches[0].pageX - this.data.MessageTouchStart > 60) this.setData({MessageTouchDirection: 'right'});
    if (e.touches[0].pageX - this.data.MessageTouchStart < -60) this.setData({MessageTouchDirection: 'left'});

    // console.debug('touchmove', e.touches[0].pageX - this.data.MessageTouchStart, this.data.MessageTouchDirection);
    // console.debug('touchmove', e.touches[0].pageX, this.data.MessageTouchStart);
  },

  /**
   * messageMove 计算滚动
   */
  messageTouchEnd(e) {
    if (this.data.MessageTouchDirection == 'left')  {
      this.setData({messageTouchClass: e.currentTarget.dataset.target});
    } else {
      this.setData({messageTouchClass: null});
    }

    this.setData({MessageTouchDirection: null})
  },
});
