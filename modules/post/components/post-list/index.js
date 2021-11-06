const THUMB = require('../../../common/thumb/index.js');
const PostActionSheet = require('./_post-action-sheet.js');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    posts: Array,
    post: Object,
    postIndex: Number,
  },
  data: {
    entityClass: 'Modules\\Post\\Entities\\Post',
  },
  methods: {
    /**
     * 触发更新 post 事件
     */
    triggerUpdatePostDataEvent(post, postIndex) {
      this.triggerEvent('updatePostDataEvent', {post: post, postIndex: postIndex});
    },

    /**
     * 监听 comments 数据更新事件
     */
    listenUpdateCommentsDataEvent(event) {
      let postIndex = event.detail.entityIndex;
      let post = this.data.posts[postIndex];
      let comments = event.detail.comments;

      post.comments = comments;

      this.triggerUpdatePostDataEvent(post, postIndex);
    },

    /**
     * 预览图片
     */
    previewImage(event) {
      let images = event.currentTarget.dataset.images;
      let currentImage = event.currentTarget.dataset.currentImage;

      wx.previewImage({
        urls: images.map(image => image.file_path),
        current: currentImage,
      });
    },

    /**
     * 点赞处理
     */
    thumbUpHandler(event) {
      let _this = this;
      let postIndex = event.currentTarget.dataset.postIndex;
      let post = this.data.posts[postIndex];
      let thumbValue = event.currentTarget.dataset.value;

      let params = {
        entity_id: post.id,
        entity_class: this.data.entityClass,
        type: 'thumb_up',
        value: thumbValue,
      };

      THUMB.thumbHandler(params, post).then(function() {
        _this.triggerUpdatePostDataEvent(post, postIndex);
      });
    },

    /**
     * 显示评论模态框
     */
    showCommentFormModal(event) {
      let postIndex = event.currentTarget.dataset.postIndex;
      let post = this.data.posts[postIndex];
      let entityClass = this.data.entityClass;

      this.selectComponent('#comp-comment-form-modal').showCommentModal({
        entity: post,
        entityIndex: postIndex,
        entityClass: entityClass,
      });
    },

    /**
     * 监听 显示评论回复模态框 事件
     */
    listenShowReplyCommentFormModalEvent(event) {
      let postIndex = event.detail.entityIndex;
      let post = this.data.posts[postIndex];
      let entityClass = this.data.entityClass;
      let commentIndex = event.detail.commentIndex;
      let targetUserNickname = event.detail.targetUserNickname;

      this.selectComponent('#comp-comment-form-modal').showCommentModal({
        entity: post,
        entityIndex: postIndex,
        entityClass: entityClass,
        commentIndex: commentIndex,
        targetUserNickname: targetUserNickname,
      });
    },

    /**
     * 监听 评论成功 事件
     */
    listenCommentSuccessfulEvent(event) {
      let post = event.detail.entity;
      let postIndex = event.detail.entityIndex;

      this.triggerUpdatePostDataEvent(post, postIndex);
    },

    /**
     * 显示 ActionSheet
     */
    showActionSheet(event) {
      PostActionSheet.showActionSheet(this, event);
    },

    /**
     * ActionSheet 处理
     */
    actionSheetHandler(event) {
      PostActionSheet.actionSheetHandler(event);
    },
  },
});
