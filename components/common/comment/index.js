const APP = getApp();
const HTTP = require('../../../utils/http');

Component({
  options: {},
  properties: {
  },
  data: {
    pageThis: null,

    actionType: null,           // 接受 comment 或者 replyComment
    modalVisible: false,
    commentTextareaFocus: false,
    commentTextareaContent: null,
    commentTargetUserNickname: null,

    modelIndex: null,
    commentIndex: null,

    entityClass: null,          // Laravel Model Namespace + ClassName
    entityId: null,
    parentId: null,
  },
  methods: {
    //
    // 显示评论框
    showCommentModal(pageThis, event) {
      if (getApp().needAuth()) return;

      this.setData({pageThis: pageThis});

      this.setData({
        modalVisible: true,
        actionType: event.currentTarget.dataset.actionType,
        commentTargetUserNickname: event.currentTarget.dataset.targetUserNickname,

        modelIndex: event.currentTarget.dataset.modelIndex,
        commentIndex: event.currentTarget.dataset.commentIndex,

        entityClass: event.currentTarget.dataset.entityClass,
        entityId: event.currentTarget.dataset.entityId,
        parentId: event.currentTarget.dataset.parentId,
      });

      setTimeout(function() {
        pageThis.setData({commentTextareaFocus: true});
      }, 200);
    },

    //
    // 关闭评论框
    hideCommentModal() {
      this.setData({
        modalVisible: false,
        actionType: null,
        commentTargetUserNickname: null,
        commentTextareaFocus: false,

        modelIndex: null,
        commentIndex: null,

        entityClass: null,
        entityId: null,
        parentId: null,
      });
    },

    //
    // 评论处理
    commentHandler(event) {
      if (getApp().needAuth()) return;

      let _this = this;
      let pageThis = this.data.pageThis;

      let content = event.detail.value.content;
      if (! content) {
        wx.showModal({
          title: '请说点什么',
          content: '内容不能为空',
          showCancel: false,
        });
        throw '请说点什么，内容不能为空';
      }

      // 请求参数
      let params = {
        entity_class: this.data.entityClass,
        entity_id: this.data.entityId,
        parent_id: this.data.parentId,
        content: content,
      };

      // 定义 modelInstance
      let modelInstance = pageThis.data.models[this.data.modelIndex];

      // 订阅消息
      let wxappNoticeSubscribeHandler = function() {
        if (APP.globalData.systemSettings
          && APP.globalData.systemSettings.wxapp_subscribe_message
          && APP.globalData.systemSettings.wxapp_subscribe_message.enable
        ) {
          wx.requestSubscribeMessage({
            tmplIds: [
              APP.globalData.systemSettings.wxapp_subscribe_message.thumb_up_temp_id,
              APP.globalData.systemSettings.wxapp_subscribe_message.comment_temp_id,
              APP.globalData.systemSettings.wxapp_subscribe_message.reply_temp_id,
            ],
            complete: function() {
            },
          });
        }
      };

      // 发起评论请求
      this.commentRequest(params).then(function(result) {
        if (result.data.status) {
          if (_this.data.commentIndex != null) modelInstance.comments[_this.data.commentIndex].i_have_comment = true;

          modelInstance.comments.unshift(result.data);
          modelInstance.comment_num += 1;
          modelInstance.i_have_comment = true;

          pageThis.setData({model: pageThis.data.model});
          pageThis.setData({models: pageThis.data.models});

          // APP.showNotify('评论成功');
          wx.showToast({title: '评论成功'});
        } else {
          APP.showNotify('评论创建成功 \n 管理员审核通过后将发布', 'warning');
        }

        _this.hideCommentModal();
        _this.setData({commentTextareaContent: null});


        // 订阅消息
        wxappNoticeSubscribeHandler();
      });
    },


    //
    // 评论请求
    commentRequest(params) {
      let apiPath = 'comments';

      return new Promise(function(resolve, reject) {
        HTTP.POST(apiPath, params).then(function(result) {
          resolve(result);
        }).catch(function(res) {
          wx.showModal({
            title: '评论失败',
            content: HTTP.wxRequestIsOk(res) ? res.data.message : res.errMsg,
            showCancel: false,
          });

          reject(res);
        });
      });
    },
  },
});
