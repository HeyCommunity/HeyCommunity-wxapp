const HTTP = require('./http.js');

let PAGE = null;
let inited = false;
let apiPath = null;
let currentPage = 1;
let lastPage = null;
let refreshLoading = false;
let moreLoading = false;


//
// 初始化
let init = function(page, apiPath) {
  this.PAGE = page;
  this.apiPath = apiPath;

  this.currentPage = 1;
  this.lastPage = null;
  this.refreshLoading = false;
  this.moreLoading = false;

  this.inited = true;
}


//
// 获取 models
let getModels = function(pageNum, params) {
  let _this = this;
  if (! this.apiPath) throw '请先调用 init 方法进行初始化';

  if (params === undefined) params = {};
  if (! pageNum) pageNum = this.currentPage;

  params.page = pageNum;

  return new Promise(function(resolve, reject) {
    wx.showLoading({title: '加载中'});
    HTTP.GET(_this.apiPath, params).then(function(result, res) {
      if (result.meta.current_page === 1) _this.PAGE.data.models = [];
      _this.PAGE.data.models = _this.PAGE.data.models.concat(result.data);
      _this.PAGE.setData({models: _this.PAGE.data.models});

      _this.lastPage = result.meta.last_page;
      if (result.data.length) {
        _this.currentPage = result.meta.current_page;
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

// 获取第一页 models
let getFirstPageModels = function(params) {
  return this.getModels(1, params);
}

// 获取下一页 models
let getNextPageModels = function(params) {
  return this.getModels(this.currentPage + 1, params);
}

//
// 获取 model
let getModel = function(pageThis, apiPath, params) {
  return new Promise(function(resolve, reject) {
    HTTP.GET(apiPath).then(function(result) {
      pageThis.setData({model: result.data});

      resolve(result);
    }).catch(function(res) {
      if (HTTP.wxRequestIsOk(res)) {
        wx.showModal({
          title: '提示',
          content: '内容不存在或已被删除',
          showCancel: false,
          complete(res) {
            wx.navigateBack();
          }
        });
      }

      reject(res);
    });
  });

}

//
// 点赞处理
let baseThumbHandler = function(params) {
  let apiPath = 'thumbs';

  return new Promise(function(resolve, reject) {
    HTTP.POST(apiPath, params).then(function(result) {
      resolve(result);
    }).catch(function(res) {
      wx.showModal({
        title: params.value ? '点赞失败' : '取消点赞失败',
        showCancel: false,
      });

      reject(res);
    });
  });
}

//
// exports
module.exports = {
  currentPage,
  lastPage,
  init,
  getModel,
  getModels,
  getFirstPageModels,
  getNextPageModels,
  baseThumbHandler,
};
