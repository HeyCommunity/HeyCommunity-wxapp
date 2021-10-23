const THUMB = require('../../common/thumb/script/index.js');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    post: Object,
  },
  data: {
    md: 'mdmdmd',
  },
  methods: {
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
