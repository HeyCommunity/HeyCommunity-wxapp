/**
 * Variable
 */
const httpUtilPath = './http.js';
const userLoginApiPath = 'users/mine';

/**
 * 用户登录
  */
const userLogin = function(userInfo) {
  getApp().globalData.isAuth = true;
  getApp().globalData.userInfo = userInfo;

  // 写入 LocalStorage
  wx.setStorage({
    key: 'apiToken',
    data: getApp().globalData.apiToken,
  });

  return true;
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
      url: HTTP.makeApiPath(userLoginApiPath),
      data: {},
      success: function (res) {
        if (HTTP.httpSuccessful(res)) {
          APP.globalData.apiToken = apiToken;
          APP.globalData.isAuth = true;
          APP.globalData.userInfo = res.data.data;
          
          if (successCallback) successCallback();

          console.debug('恢复登录状态: isAuth => ' + APP.globalData.isAuth);
        } else {
          console.debug('恢复登录状态失败: isAuth => false');
        }
      },
    });
  }
};

module.exports = {
  userLogin, restoreLogin,
};
