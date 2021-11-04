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

      let params = {
        entity_id: post.id,
        entity_class: this.data.entityClass,
        type: 'thumb_up',
        value: event.currentTarget.dataset.value,
      };

      THUMB.thumbHandler(params, post).then(function() {
        let postKey = 'posts[' + postIndex + ']';
        _this.setData({[postKey]: post});

        _this.triggerUpdatePostDataEvent(post, postIndex);
      });
    },

    /**
     * 显示 评论模态框
     */
    showCommentModal(event) {
      console.log('showCommentModal dataset:', event.currentTarget.dataset);
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
     * 显示动态 ActionSheet
     */
    showPostActionSheet(event) {
      console.log('showPostActionSheet dataset:', event.currentTarget.dataset);
      wx.showModal({content: 'call showPostActionSheet'});
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
