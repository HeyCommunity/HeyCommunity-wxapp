const THUMB = require('../../common/thumb/script/index.js');
const PostActionSheet = require('./_post-action-sheet');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    postCommentNum: {
      type: Number,
      value: 0,
    },
    isDetailPage: {
      type: Boolean,
      value: false,
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

      this.selectComponent('.comp-comment-modal').showCommentModal(event);
    },

    /**
     * 显示 PostActionSheet
     */
    showPostActionSheet() {
      PostActionSheet.showActionSheet(this);
    },

    /**
     * PostActionSheet 处理
     */
    postActionSheetHandler(event) {
      PostActionSheet.actionSheetHandler(event);
    },

    /**
     * 评论成功处理
     */
    commentSuccessfulHandler: function (event) {
      this.setData({post: event.detail.entity});
      this.setData({postCommentNum: this.properties.post.comment_num});
    },

    /**
     * 更新 Post 数据
     */
    updatePostDataHandler: function (event) {
      this.setData({post: event.detail.entity});
    },
  },
});
