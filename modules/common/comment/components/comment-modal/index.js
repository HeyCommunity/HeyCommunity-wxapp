const APP = getApp();
const REQUEST = require('../../../../../libraries/request.js');

Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    modalVisible: false,
    commentTextareaFocus: false,
    commentTextareaContent: null,
    commentTargetUserNickname: null,

    entity: null,
    entityIndex: null,
    commentIndex: null,
    entityClass: null,
  },
  methods: {
    /**
     * 显示评论框
     * 可接受 targetUserNickname，用于显示回复对象
     * 可接受 commentIndex 以获取 parentComment
     */
    showCommentModal(data) {
      if (getApp().needAuth()) return;

      let _this = this;
      this.setData({
        modalVisible: true,
        entity: data.entity,
        entityIndex: data.entityIndex,
        entityClass: data.entityClass,
        commentIndex: data.commentIndex ? data.commentIndex : null,
        commentTargetUserNickname: data.targetUserNickname ? data.targetUserNickname : null,
      });

      setTimeout(function() {
        _this.setData({commentTextareaFocus: true});
      }, 100);
    },

    /**
     * 关闭评论框
     */
    hideCommentModal(event) {
      this.setData({
        modalVisible: false,
        entity: null,
        entityIndex: null,
        entityClass: null,
        commentIndex: null,
        commentTextareaFocus: false,
        // commentTextareaContent: null,
        commentTargetUserNickname: null,
      });
    },

    /**
     * 评论处理
     */
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

      let entity = this.data.entity;
      let parentComment = null;
      if (this.data.commentIndex != null) parentComment = entity.comments[this.data.commentIndex];

      let params = {
        entity_class: this.data.entityClass,
        entity_id: this.data.entity.id,
        parent_id: parentComment ? parentComment.id : null,
        content: content,
      };

      // 发起评论请求
      this.setData({modalVisible: false});
      wx.showLoading({title: '请稍后'});
      this.commentRequest(params).then(function(result) {
        wx.hideLoading();

        if (result.data.status) {
          if (parentComment != null) {
            parentComment.i_have_comment = true;
            parentComment.comment_num += 1;
          }

          entity.comments.unshift(result.data);
          entity.comment_num += 1;
          entity.i_have_comment = true;

          wx.showToast({title: '评论成功'});
        } else {
          APP.Notify({message: '评论创建成功 \n 管理员审核通过后将发布', type: 'warning'});
        }

        // 触发评论成功事件
        _this.triggerEvent('commentSuccessfulEvent', {
          entityIndex: _this.data.entityIndex,
          entity: entity
        });

        // 关闭模态框
        _this.setData({commentTextareaContent: null});
        _this.hideCommentModal();
      });
    },

    /**
     * 评论请求
     */
    commentRequest(params) {
      let apiPath = 'comments';

      return new Promise(function(resolve, reject) {
        REQUEST.POST(apiPath, params).then(function(result) {
          resolve(result);
        }).catch(function(res) {
          wx.showModal({
            title: '评论失败',
            content: REQUEST.wxRequestIsOk(res) ? res.data.message : res.errMsg,
            showCancel: false,
          });

          reject(res);
        });
      });
    },
  },
});
