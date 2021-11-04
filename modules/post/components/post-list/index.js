const THUMB = require('../../../common/thumb/index.js');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    posts: Array,
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
      console.log('thumbUpHandler dataset:', event.currentTarget.dataset);

      let _this = this;
      let postIndex = event.currentTarget.dataset.postIndex;
      let post = this.data.posts[postIndex];
      let value = event.currentTarget.dataset.value;

        let params = {
        entity_id: post.id,
        entity_class: this.data.entityClass,
        type: 'thumb_up',
        value: value,
      };

      THUMB.thumbHandler(params, post).then(function() {
        let postKey = 'posts[' + postIndex + ']';
        _this.setData({[postKey]: post});

        _this.triggerUpdatePostDataEvent(post, postIndex);
      });
    },

    /**
     * 显示 动态的评论模态框
     */
    showPostCommentModal(event) {
      console.log('showPostCommentModal dataset:', event.currentTarget.dataset);

      let postIndex = event.currentTarget.dataset.postIndex;
      let post = this.data.posts[postIndex];

      this.selectComponent('#comp-comment-modal').showCommentModal({
        entity: post,
        entityIndex: postIndex,
        entityClass: this.data.entityClass,
      });
    },

    /**
     * 评论成功处理
     */
    commentSuccessfulHandler(event) {
      console.log('commentSuccessfulHandler event:', event);

      let post = event.detail.entity;
      let postIndex = event.detail.entityIndex;

      let postKey = 'posts[' + postIndex + ']';
      this.setData({[postKey]: post});

      this.triggerUpdatePostDataEvent(post, postIndex);
    },

    /**
     * 显示动态 ActionSheet
     */
    showPostActionSheet(event) {
      console.log('showPostActionSheet dataset:', event.currentTarget.dataset);
      wx.showModal({content: 'call showPostActionSheet'});
    },

    /**
     * 评论 点赞处理
     */
    commentThumbUpHandler(event) {
      console.log('commentThumbUpHandler dataset:', event.currentTarget.dataset);

      let _this = this;
      let postIndex = event.currentTarget.dataset.entityIndex;
      let post = this.data.posts[postIndex];
      let commentIndex = event.currentTarget.dataset.commentIndex;
      let comment = post.comments[commentIndex];
      let entityClass = 'App\\Models\\Common\\Comment';
      let value = event.currentTarget.dataset.value;

      let params = {
        entity_id: comment.id,
        entity_class: entityClass,
        type: 'thumb_up',
        value: value,
      };

      THUMB.thumbHandler(params, comment).then(function() {
        let postKey = 'posts[' + postIndex + ']';
        _this.setData({[postKey]: post});

        _this.triggerUpdatePostDataEvent(post, postIndex);
      });
    },

    /**
     * 显示 回复评论模态框
     */
    showReplyCommentModal(event) {
      console.log('showReplyCommentModal dataset:', event.currentTarget.dataset);
      wx.showModal({content: 'call showReplyCommentModal'});
    },

    /**
     * 显示评论 ActionSheet
     */
    showCommentActionSheet(event) {
      console.log('showCommentActionSheet dataset:', event.currentTarget.dataset);
      wx.showModal({content: 'call showCommentActionSheet'});
    },
  },
});
