/**
 * Variable
 */
const httpUtilPath = './http.js';

/**
 * 用户登录
  */
const userLogin = function(code, successCallback, failCallback) {
  let HTTP = require(httpUtilPath);
  let APP = getApp();

  // 获取 token
  HTTP.httpGet('users/login', {code: code}, function(data) {
    getApp().globalData.apiToken = data.token;
    getApp().globalData.isAuth = true;
    getApp().globalData.userInfo = data;

    // 写入 LocalStorage
    wx.setStorage({
      key: 'apiToken',
      data: getApp().globalData.apiToken,
    });

    console.debug('登录成功: ' + APP.globalData.userInfo.nickname + '(' + APP.globalData.userInfo.id + ')', APP.globalData.userInfo);
    if (successCallback) successCallback();
  }, function(res) {
    console.debug('登录失败', res);
    if (failCallback) failCallback(res);
  });

  return true;
};

/**
 * 更新用户资料
 */
const userUpdateInfo = function(wechatUserInfo, successCallback) {
  let HTTP = require(httpUtilPath);

  HTTP.httpPost('users/mine', wechatUserInfo, function(data) {
    getApp().globalData.userInfo = data;

    if (successCallback) successCallback();
    console.info('updated user info => ', data);
  });
};

/**
 * 恢复登录
 */
const restoreLogin = function(APP, successCallback) {
  let HTTP = require(httpUtilPath);

  // 从 LocalStorage 恢复 apiToken
  let apiToken = wx.getStorageSync('apiToken');

  if (apiToken) {
    wx.request({
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + apiToken
      },
      url: HTTP.makeApiPath('users/mine'),
      data: {},
      success: function (res) {
        if (HTTP.httpSuccessful(res)) {
          APP.globalData.apiToken = apiToken;
          APP.globalData.isAuth = true;
          APP.globalData.userInfo = res.data.data;

          if (successCallback) successCallback();
          console.debug('恢复登录状态: ' + APP.globalData.userInfo.nickname + '(' + APP.globalData.userInfo.id + ')', APP.globalData.userInfo);
        } else {
          console.debug('恢复登录状态失败: isAuth => false');
        }
      },
    });
  } else {
    console.debug('恢复登录状态失败: Storage.apiToken does not exist');
  }
};

module.exports = {
  userLogin, restoreLogin, userUpdateInfo,
};
