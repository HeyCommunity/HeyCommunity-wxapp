const ENV = require('../../../../libraries/env.js');
const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    defaultUserCoverImagePath: ENV.apiDomain + '/images/users/default-cover.jpg',

    userInfo: null,
    genderIndex: null,
    genderRange: ['保密', '男', '女'],
  },

  /**
   * onLoad
   */
  onLoad() {
    this.setData({userInfo: APP.globalData.userInfo});
    this.getUserInfo();
  },

  /**
   * onShow
   */
  onShow() {
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

    APP.REQUEST.POST('users/mine', data, {requestFailModalTitle: '更新资料失败'}).then(function(result) {
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
    });
  },

  /**
   * 更新我的头像或封面
   */
  updateAvatarOrCoverHandler(event) {
    let _this = this;
    let type = event.currentTarget.dataset.type;
    let typeName = event.currentTarget.dataset.typeName;
    let apiPath = 'users/mine-' + type;

    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['camera', 'album'],
      success(res) {
        let tempFilePath = res.tempFilePaths[0];

        wx.showLoading({title: typeName + '上传中'});

        APP.REQUEST.uploadFile(apiPath, tempFilePath, {requestFailModalTitle: '更新' + typeName + '失败'}).then(function(result) {
          _this.setData({userInfo: result.data});
          wx.showToast({icon: 'success', title: typeName + '更新成功'});
        }).finally(function() {
          wx.hideLoading();
        });
      },
    });
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    let _this = this;

    APP.REQUEST.GET('users/mine').then(function(result) {
      _this.setData({userInfo: result.data});
    });
  },
});
