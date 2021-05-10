const APP = getApp();

Page({
  data: {
    canUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
    canGetUserProfile: wx.getUserProfile ? true : false,
  },

  /**
   * onLoad
   */
  onLoad() {
    APP.Notify({type: 'primary', message: '请先登录'});

    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
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

    wx.login({
      success: res => {
        wx.showLoading({title: '登录中'});

        // 通过 wx.login res.code 发送到后台, 从而完成用户的注册和登录
        APP.AUTH.userLogin(res.code).then(function() {
          // 登录成功后更新用户资料
          // TODO: 不要自动更新用户资料，而是在我的页面让用户手动触发
          APP.AUTH.userUpdateInfo(wechatUserInfo);

          wx.navigateBack({
            success(res) {
              APP.makeNotify({type: 'success', message: '登录成功'});
              APP.resetTabBarBadge();
            }
          });
        }).catch(function() {
          wx.showModal({
            icon: 'error',
            title: '登录失败',
            content: '发生未知错误，请稍后再试',
            showCancel: false,
          })
        }).finally(function() {
          wx.hideLoading();
        });
      },
    });
  },
})
