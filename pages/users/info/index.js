const {apiDomain} = require('../../../utils/env.js');
const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    defaultUserCoverImagePath: apiDomain + '/images/users/default-cover.jpg',

    userInfo: null,
    genderIndex: null,
    genderRange: ['保密', '男', '女'],
  },

  /**
   * onLoad
   */
  onLoad() {
    this.setData({userInfo: APP.globalData.userInfo});
  },

  /**
   * onShow
   */
  onShow() {
    this.getUserInfo();
  },

  /**
   * 性别选择器 change 处理
   */
  genderPickerChange(event) {
    let genderIndex = event.detail.value;
    this.setData({genderIndex: genderIndex});
  },

  /**
   * 更新我的资料
   */
  updateInfoHandler(event) {
    let data = event.detail.value;

    APP.HTTP.POST('users/mine-info', data).then(function(result) {
      wx.showToast({
        icon: 'success',
        title: '更新资料成功',
        mask: true,
        duration: 1500,
        complete(res) {
          setTimeout(function() {
            wx.navigateBack();
          }, 1500);
        },
      });
    }).catch(function(res) {
      let errorMessage = '未知错误';
      if (res.data.errors) errorMessage = res.data.errors[Object.keys(res.data.errors)[0]][0];

      wx.showModal({
        title: '更新资料失败',
        content: errorMessage,
        showCancel: false,
      });
    });
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    let _this = this;

    APP.HTTP.GET('users/mine').then(function(result) {
      _this.setData({userInfo: result.data});
    });
  },
});
