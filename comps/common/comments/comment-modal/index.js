const APP = getApp();
const HTTP = require('../../../../utils/http');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    entityClass: String,
  },
  data: {
    modalVisible: false,
    commentTextareaFocus: false,
    commentTextareaContent: null,

    entity: Object,
    entityIndex: null,
    commentIndex: null,
    commentTargetUserNickname: null,
  },
  methods: {
    /**
     * 显示评论框
     * 可接受 targetUserNickname，用于显示回复对象
     * 可接受 commentIndex 以获取 parentComment
     */
    showCommentModal(config) {
      if (getApp().needAuth()) return;

      let _this = this;
      this.setData({
        modalVisible: true,
        entity: config.entity,
        entityIndex: config.entityIndex ? config.entityIndex : null,
        commentIndex: config.commentIndex ? config.commentIndex : null,
        commentTargetUserNickname: config.commentTargetUserNickname ? config.commentTargetUserNickname : null,
      });

      setTimeout(function() {
        _this.setData({commentTextareaFocus: true});
      }, 100);
    },

    /**
     * 关闭评论框
     */
    hideCommentModal() {
      this.setData({
        modalVisible: false,
        entity: null,
        entityIndex: null,
        commentIndex: null,
        commentTargetUserNickname: null,
        commentTextareaFocus: false,
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
        entity_id: entity.id,
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

        _this.hideCommentModal();
        _this.setData({commentTextareaContent: null});

        // 触发评论成功事件
        _this.triggerEvent('commentSuccessfulEvent', {entity: entity});
      });
    },

    /**
     * 评论请求
     */
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
