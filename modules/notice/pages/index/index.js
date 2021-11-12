const APP = getApp();
const PAGINATION = require('../../../../libraries/pagination.js');

Page({
  pagination: null,
  data: {
    appGlobalData: null,
    notices: [],

    wxSubscribePostNoticeNum: 0,
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    this.pagination = new PAGINATION({
      apiPath: 'notices',
      dataKeyName: 'notices',
      pageThis: this,
    });

    APP.OnFire.on('noticeRefresh', function() {
      if (_this.data.appGlobalData.isAuth) wx.startPullDownRefresh();
    });

    _this.setData({appGlobalData: APP.globalData});
    APP.authInitedCallback = function() {
      _this.setData({appGlobalData: APP.globalData});
      if (_this.data.appGlobalData.isAuth) wx.startPullDownRefresh();
    };
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});

    if (this.data.appGlobalData.isAuth) {
      wx.startPullDownRefresh();
    } else {
      APP.Notify({type: 'primary', message: '登录后才能查看消息'});
    }
  },

  /**
   * goto 消息实体页面
   */
  gotoEntityPage(event) {
    let _this = this;
    let notice = event.currentTarget.dataset.notice;
    let noticeId = notice.id;
    let noticeIndex = event.currentTarget.dataset.noticeIndex;
    let noticeClass = event.currentTarget.dataset.class;
    let noticeTouchClass = _this.data.noticeTouchClass;

    if (! noticeTouchClass && notice.wxapp_redirect_url) {
      wx.navigateTo({
        url: notice.wxapp_redirect_url,
        success: function(res) {
          _this.sendNoticeActionHttpRequest('set-isread', notice, noticeId, noticeIndex)
        }
      });
    }

    _this.noticeTouchResetHandler();
  },

  /**
   * goto 用户详情页
   */
  gotoUserDetailPage(event) {
    let pageUrl = '/modules/user/pages/detail/index?id=' + event.currentTarget.dataset.userId;
    wx.navigateTo({url: pageUrl});
  },

  /**
   * 订阅动态通知处理
   *
   * TODO: 需求整理和优化
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
          if (res.errMsg === 'requestSubscribeMessage:ok') {
            // TODO: 实际查看用户订阅了哪几个模板
            _this.setData({wxSubscribePostNoticeNum: _this.data.wxSubscribePostNoticeNum + 1});
            APP.Notify({
              type: 'primary',
              message: '完成订阅 x ' + _this.data.wxSubscribePostNoticeNum + ' \n 点击这里再次订阅',
              onClick: function() {
                _this.subscribePostMessagesHandler();
              },
            });
          }
        },
        fail: function(res) {
          wx.showModal({
            title: '订阅动态通知失败',
            content: res.errMsg,
            showCancel: false,
          });
        }
      });
    } else {
      APP.Notify({message: '未启用微信订阅消息功能', type: 'danger'});
    }
  },

  /**
   * 通知批量处理
   *
   * TODO: 需要优化和整理
   */
  batchNoticeActionHandler(event, disableConfirm) {
    let _this = this;
    let action = event.currentTarget.dataset.action;
    if (disableConfirm === undefined) disableConfirm = false;

    this.selectComponent('#dropdown-action').toggle(false);

    if (action === 'delete' && _this.data.notices.length) {
      let confirmHandler = function() {
        let notice = _this.data.notices[0];
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
      this.data.notices.forEach(function(notice, noticeIndex) {
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
   *
   * TODO: 待整理和优化
   */
  noticeActionHandler(event) {
    let _this = this;

    let action = event.currentTarget.dataset.action;
    let noticeId = event.currentTarget.dataset.id;
    let noticeIndex = event.currentTarget.dataset.index;
    let notice = _this.data.notices[noticeIndex];

    _this.sendNoticeActionHttpRequest(action, notice, noticeId, noticeIndex);
  },

  /**
   * 发送通知 HTTP 请求
   *
   * TODO: 待整理和优化
   */
  sendNoticeActionHttpRequest(action, notice, noticeId, noticeIndex) {
    let _this = this;

    _this.noticeTouchResetHandler();

    return new Promise(function(resolve, reject) {
      APP.REQUEST.POST('notices/' + action, {id: noticeId}).then(function(result) {
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

        APP.resetNoticeBadgeAtTabBar(true);

        resolve(result);
      }).catch(function(res) {
        reject(res);
      });
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    if (this.data.appGlobalData.isAuth) {
      this.pagination.getFirstPageData().finally(function () {
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
      this.setData({notice: []});

      APP.Notify({type: 'primary', message: '登录后才能查看消息'});
    }
  },

  /**
   * 下拉加载更多
   */
  onReachBottom() {
    this.pagination.getNextPageData();
  },

  /**
   * noticeMove 开始
   */
  noticeTouchStartHandler(event) {
    this.setData({MessageTouchStart: event.touches[0].pageX})
  },

  /**
   * noticeMove 计算方向
   */
  noticeTouchMoveHandler(event) {
    if (event.touches[0].pageX - this.data.MessageTouchStart > 20) this.setData({noticeTouchDirection: 'right'});
    if (event.touches[0].pageX - this.data.MessageTouchStart < -60) this.setData({noticeTouchDirection: 'left'});

    // console.debug('touchMove', this.data.noticeTouchClass, event.touches[0].pageX - this.data.MessageTouchStart, this.data.noticeTouchDirection);
    // console.debug('touchMove', event.touches[0].pageX, this.data.MessageTouchStart);
  },

  /**
   * noticeMove 计算滚动
   */
  noticeTouchEndHandler(event) {
    if (this.data.noticeTouchDirection == 'left')  {
      this.setData({noticeTouchClass: event.currentTarget.dataset.target});
    } else if (this.data.noticeTouchDirection == 'right')  {
      this.setData({noticeTouchClass: null});
    }

    // console.debug('touchEnd', this.data.noticeTouchClass, this.data.noticeTouchDirection);

    this.setData({noticeTouchDirection: null})
  },

  /**
   * noticeMove 重置成初始状态
   */
  noticeTouchResetHandler() {
    this.setData({noticeTouchClass: null});
    this.setData({noticeTouchDirection: null})
  }
});
