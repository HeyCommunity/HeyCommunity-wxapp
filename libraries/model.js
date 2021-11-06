const REQUEST = require('../libraries/request.js');

let pageThis = null;
let data = null;
let dataKeyName = null;
let apiPath = null;

let currentPageNum = 1;
let lastPageNum = null;

/**
 * 初始化
 */
let init = function(config) {
  apiPath = config.apiPath;
  pageThis = config.pageThis;
  dataKeyName = config.dataKeyName;
  data = pageThis.data[config.dataKeyName];
};

let needInited = function() {
  if (!pageThis || !apiPath) throw '请先调用 init 方法进行初始化';
}

// 获取第一页 models
let getFirstPageModels = function(params) {
  return getModels(1, params);
}

// 获取下一页 models
let getNextPageModels = function(params) {
  return getModels(currentPageNum + 1, params);
}

/**
 * 获取 models
 */
let getModels = function(pageNum, params, config) {
  needInited();

  if (params === undefined) params = {};
  params.page = pageNum;
  if (! pageNum) params.page = 1;

  return new Promise(function(resolve, reject) {
    wx.showLoading({title: '加载中'});

    REQUEST.GET(apiPath, params, config).then(function(result, res) {
      if (result.meta.current_page === 1) data = [];
      data = data.concat(result.data);
      pageThis.setData({[dataKeyName]: data});

      lastPageNum = result.meta.last_page;
      if (result.data.length) {
        currentPageNum = result.meta.current_page;
      } else {
        wx.showToast({title: '没有更多数据了', icon: 'none'});
      }

      resolve(result, res);
    }).catch(function(result, res) {
      reject(result, res);
    }).finally(function() {
      setTimeout(function() { wx.hideLoading(); }, 200)
    });
  });
};

/**
 * 获取 Model
 */
let getModel = function(config, params, requestConfig) {
  let apiPath = config.apiPath;
  let pageThis = config.pageThis;
  let dataKeyName = config.dataKeyName;

  return new Promise(function(resolve, reject) {
    REQUEST.GET(apiPath, params, requestConfig).then(function(result) {
      pageThis.setData({[dataKeyName]: result.data});

      resolve(result);
    }).catch(function(res) {
      reject(res);
    });
  });
};

module.exports = {
  init,
  needInited,
  getModel,
  getModels,
  getFirstPageModels, getNextPageModels,
}
