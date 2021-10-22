const HTTP = require('../../../../utils/http.js');

//
// 点赞处理
function thumbHandler(event, _this) {
  if (getApp().needAuth()) return;

  let currentTarget = event.detail.currentTarget ? event.detail.currentTarget : event.currentTarget;

  let modelIndex = currentTarget.dataset.modelIndex;
  let commentIndex = currentTarget.dataset.commentIndex;

  let entity = _this.data.model;
  if (modelIndex == null && commentIndex != null) entity = _this.data.model.comments[commentIndex];
  if (modelIndex != null && commentIndex == null) entity = _this.data.models[modelIndex];
  if (modelIndex != null && commentIndex != null) entity = _this.data.models[modelIndex].comments[commentIndex];

  let params = {
    entity_id: currentTarget.dataset.entityId,
    entity_type: currentTarget.dataset.entityType,
    type: currentTarget.dataset.type,
    value: currentTarget.dataset.value,
  };

  thumbRequest(params).then(function(result) {
    let message;

    if (result.statusCode === 201 || result.statusCode === 200) {
      message = '点赞成功';
      entity.i_have_thumb_up = true;
      entity.thumb_up_num += 1;
    } else if (result.statusCode === 202) {
      message = '取消点赞';
      entity.i_have_thumb_up = false;
      entity.thumb_up_num -= 1;
    }

    // DEBUG: 莫名其妙 entity 是引用赋值
    // if (modelIndex == undefined && commentIndex == undefined) _this.data.model = entity;
    // if (modelIndex != undefined && commentIndex == undefined) _this.data.models[modelIndex] = entity;
    // if (modelIndex != undefined && commentIndex != undefined) _this.data.models[modelIndex].comments[commentIndex] = entity;

    _this.setData({model: _this.data.model});
    _this.setData({models: _this.data.models});

    if (message) wx.showToast({title: message});
  });
}

//
// 点赞 API 请求
function thumbRequest(params) {
  let apiPath = 'thumbs';

  return new Promise(function(resolve, reject) {
    HTTP.POST(apiPath, params).then(function(result) {
      resolve(result);
    }).catch(function(res) {
      wx.showModal({
        title: params.value ? '点赞失败' : '取消点赞失败',
        content: HTTP.wxRequestIsOk(res) ? res.data.message : res.errMsg,
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
