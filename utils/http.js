const {apiDomain, apiProHost} = require('./env');

/**
 * GET 请求
 */
const GET = function(path, params, configs) {
  return request('GET', path, params, configs);
}

/**
 * POST 请求
 */
const POST = function(path, params, configs) {
  return request('POST', path, params, configs);
}

/**
 * HTTP 请求
 */
const request = function(type, path, params, configs) {
  let APP = getApp();
  let apiToken = APP ? APP.globalData.apiToken : '';

  if (configs === undefined) {
    configs = {};
  }

  return new Promise(function(resolve, reject) {
    wx.request({
      method: type,
      header: {
        'Authorization': 'Bearer ' + apiToken,
      },
      url: makeApiPath(path),
      data: params,
      success: function(res) {
        if (httpRequestIsOk(res)) {
          resolve(res.data, res);
          console.debug('[HTTP-' + type + '] ' + path + ' successful', res);
        } else {
          reject(res.data, res);
          console.error('[HTTP-' + type + '] ' + path + ' fail', res);
        }
      },
      fail: function(res) {
        if (configs.showRequestFailModal != false) {
          wx.showModal({
            title: '网络请求失败',
            content: res.errMsg,
            showCancel: false,
          });
        }

        reject('WX.REQUEST FAIL', res);
        console.error('[HTTP-' + type + '] ' + path + ' wx.request fail', res);
      },
    });
  });
};

/**
 * 上传文件
 */
const uploadFile = function(apiPath, filePath, params, configs) {
  let APP = getApp();
  let apiToken = APP ? APP.globalData.apiToken : '';

  if (configs === undefined) {
    configs = {};
  }

  return new Promise(function(resolve, reject) {
    wx.uploadFile({
      header: {
        'Authorization': 'Bearer ' + apiToken,
      },
      url: makeApiPath(apiPath),
      filePath: filePath,
      name: 'file',
      formData: params,
      success: function(res) {
        res.data = JSON.parse(res.data);

        if (httpRequestIsOk(res)) {
          console.debug('[HTTP-UploadFile] ' + filePath + ' successful', res);
          resolve(res.data, res);
        } else {
          console.error('[HTTP-UploadFile] ' + filePath + ' fail', res);
          reject(res.data, res);
        }
      },
      fail: function(res) {
        if (configs.showRequestFailModal != false) {
          wx.showModal({
            title: '网络请求失败',
            content: res.errMsg,
            showCancel: false,
          });
        }

        console.error('[HTTP-UploadFile] ' + apiPath + ' wx.uploadFile fail', res);
        reject('WX.REQUEST FAIL', res);
      },
    });
  });
}

/**
 * 生成 Api URL
 */
const makeApiPath = function(path) {
  return apiProHost + '/' + path;
};

/**
 * 生成 Web Page URL
 */
const makeWebPagePath = function(path) {
  let APP = getApp();

  return apiDomain + '/' + path + '?token=' + APP.globalData.apiToken;
};

/**
 * 请求是否成功
 */
const httpRequestIsOk = function(res) {
  return res.statusCode.toString()[0] == 2;
};

//
// module exports
module.exports = {
  makeApiPath, makeWebPagePath,
  httpRequestIsOk,
  GET, POST, uploadFile,
};
