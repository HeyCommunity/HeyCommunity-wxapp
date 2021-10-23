const THUMB = require('../../common/thumb/script/index.js');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    actionSheetDetailVisible: {
      type: Boolean,
      value: true,
    },
    postCardActionBarVisible: {
      type: Boolean,
      value: true,
    },
    post: Object,
  },
  methods: {
    /**
     * 预览图片
     */
    previewImage(event) {
      let imageIndex = event.currentTarget.dataset.imageIndex;

      wx.previewImage({
        urls: this.properties.post.images.map(image => image.file_path),
        current: this.properties.post.images[imageIndex].file_path,
      });
    },

    /**
     * 点赞处理
     */
    thumbHandler(event) {
      if (getApp().needAuth()) return;

      let _this = this;
      let params = {
        entity_id: event.currentTarget.dataset.entityId,
        entity_class: event.currentTarget.dataset.entityClass,
        type: event.currentTarget.dataset.type,
        value: event.currentTarget.dataset.value,
      };

      THUMB.thumbHandler(params, this.properties.post).then(function() {
        _this.setData({post: _this.properties.post});
      });
    },

    /**
     * 显示评论框
     */
    showCommentModal: function(event) {
      if (getApp().needAuth()) return;

      this.selectComponent('#comp-comment-modal').showCommentModal(event);
    },

    /**
     * 显示 ActionSheet
     */
    showPostActionSheet(event) {
      this.selectComponent('#comp-post-actionSheet').showPostActionSheet(this, event);
    },

    /**
     * 评论成功处理
     */
    commentSuccessfulHandler: function (event) {
      this.setData({post: event.detail.entity});
    },

    /**
     * 更新 Entity 数据
     */
    updatePostDataHandler: function (event) {
      this.setData({post: event.detail.post});
    },
  },
});
