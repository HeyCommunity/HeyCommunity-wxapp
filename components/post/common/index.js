const APP = getApp();

Component({
  options: {},
  properties: {
  },
  data: {
    pageThis: null,

    // 评论模态框
    commentTextareaFocus: false,
    commentModalVisible: false,
    commentModalContent: null,
    commentModalType: null,
    commentModalEntityType: null,
    commentModalEntityId: null,
    commentModalCommentIndex: null,
    commentModalCommentId: null,
    commentModalTargetUserNickname: null,
  },
  methods: {
    //
    // 点赞处理
    baseThumbHandler(apiPath, params) {
      return new Promise(function(resolve, reject) {
        APP.HTTP.POST(apiPath, params).then(function(result) {
          resolve(result);
        }).catch(function(res) {
          wx.showModal({
            title: params.value ? '点赞失败' : '取消点赞失败',
            content: APP.HTTP.wxRequestIsOk(res) ? res.data.message : res.errMsg,
            showCancel: false,
          });

          reject(res);
        });
      });
    },

    //
    // 动态点赞处理
    postThumbHandler(_this, event) {
      if (getApp().needAuth()) return;

      let params = {
        entity_id: event.currentTarget.dataset.entityId,
        entity_type: event.currentTarget.dataset.entityType,
        type: event.currentTarget.dataset.type,
        value: event.currentTarget.dataset.value,
      };

      this.baseThumbHandler('thumbs', params).then(function(result) {
        let message = null;

        if (result.statusCode === 201 || result.statusCode === 200) {
          message = '点赞成功';
          _this.data.model['i_have_thumb_up'] = true;
          _this.data.model['thumb_up_num'] += 1;
          _this.setData({model: _this.data.model});
        } else if (result.statusCode === 202) {
          message = '取消点赞';
          _this.data.model['i_have_thumb_up'] = false;
          _this.data.model['thumb_up_num'] -= 1;
          _this.setData({model: _this.data.model});
        }

        if (message) {
          wx.showToast({title: message});
          // APP.showNotify(message);
        }
      }).finally(function() {
        APP.MODEL.getModel(_this, 'posts/' + _this.data.modelId);
      });
    },

    //
    // 评论点赞处理
    postCommentThumbHandler(_this, event) {
      if (getApp().needAuth()) return;

      let commentIndex = event.currentTarget.dataset.commentIndex;

      let params = {
        entity_id: event.currentTarget.dataset.entityId,
        entity_type: event.currentTarget.dataset.entityType,
        type: event.currentTarget.dataset.type,
        value: event.currentTarget.dataset.value,
      };

      this.baseThumbHandler('thumbs', params).then(function(result) {
        let message = null;

        if (result.statusCode === 201) {
          message = '点赞成功';
          _this.data.model.comments[commentIndex].i_have_thumb_up = true;
          _this.data.model.comments[commentIndex].thumb_up_num += 1;
          _this.setData({model: _this.data.model});
        } else if (result.statusCode === 202) {
          message = '取消点赞成功';
          _this.data.model.comments[commentIndex].i_have_thumb_up = false;
          _this.data.model.comments[commentIndex].thumb_up_num -= 1;
          _this.setData({model: _this.data.model});
        }

        if (message) {
          wx.showToast({title: message});
          // APP.showNotify(message);
        }
      }).finally(function() {
        APP.MODEL.getModel(_this, 'posts/' + _this.data.modelId);
      });
    },

    //
    // 显示评论框
    showCommentModal(pageThis, event) {
      if (getApp().needAuth()) return;

      this.setData({pageThis: pageThis});

      this.setData({
        commentModalVisible: true,
        commentModalType: event.currentTarget.dataset.type,
        commentModalEntityType: event.currentTarget.dataset.entityType,
        commentModalEntityId: event.currentTarget.dataset.entityId,
        commentModalCommentIndex: event.currentTarget.dataset.commentIndex,
        commentModalCommentId: event.currentTarget.dataset.commentId,
        commentModalTargetUserNickname: event.currentTarget.dataset.targetUserNickname,
      });

      setTimeout(function() {
        pageThis.setData({commentTextareaFocus: true});
      }, 200);
    },

    //
    // 关闭评论框
    hideCommentModal() {
      this.setData({
        commentModalVisible: false,
        commentModalContent: null,
        commentModalType: null,
        commentModalEntityType: null,
        commentModalEntityId: null,
        commentModalCommentIndex: null,
        commentModalCommentId: null,
        commentTextareaFocus: false,
        commentModalTargetUserNickname: null,
      });
    },

    //
    // 评论处理
    commentHandler(event) {
      if (getApp().needAuth()) return;

      let compThis = this;
      let _this = this.data.pageThis;

      let type = this.data.commentModalType;
      let entityType = this.data.commentModalEntityType;
      let entityId = this.data.commentModalEntityId;
      let commentIndex = this.data.commentModalCommentIndex;
      let commentId = this.data.commentModalCommentId;
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
        content: content,
        entity_id: entityId,
        entity_type: entityType,
      };
      if (type === 'replyComment') params.comment_id = commentId;

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
      APP.HTTP.POST('comments', params).then((result) => {
        compThis.hideCommentModal();

        if (result.data.status) {
          if (type === 'replyComment') _this.data.model.comments[commentIndex].i_have_comment = true;
          _this.data.model.comments.unshift(result.data);
          _this.data.model.comment_num += 1;
          _this.data.model.i_have_comment = true;
          _this.setData({model: _this.data.model});

          APP.showNotify('评论成功');
        } else {
          APP.showNotify('评论创建成功 \n 管理员审核通过后将发布', 'warning');
        }

        // 订阅消息
        wxappNoticeSubscribeHandler();
      }).catch(function(res) {
        wx.showModal({
          title: '评论失败',
          content: APP.HTTP.wxRequestIsOk(res) ? res.data.message : res.errMsg,
          showCancel: false,
        });
      });
    },
  },
});
