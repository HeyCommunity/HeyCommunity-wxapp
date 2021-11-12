/**
 * Variable
 */
const userPingTimeout = 1000 * 30;

/**
 * 用户登录
  */
const userLogin = function(code, userInfo) {
  let APP = getApp();

  return new Promise(function(resolve, reject) {
    // 获取 token
    APP.REQUEST.GET('users/login', {code: code, user_info: userInfo}).then(function(result) {
      APP.globalData.apiToken = result.data.token;
      APP.globalData.isAuth = true;
      APP.globalData.userInfo = result.data;

      // 写入 LocalStorage
      wx.setStorage({
        key: 'apiToken',
        data: APP.globalData.apiToken,
      });

      userPingRun();
      APP.resetNoticeBadgeAtTabBar();
      console.debug('登录成功: ' + APP.globalData.userInfo.nickname + '(' + APP.globalData.userInfo.id + ')', APP.globalData.userInfo);
      resolve(result);
    }).catch(function(result, res) {
      console.debug('登录失败', result, res);
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
      APP.REQUEST.GET('users/mine', {}, {
        apiToken: apiToken,
        showRequestFailModal: false
      }).then(function(result) {
        APP.globalData.isAuth = true;
        APP.globalData.userInfo = result.data;

        userPingRun();
        APP.resetNoticeBadgeAtTabBar();
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
 * 用户登出
 */
const userLogout = function() {
  let APP = getApp();

  return new Promise(function(resolve, reject) {
    APP.globalData.isAuth = false;
    APP.globalData.userInfo = null;
    wx.removeStorage({key: 'apiToken'});

    userPingStop();
    APP.resetNoticeBadgeAtTabBar();

    APP.REQUEST.POST('users/logout').then(function(result, res) {
      resolve(result, res);
    }).catch(function(result, res) {
      reject(result, res);
    });
  })
};

/**
 * 更新用户资料
 */
const syncWechatUserInfo = function(wechatUserInfo) {
  let APP = getApp();

  return new Promise(function(resolve, reject) {
    APP.REQUEST.POST('users/mine-sync-wx-profile', wechatUserInfo).then(function(result, res) {
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
 * UserPing Run
 */
const userPingRun = function() {
  let APP = getApp();

  APP.userPingInterval = setInterval(function() {
    APP.REQUEST.GET('users/ping', {}, {showRequestFailModal: false}).then(function(result) {
      userPingHandler(result);
    }).catch(function() {
    });
  }, userPingTimeout);

  console.debug('UserPing Run');
}

/**
 * UserPingHandler
 */
const userPingHandler = function(result) {
  let APP = getApp();
  let userInfo = result.data;

  // 触发顶部的提示和重设通知栏角标
  if (userInfo && userInfo.unread_notice_num) {
    let beforeUnReadNoticeNum = APP.globalData.userInfo.unread_notice_num;
    let currentUnReadNoticeNum = userInfo.unread_notice_num;
    let newNoticeNum = currentUnReadNoticeNum - beforeUnReadNoticeNum;

    if (newNoticeNum > 0) {
      APP.Notify({
        message: '收到 ' + newNoticeNum + ' 条新通知 \n 点击查看',
        type: 'primary',
        duration: 6000,
        onClick: function() {
          wx.switchTab({url: APP.noticeTabBarPageUrl});
        },
      });

      APP.globalData.userInfo.unread_notice_num = currentUnReadNoticeNum;
      APP.globalData.userInfo = userInfo;
      APP.resetNoticeBadgeAtTabBar();
    }
  }

  console.debug('gotUserPingData', result);
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
  restoreLogin, syncWechatUserInfo,
};
