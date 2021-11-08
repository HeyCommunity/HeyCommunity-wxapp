const REQUEST = require('../libraries/request.js');

class Pagination {
  constructor(config) {

    this.apiPath = config.apiPath;
    this.pageThis = config.pageThis;
    this.dataKeyName = config.dataKeyName;
    this.data = this.pageThis.data[config.dataKeyName];
  }

  /**
   * 初始化检查
   */
  needInited() {
    if (!this.pageThis || !this.apiPath) throw '请在构造实例时进行必要的初始化';
  }

  /**
   * 获取第一页数据
   */
  getFirstPageData(params) {
    return this.getPageData(1, params);
  }

  /**
   * 获取下一页数据
   */
  getNextPageData(params) {
    return this.getPageData(this.currentPageNum + 1, params);
  }

  /**
   * 获取分页数据
   */
  getPageData(pageNum, params, config) {
    let _this = this;
    this.needInited();

    if (params === undefined) params = {};
    params.page = pageNum;
    if (! pageNum) params.page = 1;

    return new Promise(function(resolve, reject) {
      wx.showLoading({title: '加载中'});

      REQUEST.GET(_this.apiPath, params, config).then(function(result, res) {
        if (result.meta.current_page === 1) _this.data = [];
        _this.data = _this.data.concat(result.data);
        _this.pageThis.setData({[_this.dataKeyName]: _this.data});

        _this.lastPageNum = result.meta.last_page;
        if (result.data.length) {
          _this.currentPageNum = result.meta.current_page;
        } else {
          wx.showToast({title: '没有更多数据了', icon: 'none'});
        }

        resolve(result, res);
      }).catch(function(result, res) {
        reject(result, res);
      }).finally(function() {
        setTimeout(function() {
          wx.hideLoading();
        }, 200)
      });
    });
  };
}

module.exports = Pagination;
