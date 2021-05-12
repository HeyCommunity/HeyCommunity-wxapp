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
   * goto Entity Page
   */
  gotoEntityPage(event) {
    let notice = event.currentTarget.dataset.notice;

    if (notice.wxapp_redirect_url) {
      wx.navigateTo({url: notice.wxapp_redirect_url});
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    if (APP.globalData.isAuth) {
      _this.getListData().finally(function() {
        wx.stopPullDownRefresh();
      });
    }
  },

  /**
   * 获取数据
   */
  getListData() {
    let _this = this;

    _this.messageMoveReset();

    return new Promise(function(resolve, reject) {
      APP.HTTP.GET('notices').then(function(result, res) {
        _this.setData({notices: result.data});

        APP.globalData.userInfo.unread_notice_num = result.meta.unread_notice_num;
        APP.resetTabBarBadge();

        resolve(result, res);
      }).catch(function(result, res) {
        reject(result, res);
      });
    });
  },

  /**
   * 通知操作处理
   *
   * delete
   * set-isread
   * set-unread
   */
  noticeActionHandler(event) {
    let _this = this;

    let action = event.currentTarget.dataset.action;
    let noticeId = event.currentTarget.dataset.id;
    let noticeIndex = event.currentTarget.dataset.index;
    let notice = _this.data.notices[noticeIndex];

    APP.HTTP.POST('notices/' + action, {id: noticeId}).then(function(result) {
      if (action === 'delete') {
        _this.data.notices.splice(noticeIndex, 1);
        _this.setData({notices: _this.data.notices});
      } else {
        _this.data.notices[noticeIndex] = result.data;
        _this.setData({notices: _this.data.notices});
      }

      if (notice.is_read) {
        if (action === 'set-unread') {
          APP.globalData.userInfo.unread_notice_num += 1;
        }
      } else {
        if (action === 'delete' || action === 'set-isread') {
          APP.globalData.userInfo.unread_notice_num -= 1;
        }
      }

      APP.resetTabBarBadge();
      _this.messageMoveReset();
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
    if (e.touches[0].pageX - this.data.MessageTouchStart > 20) this.setData({MessageTouchDirection: 'right'});
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
    } else if (this.data.MessageTouchDirection == 'right')  {
      this.setData({messageTouchClass: null});
    }

    this.setData({MessageTouchDirection: null})
  },

  /**
   * messageMove 重置成初始状态
   */
  messageMoveReset() {
    this.setData({messageTouchClass: null});
    this.setData({MessageTouchDirection: null})
  }
});
