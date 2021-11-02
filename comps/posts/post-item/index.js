const THUMB = require('../../../components/common/thumb/script/index.js');
const PostActionSheet = require('../../../components/post/item/_post-action-sheet.js');

Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true,
  },
  properties: {
    post: Object,
    postIndex: null,

    postActionSheetDetailVisible: {
      type: Boolean,
      value: true,
    },
    actionBarVisible: {
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
    thumbUpHandler(event) {
      this.triggerEvent('thumbUpEvent', event.currentTarget.dataset);
    },

    /**
     * 显示评论框
     */
    showCommentModal: function (event) {
      this.triggerEvent('showCommentModalEvent', event.currentTarget.dataset);
    },

    /**
     * 显示 PostActionSheet
     */
    showPostActionSheet() {
      this.triggerEvent('showPostActionSheetEvent', {postIndex: this.properties.postIndex});
    },
  },
});
