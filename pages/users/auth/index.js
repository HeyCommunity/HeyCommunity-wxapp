const APP = getApp();

Page({
  data: {
    canUseUserOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
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
   * 用户登录处理
   */
  userLoginHandler() {
    wx.getUserProfile({
      lang: 'zh_CN',
      desc: '登录小程序',
      success: (res) => {
        let wechatUserInfo = res.userInfo;
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
      }
    });
  },
})
