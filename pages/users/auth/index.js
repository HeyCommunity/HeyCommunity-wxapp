const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    canUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
    canGetUserProfile: wx.getUserProfile ? true : false,
  },

  /**
   * onLoad
   */
  onLoad() {
    APP.Notify({type: 'primary', message: '请登录'});

    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});
  },

  /**
   * GetUserProfile handler
   */
  getUserProfileHandler() {
    let _this = this;

    wx.getUserProfile({
      lang: 'zh_CN',
      desc: '登录小程序',
      success: function(res) {
        let wechatUserInfo = res.userInfo;
        _this.userLoginHandler(wechatUserInfo);
      },
      fail: function(res) {
        wx.showModal({
          title: '登录失败',
          content: '未能获取到用户信息',
          showCancel: false,
        })
      }
    });
  },

  /**
   * GetUserInfo handler
   */
  getUserInfoHandler(event) {
    let wechatUserInfo = event.detail.userInfo;

    if (wechatUserInfo) {
      this.userLoginHandler(wechatUserInfo);
    } else {
      wx.showModal({
        title: '登录失败',
        content: '未能获取到用户信息',
        showCancel: false,
      })
    }
  },

  /**
   * 用户登录处理
   */
  userLoginHandler(wechatUserInfo) {
    APP.globalData.wechatUserInfo = wechatUserInfo;
    APP.WXLog.addFilterMsg('AUTH');
    APP.WXLog.info('userLoginHandler', wechatUserInfo);

    wx.login({
      success: res => {
        wx.showLoading({title: '登录中'});

        // 通过 wx.login res.code 发送到后台, 从而完成用户的注册和登录
        APP.AUTH.userLogin(res.code).then(function(result) {
          wx.navigateBack({
            success(res) {
              APP.showNotify('登录成功');
              APP.resetTabBarBadge();
            }
          });

          // TODO: 不要自动更新用户资料，而是在我的页面让用户手动触发
          APP.AUTH.userUpdateInfo(wechatUserInfo);        // 登录成功后更新用户资料
        }).catch(function(res) {
          APP.WXLog.addFilterMsg('AUTH-ERR');

          if (APP.REQUEST.wxRequestIsOk(res)) {
            wx.showModal({
              icon: 'error',
              title: '登录失败',
              content: '发生错误，请稍后重试',
              showCancel: false,
            });

            APP.WXLog.warn('用户登录失败 => ', res.data);
          } else {
            APP.WXLog.error('用户登录失败 => ', res);
          }
        }).finally(function() {
          wx.hideLoading();
        });
      },
    });
  },
})
