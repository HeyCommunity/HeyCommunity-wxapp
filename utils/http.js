const {apiDomain, apiProHost} = require('./env');

//
// HTTP 请求
const httpRequest = function(type, path, params, successCallback, failCallback, requestFailCallback) {
  let APP = getApp();

  // API 返回失败回调
  if (!failCallback) failCallback = function(res) {};

  // 请求异常回调
  if (!requestFailCallback) {
    requestFailCallback = function(res) {
      console.error('http get fail', path, res);
    };
  }

  wx.request({
    method: type,
    header: {
      'Authorization': 'Bearer ' + APP.globalData.apiToken
    },
    url: makeApiPath(path),
    data: params,
    success: function(res) {
      if (httpSuccessful(res)) {
        console.debug('[HTTP-' + type + '] ' + path + ' successful', res);
        successCallback(res.data.data, res);
      } else {
        console.error('[HTTP-' + type + '] ' + path + ' fail', res);
        failCallback(res);
      }
    },
    fail: requestFailCallback,
  });
};

//
// HTTP GET 请求
const httpGet = function(path, params, successCallback, failCallback, requestFailCallback) {
  httpRequest('GET', path, params, successCallback, failCallback, requestFailCallback);
};

//
// HTTP POST 请求
const httpPost = function(path, params, successCallback, failCallback, requestFailCallback) {
  httpRequest('POST', path, params, successCallback, failCallback, requestFailCallback);
};

/**
 * 上传文件
 */
const uploadFile = function(path, filePath, params, successCallback, failCallback, requestFailCallback) {
  // API 返回失败回调
  if (!failCallback) failCallback = function(res) {};

  // 请求异常回调
  if (!requestFailCallback) {
    requestFailCallback = function(res) {
      console.error('UploadFile fail', filePath, res);
    };
  }

  wx.uploadFile({
    url: makeApiPath(path),
    filePath: filePath,
    name: 'file',
    formData: params,
    success: function(res) {
      if (httpSuccessful(res)) {
        res.data = JSON.parse(res.data);

        console.debug('[UploadFile] ' + filePath + ' successful', res);
        successCallback(res.data.data, res);
      } else {
        console.error('[UploadFile] ' + filePath + ' fail', res);
        failCallback(res);
      }
    },
    fail: requestFailCallback,
  });
}

//
// 生成 Api URL
const makeApiPath = function(path) {
  return apiProHost + '/' + path;
};

//
// 生成 Web Page URL
const makeWebPagePath = function(path) {
  let APP = getApp();

  return apiDomain + '/' + path + '?token=' + APP.globalData.apiToken;
};

//
// HTTP 请求是否成功
const httpSuccessful = function(res) {
  return res.statusCode.toString()[0] == 2;
};

//
// module exports
module.exports = {
  makeApiPath, makeWebPagePath, httpSuccessful,
  httpGet, httpPost, httpRequest,
  uploadFile,
};
