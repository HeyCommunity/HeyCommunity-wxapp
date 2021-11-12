const {apiDomain, apiProHost} = require('./env');
const httpTimeout = 1000 * 10;

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

  // configs
  let defaultConfigs = {showRequestFailModal: true};
  if (configs === undefined) configs = {};
  configs = Object.assign(defaultConfigs, configs);

  let apiToken = APP ? APP.globalData.apiToken : '';
  if (configs.apiToken) apiToken = configs.apiToken;

  return new Promise(function(resolve, reject) {
    wx.request({
      method: type,
      header: {
        'Authorization': 'Bearer ' + apiToken,
        'Accept': 'application/json',
      },
      url: makeApiPath(path),
      data: params,
      timeout: httpTimeout,
      success: function(res) {
        if (httpRequestIsOk(res)) {
          // TODO: 移除 statusCode，貌似只服务于 Thumb 功能
          if (typeof res.data === 'object') {
            res.data.statusCode = res.statusCode;
          } else {
            res.data = {statusCode: res.statusCode};
          }

          resolve(res.data);
          console.debug('[HTTP-' + type + '][' + res.statusCode + ']: /' + path, res);
        } else {
          showRequestFailModal(res, configs);

          reject(res);
          console.error('[HTTP-' + type + '][' + res.statusCode + ']: /' + path, res);
        }
      },
      fail: function(res) {
        APP.Notify({message: '网络请求失败', type: 'danger'});

        showRequestFailModal(res, configs);

        reject(res);
        console.error('[HTTP-' + type + '][WX.REQUEST-FAIL]: /' + path, res);
      },
    });
  });
};

/**
 * 上传文件
 */
const uploadFile = function(apiPath, filePath, params, configs) {
  let APP = getApp();

  // configs
  let defaultConfigs = {showRequestFailModal: true};
  if (configs === undefined) configs = {};
  configs = Object.assign(defaultConfigs, configs);

  let apiToken = APP ? APP.globalData.apiToken : '';
  if (configs.apiToken) apiToken = configs.apiToken;

  return new Promise(function(resolve, reject) {
    wx.uploadFile({
      header: {
        'Authorization': 'Bearer ' + apiToken,
        'Accept': 'application/json',
      },
      url: makeApiPath(apiPath),
      filePath: filePath,
      name: 'file',
      formData: params,
      success: function(res) {
        if (httpRequestIsOk(res)) {
          resolve(res.data);
          console.debug('[HTTP-UploadFile] ' + filePath + ' successful', res);
        } else {
          showRequestFailModal(res, configs);

          reject(res);
          console.error('[HTTP-UploadFile] ' + filePath + ' fail', res);
        }
      },
      fail: function(res) {
        APP.Notify({message: '网络请求失败', type: 'danger'});

        showRequestFailModal(res, configs);

        reject(res);
        console.error('[HTTP-UploadFile] ' + apiPath + ' wx.uploadFile fail', res);
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

/**
 * wx.request 是否成功
 */
const wxRequestIsOk = function(res) {
  if (res.errMsg === 'request:ok') return true;
  return false;
}

/**
 * 获取请求失败的标题
 */
const getRequestFailTitle = function(res, title) {
  if (! title) {
    title = '发生错误';
    if (wxRequestIsOk(res) && res.data && res.data.errors) title = '请求数据不合法';
    if (! wxRequestIsOk(res)) title = '网络请求失败';
  }

  return title;
}

/**
 * 获取请求失败的返回消息
 * TODO: 重定义，把 res.errMsg 转为本地语言
 * TODO: 404 res.data.message 为空
 */
const getRequestFailMessage = function(res) {
  let message = res.errMsg;

  if (wxRequestIsOk(res)) {
    if (res.data && res.data.errors) {
      message = res.data.errors[Object.keys(res.data.errors)[0]][0];
    } else {
      message = res.data.message;
    }
  }

  // 重写
  if (message.startsWith('request:fail')) message = '网络请求失败';
  if (message.startsWith('uploadFile:fail')) message = '文件上传失败';

  return message;
}

/**
 * 显示请求失败的模态框通知
 */
const showRequestFailModal = function(res, configs) {
  // configs
  let defaultConfigs = {
    showRequestFailModal: true,
    requestFailModalTitle: null,
    requestFailModalContent: null,
  };
  if (configs === undefined) configs = {};
  configs = Object.assign(defaultConfigs, configs);

  if (configs.showRequestFailModal) {
    wx.showModal({
      title: getRequestFailTitle(res, configs.requestFailModalTitle),
      content: getRequestFailMessage(res),
      showCancel: false,
    })
  }
}

/**
 * 显示 Laravel 表单校验失败的模态框
 */
const showLaravelValidateFailModal = function(res, title) {
  if (title === undefined) title = '请求数据不合法';
  let message = res.data.message;
  if (res.data && res.data.errors) message = res.data.errors[Object.keys(res.data.errors)[0]][0];

  wx.showModal({
    title: title,
    content: message,
    showCancel: false,
  });
}

//
// module exports
module.exports = {
  makeApiPath, makeWebPagePath,
  httpRequestIsOk, wxRequestIsOk, getRequestFailMessage, showRequestFailModal, showLaravelValidateFailModal,
  GET, POST, uploadFile,
};
