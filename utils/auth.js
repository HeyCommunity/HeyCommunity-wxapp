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

      userPingRun();
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

    userPingStop();
    APP.resetTabBarBadge();

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
const restoreLogin = function(APP) {
  // 从 LocalStorage 恢复 apiToken
  let apiToken = wx.getStorageSync('apiToken');

  return new Promise(function(resolve, reject) {
    if (apiToken) {
      APP.globalData.apiToken = apiToken;
      APP.HTTP.GET('users/mine').then(function(result) {
        APP.globalData.isAuth = true;
        APP.globalData.userInfo = result.data;

        userPingRun();
        APP.resetTabBarBadge();
        console.debug('恢复登录状态: ' + result.data.nickname + '(' + result.data.id + ')', APP.globalData.userInfo);
        resolve(result);
      }).catch(function(res) {
        console.debug('恢复登录状态失败', res);
        reject(res);
      });
    } else {
      console.debug('恢复登录状态失败: apiToken does not exist in wx.storage');
      reject({errMsg: 'apiToken does not exist in wx.storage'});
    }
  });
};

/**
 * UserPing Run
 */
const userPingRun = function() {
  let APP = getApp();
  let timeout = 1000 * 30;

  APP.userPingInterval = setInterval(function() {
    APP.HTTP.GET('users/ping').then(function(result) {
      APP.userPingHandler(result);
    }).catch(function() {
    });
  }, timeout);

  console.debug('UserPing Run');
}

/**
 * UserPing Stop
 */
const userPingStop = function() {
  let APP = getApp();

  if (APP.userPingInterval) {
    clearInterval(APP.userPingInterval);
  }

  console.debug('UserPing Stop');
}

module.exports = {
  userLogin, userLogout,
  restoreLogin, userUpdateInfo,
};
