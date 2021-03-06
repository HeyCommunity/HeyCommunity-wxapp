const REQUEST = require('../../../libraries/request.js');

//
// 点赞处理
function thumbHandler(params, entity) {
  if (getApp().needAuth()) return;

  let apiPath = 'thumbs';

  return new Promise(function(resolve, reject) {
    REQUEST.POST(apiPath, params).then(function(result) {
      let message;

      if (result.statusCode === 201 || result.statusCode === 200) {
        message = '点赞成功';
        entity.i_have_thumb_up = true;
        entity.thumb_up_num += 1;

        wx.showToast({title: message});
      } else if (result.statusCode === 202) {
        message = '点赞已取消';
        entity.i_have_thumb_up = false;
        entity.thumb_up_num -= 1;

        wx.showToast({title: message, icon: 'none'});
      }

      // if (message) wx.showToast({title: message});

      return resolve(result);
    }).catch(function(res) {
      wx.showModal({
        title: params.value ? '点赞失败' : '取消点赞失败',
        content: REQUEST.wxRequestIsOk(res) ? res.data.message : res.errMsg,
        showCancel: false,
      });

      reject(res);
    });
  });
}

//
// module exports
module.exports = {
  thumbHandler,
}
