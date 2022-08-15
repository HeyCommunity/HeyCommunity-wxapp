/**
 * Variable
 */
const userPingTimeout = 1000 * 30;

/**
 * 启用用户追踪
 */
const enableUserTrack = function() {
  let handler = function (code) {
    let APP = getApp();

    return new Promise(function(resolve, reject) {
      // 获取 token
      APP.REQUEST.POST('users/wxapp-signup', {code: code}).then(function(result) {
        APP.globalData.apiTrackToken = result.data.token;

        console.debug('启用 UserTrack:', result.data.token);
        resolve(result);
      }).catch(function(result, res) {
        console.error('启用 UserTrack: 失败', result, res);
        reject(result, res);
      });
    });
  }

  wx.login({
    success: function (res) {
      return handler(res.code);
    }
  });
}

/**
 * 用户登录
  */
const userLogin = function(code, userInfo) {
  let APP = getApp();

  return new Promise(function(resolve, reject) {
    // 获取 token
    APP.REQUEST.POST('users/wxapp-login', {code: code, user_info: userInfo}).then(function(result) {
      APP.globalData.apiToken = result.data.token;
      APP.globalData.isAuth = true;
      APP.globalData.userInfo = result.data;

      // 写入 LocalStorage
      wx.setStorage({
        key: 'apiToken',
        data: APP.globalData.apiToken,
      });

      console.debug('登录成功: ' + APP.globalData.userInfo.nickname + '(' + APP.globalData.userInfo.id + ')', APP.globalData.userInfo);
      startUserPing();                      // 恢复登录成功，开始 UserPing
      APP.resetNoticeBadgeAtTabBar();       // 重置 TabBar 中的通知角标数

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
      APP.REQUEST.POST('users/wxapp-restore-login', {}, {
        apiToken: apiToken,
        showRequestFailModal: false,
      }).then(function(result) {
        APP.globalData.isAuth = true;
        APP.globalData.userInfo = result.data;

        console.debug('恢复登录状态成功: ' + result.data.nickname + '(' + result.data.id + ')', APP.globalData.userInfo);
        startUserPing();                      // 恢复登录成功，开始 UserPing
        APP.resetNoticeBadgeAtTabBar();       // 重置 TabBar 中的通知角标数

        resolve(result);
      }).catch(function(res) {
        console.debug('恢复登录状态失败:', res);
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

    stopUserPing();                       // 停止 UserPing
    APP.resetNoticeBadgeAtTabBar();       // 重置 TabBar 中的通知角标数

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
 * UserPing
 */
const startUserPing = function() {
  let APP = getApp();

  APP.userPingInterval = setInterval(function() {
    APP.REQUEST.GET('users/ping', {}, {showRequestFailModal: false}).then(function(result) {
      userPingHandler(result);
    }).catch(function() {
    });
  }, userPingTimeout);

  console.debug('start UserPing');
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
 * Stop UserPing
 */
const stopUserPing = function() {
  let APP = getApp();

  if (APP.userPingInterval) {
    clearInterval(APP.userPingInterval);
  }

  console.debug('stop UserPing');
}

module.exports = {
  enableUserTrack,
  userLogin, userLogout,
  restoreLogin, syncWechatUserInfo,
};
