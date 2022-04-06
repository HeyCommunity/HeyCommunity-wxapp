const THUMB = require('../../../common/thumb/index.js');
const PostActionSheet = require('./_post-action-sheet.js');

Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true,
  },
  properties: {
    post: Object,
    postIndex: Number,

    contentFullText: {
      type: Boolean,
      value: false,
    },
    actionBarVisible: {
      type: Boolean,
      value: true,
    },
  },
  data: {
    entityClass: 'Modules\\Post\\Entities\\Post',
  },
  methods: {
    /**
     * 触发更新 post 事件
     */
    triggerUpdatePostDataEvent() {
      this.triggerEvent('updatePostDataEvent', {post: this.data.post, postIndex: this.data.postIndex});
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

      let params = {
        entity_id: this.data.post.id,
        entity_class: this.data.entityClass,
        type: 'thumb_up',
        value: event.currentTarget.dataset.value,
      };

      THUMB.thumbHandler(params, this.data.post).then(function() {
        _this.setData({post: _this.data.post});

        _this.triggerUpdatePostDataEvent();
      });
    },

    /**
     * 显示评论模态框
     */
    showCommentFormModal(event) {
      this.triggerEvent('showCommentFormModalEvent', {postIndex: this.data.postIndex});
    },

    /**
     * 显示 ActionSheet
     */
    showActionSheet(event) {
      console.log('showActionSheet dataset:', event.currentTarget.dataset);

      PostActionSheet.showActionSheet(this);
    },

    /**
     * ActionSheet 处理
     */
    actionSheetHandler(event) {
      PostActionSheet.actionSheetHandler(event);
    },
  },
});
