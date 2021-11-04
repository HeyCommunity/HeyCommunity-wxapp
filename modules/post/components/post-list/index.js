Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    posts: Array,
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
     * 显示 评论模态框
     */
    showCommentModal(event) {
      wx.showModal({content: 'call showCommentModal'});
      /*
      this.selectComponent('#comp-comment-modal').showCommentModal({
        entity: event.detail.post,
        entityIndex: event.detail.postIndex,
      });
       */
    },

    /**
     * 隐藏评论模态框
     */
    hideCommentModal() {
      wx.showModal({content: 'call hideCommentModal'});
    },

    /**
     * 点赞处理
     */
    thumbUpHandler() {
      wx.showModal({content: 'call thumbUpHandler'});
    },

    /**
     * 显示动态 ActionSheet
     */
    showPostActionSheet() {
      wx.showModal({content: 'call showPostActionSheet'});
    },

    /**
     * 显示评论 ActionSheet
     */
    showCommentActionSheet() {
      wx.showModal({content: 'call showCommentActionSheet'});
    },
  },
});
