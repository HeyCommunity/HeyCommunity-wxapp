const HTTP = require('../utils/http.js');

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
  return getModels(currentPage + 1, params);
}

/**
 * 获取 models
 */
let getModels = function(pageNum, params, config) {
  needInited();

  if (params === undefined) params = {};
  if (! pageNum) params.page = 1;

  return new Promise(function(resolve, reject) {
    wx.showLoading({title: '加载中'});

    HTTP.GET(apiPath, params, config).then(function(result, res) {
      if (result.meta.current_page === 1) data = [];
      data = data.concat(result.data);
      pageThis.setData({[dataKeyName]: data});

      // TODO: lastPageNum 可以删除吗？
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

module.exports = {
  init,
  needInited,
  // getModel,
  getModels,
  getFirstPageModels, getNextPageModels,
}
