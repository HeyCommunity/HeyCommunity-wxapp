const THUMB = require('../../common/thumb/script/index.js');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    posts: Array,
  },
  data: {},
  methods: {
    /**
     * 点赞处理
     */
    thumbHandler(event) {
      // THUMB.thumbHandler(event, this);

      if (getApp().needAuth()) return;

      let _this = this;
      let currentTarget = event.detail.currentTarget ? event.detail.currentTarget : event.currentTarget;
      let params = {
        entity_id: currentTarget.dataset.entityId,
        entity_class: currentTarget.dataset.entityClass,
        type: currentTarget.dataset.type,
        value: currentTarget.dataset.value,
      };

      let modelIndex = currentTarget.dataset.modelIndex;
      let commentIndex = currentTarget.dataset.commentIndex;

      let entity = this.properties.posts[modelIndex];
      if (commentIndex != null) entity = this.properties.posts[modelIndex].comments[commentIndex];

      THUMB.thumbRequest(params).then(function(result) {
        let message;

        if (result.statusCode === 201 || result.statusCode === 200) {
          message = '点赞成功';
          entity.i_have_thumb_up = true;
          entity.thumb_up_num += 1;
        } else if (result.statusCode === 202) {
          message = '取消点赞';
          entity.i_have_thumb_up = false;
          entity.thumb_up_num -= 1;
        }

        _this.setData({posts: _this.properties.posts});

        if (message) wx.showToast({title: message});
      });
    },

    /**
     * 打开评论弹出层
     */
    showCommentModal(event) {
      this.selectComponent('#comp-comment-modal').showCommentModal(this, event);
    },

    /**
     * 显示 ActionSheet
     */
    showPostActionSheet(event) {
      this.selectComponent('#comp-post-actionSheet').showPostActionSheet(this, event);
    },
  },
});
