const HTTP = require('../../../utils/http.js');

Page({
  data: {
    timelines: [],
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    // 获取动态
    HTTP.httpGet('timelines', {}, function(data) {
      _this.setData({timelines: data});
    });
  },
});
