/**
 * Variable
 */
const httpUtilPath = './http.js';

/**
 * 用户登录
  */
const userLogin = function(code) {
  let APP = getApp();

  return new Promise(function(resolve, reject) {
    // 获取 token
    APP.HTTP.GET('users/login', {code: code}).then(function(result) {
      APP.globalData.apiToken = result.data.token;
      APP.globalData.isAuth = true;
      APP.globalData.userInfo = result.data;

      // 写入 LocalStorage
      wx.setStorage({
        key: 'apiToken',
        data: APP.globalData.apiToken,
      });

      console.debug('登录成功: ' + APP.globalData.userInfo.nickname + '(' + APP.globalData.userInfo.id + ')', APP.globalData.userInfo);
      resolve(result);
    }).catch(function(result, res) {
      console.debug('登录失败', result, res);
      reject(result, res);
    });
  });
};

/**
 * 用户登出
 */
const userLogout = function() {
  let APP = getApp();

  return new Promise(function(resolve, reject) {
    APP.globalData.isAuth = false;
    APP.globalData.userInfo = null;
    wx.removeStorage({key: 'apiToken'});

    APP.HTTP.POST('users/logout').then(function(result, res) {
      resolve(result, res);
    }).catch(function(result, res) {
      reject(result, res);
    });
  })
};

/**
 * 更新用户资料
 */
const userUpdateInfo = function(wechatUserInfo) {
  let APP = getApp();

  return new Promise(function(resolve, reject) {
    APP.HTTP.POST('users/mine', wechatUserInfo).then(function(result, res) {
      APP.globalData.userInfo = result.data;

      console.debug('updated user info => ', result.data);
      resolve(result, res);
    }).catch(function(result, res) {
      console.debug('update user info fail', result, res);
      reject(result, res);
    });
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
  userLogin, userLogout,
  restoreLogin, userUpdateInfo,
};
