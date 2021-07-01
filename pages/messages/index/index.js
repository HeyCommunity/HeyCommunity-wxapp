const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    model: null,
    models: [],
    apiPath: 'notices',
    currentPage: 1,
    lastPage: null,
    refreshLoading: false,
    moreLoading: false,

    messageTouchClass: null,
  },

  /**
   * onLoad
   */
  onLoad() {
    APP.OnFire.on('noticeRefresh', function() {
      wx.startPullDownRefresh();
    });
  },

  /**
   * onShow
   */
  onShow() {
    let _this = this;

    _this.setData({appGlobalData: APP.globalData});

    wx.startPullDownRefresh();
  },

  /**
   * goto Entity Page
   */
  gotoEntityPage(event) {
    let _this = this;
    let notice = event.currentTarget.dataset.notice;
    let noticeId = notice.id;
    let noticeIndex = event.currentTarget.dataset.noticeIndex;
    let noticeClass = event.currentTarget.dataset.class;
    let messageTouchClass = _this.data.messageTouchClass;

    if (! messageTouchClass && notice.wxapp_redirect_url) {
      wx.navigateTo({
        url: notice.wxapp_redirect_url,
        success: function(res) {
          _this.sendNoticeActionHttpRequest('set-isread', notice, noticeId, noticeIndex)
        }
      });
    }

    _this.messageMoveReset();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    if (APP.globalData.isAuth) {
      wx.showLoading({title: '刷新中'});
      _this.getPageModels(1).finally(function() {
        wx.stopPullDownRefresh();
        wx.hideLoading();
      });
    } else {
      _this.setData({models: []});
      wx.stopPullDownRefresh();

      APP.Notify({
        message: '登录后才能查看消息 \n 点击这里进行登录',
        type: 'primary',
        duration: 6000,
        onClick: function() {
          wx.navigateTo({url: '/pages/users/auth/index'});
        },
      });
    }
  },

  /**
   * 下拉加载更多
   */
  onReachBottom() {
    let _this = this;

    if (this.data.currentPage >= this.data.lastPage) {
      wx.showToast({icon: 'none', title: '没有更多数据了'});
    } else {
      // wx.showLoading({title: '加载中'});
      this.setData({moreLoading: true});

      this.getPageModels(this.data.currentPage + 1).finally(function() {
        // wx.hideLoading();
        _this.setData({moreLoading: false});
      });
    }
  },

  /**
   * 获取 models
   */
  getPageModels(pageNum) {
    let _this = this;
    if (! pageNum) pageNum = _this.data.currentPage;

    _this.messageMoveReset();

    return new Promise(function(resolve, reject) {
      APP.HTTP.GET(_this.data.apiPath, {page: pageNum}).then(function(result, res) {
        if (result.meta.current_page === 1) _this.data.models = [];
        _this.data.models = _this.data.models.concat(result.data);
        _this.setData({models: _this.data.models});

        let beforeUnReadNoticeNum = APP.globalData.userInfo.unread_notice_num;
        let currentUnReadNoticeNum = result.meta.unread_notice_num;
        let newNoticeNum = currentUnReadNoticeNum - beforeUnReadNoticeNum;

        APP.globalData.userInfo.unread_notice_num = currentUnReadNoticeNum;
        APP.resetNoticeTabBarBadge(true);

        if (newNoticeNum > 0) {
          APP.Notify({
            message: newNoticeNum + ' 条新通知',
            type: 'primary',
            onClick: function() {
              wx.switchTab({url: '/pages/messages/index/index'});
            },
          });
        }

        _this.setData({
          currentPage: result.meta.current_page,
          lastPage: result.meta.last_page,
        });

        resolve(result, res);
      }).catch(function(result, res) {
        reject(result, res);
      });
    });
  },

  /**
   * 订阅动态通知处理
   */
  subscribePostMessagesHandler() {
    let _this = this;
    this.selectComponent('#dropdown-subscribe').toggle(false);

    if (APP.globalData.systemSettings
      && APP.globalData.systemSettings.wxapp_subscribe_message
      && APP.globalData.systemSettings.wxapp_subscribe_message.enable
    ) {
      wx.requestSubscribeMessage({
        tmplIds: [
          APP.globalData.systemSettings.wxapp_subscribe_message.thumb_up_temp_id,
          APP.globalData.systemSettings.wxapp_subscribe_message.comment_temp_id,
          APP.globalData.systemSettings.wxapp_subscribe_message.reply_temp_id,
        ],
        success: function(res) {
          APP.Notify({
            type: 'primary',
            message: '订阅已完成 \n 点击这里再次订阅',
            onClick: function() {
              _this.subscribePostMessagesHandler();
            },
          });
        },
      });
    } else {
      APP.showNotify('未启用微信订阅消息功能', 'danger');
    }
  },

  /**
   * 通知批量处理
   */
  batchNoticeActionHandler(event, disableConfirm) {
    let _this = this;
    let action = event.currentTarget.dataset.action;
    if (disableConfirm === undefined) disableConfirm = false;

    this.selectComponent('#dropdown-action').toggle(false);

    if (action === 'delete' && _this.data.models.length) {
      let confirmHandler = function() {
        let notice = _this.data.models[0];
        let noticeIndex = 0;

        _this.sendNoticeActionHttpRequest(action, notice, notice.id, noticeIndex).then(function() {
          _this.batchNoticeActionHandler(event, true);
        });
      }

      if (disableConfirm) {
        confirmHandler();
      } else {
        wx.showModal({
          title: '删除全部消息',
          content: '请确定是否要执行此操作？',
          success(res) {
            if (res.confirm) confirmHandler();
          },
        });
      }
    } else {
      this.data.models.forEach(function(notice, noticeIndex) {
        _this.sendNoticeActionHttpRequest(action, notice, notice.id, noticeIndex);
      });
    }
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
    let notice = _this.data.models[noticeIndex];

    _this.sendNoticeActionHttpRequest(action, notice, noticeId, noticeIndex);
  },

  /**
   * 发送通知 HTTP 请求
   */
  sendNoticeActionHttpRequest(action, notice, noticeId, noticeIndex) {
    let _this = this;

    _this.messageMoveReset();

    return new Promise(function(resolve, reject) {
      APP.HTTP.POST(_this.data.apiPath + '/' + action, {id: noticeId}).then(function(result) {
        if (action === 'delete') {
          _this.data.models.splice(noticeIndex, 1);
          _this.setData({models: _this.data.models});
        } else {
          _this.data.models[noticeIndex] = result.data;
          _this.setData({models: _this.data.models});
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

        APP.resetNoticeTabBarBadge(true);

        resolve(result);
      }).catch(function(res) {
        reject(res);
      });
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

    // console.debug('touchMove', this.data.messageTouchClass, e.touches[0].pageX - this.data.MessageTouchStart, this.data.MessageTouchDirection);
    // console.debug('touchMove', e.touches[0].pageX, this.data.MessageTouchStart);
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

    // console.debug('touchEnd', this.data.messageTouchClass, this.data.MessageTouchDirection);

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
