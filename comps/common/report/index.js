const HTTP = require('../../../utils/http.js');

let reportHandler = function(entityClass, entityId) {
  wx.showModal({
    title: '报告不良信息',
    content: '如果该内容包含不良信息，点击「提交报告」进行举报',
    confirmText: '提交报告',
    success: function(res) {
      if (res.confirm) {
        let params = {
          entity_class: entityClass,
          entity_id: entityId,
        };

        HTTP.POST('user-reports', params).then(function() {
          wx.showModal({title: '报告不良信息', content: '感谢，我们已收到你的举报', showCancel: false});
        });
      }
    },
  });
};

module.exports = {
  reportHandler,
};
