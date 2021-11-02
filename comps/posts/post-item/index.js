const THUMB = require('../../../components/common/thumb/script/index.js');
const PostActionSheet = require('../../../components/post/item/_post-action-sheet.js');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    post: Object,
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
    postCommentListVisible: {
      type: Boolean,
      value: true,
    },
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
      let _this = this;

      THUMB.thumbHandler(event, this.properties.post).then(function() {
        _this.setData({post: _this.properties.post});
      });
    },

    /**
     * 显示评论框
     */
    showCommentModal: function(event) {
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

      // TODO: 订阅微信消息通知
    },
  },
});
