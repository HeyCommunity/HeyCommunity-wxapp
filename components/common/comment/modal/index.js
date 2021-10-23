const APP = getApp();
const HTTP = require('../../../../utils/http');

Component({
  options: {},
  properties: {
    entity: Object,
    entityId: Number,
    entityClass: String,
    parentId: null,
  },
  data: {
    modalVisible: false,
    commentTextareaFocus: false,
    commentTextareaContent: null,
    commentTargetUserNickname: null,

    commentIndex: null,
  },
  methods: {
    //
    // 显示评论框
    showCommentModal(event) {
      console.log('showCommentModal event', event);

      if (getApp().needAuth()) return;

      this.setData({
        modalVisible: true,
        commentTargetUserNickname: event.currentTarget.dataset.targetUserNickname,
        parentId: event.currentTarget.dataset.parentId,
        commentIndex: event.currentTarget.dataset.commentIndex,
      });

      let _this = this;
      setTimeout(function() {
        _this.setData({commentTextareaFocus: true});
      }, 200);
    },

    //
    // 关闭评论框
    hideCommentModal() {
      this.setData({
        modalVisible: false,
        commentTargetUserNickname: null,
        commentTextareaFocus: false,
        commentIndex: null,
      });
    },

    //
    // 评论处理
    commentHandler(event) {
      if (getApp().needAuth()) return;

      let _this = this;

      let content = event.detail.value.content;
      if (! content) {
        wx.showModal({
          title: '提示',
          content: '内容不能为空',
          showCancel: false,
        });
        console.error('评论内容不能为空');
        return;
      }

      let params = {
        entity_class: this.properties.entityClass,
        entity_id: this.properties.entityId,
        parent_id: this.properties.parentId,
        content: content,
      };

      // 发起评论请求
      this.commentRequest(params).then(function(result) {
        if (result.data.status) {
          if (_this.data.commentIndex != null) {
            _this.properties.entity.comments[_this.data.commentIndex].i_have_comment = true;
            _this.properties.entity.comments[_this.data.commentIndex].comment_num += 1;
          }

          _this.properties.entity.comments.unshift(result.data);
          _this.properties.entity.comment_num += 1;
          _this.properties.entity.i_have_comment = true;

          // APP.showNotify('评论成功');
          wx.showToast({title: '评论成功'});
        } else {
          APP.showNotify('评论创建成功 \n 管理员审核通过后将发布', 'warning');
        }

        _this.hideCommentModal();
        _this.setData({commentTextareaContent: null});

        _this.triggerEvent('commentSuccessfulEvent', {entity: _this.properties.entity});
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
