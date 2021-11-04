const APP = getApp();
const REQUEST = require('../../../../../libraries/request.js');
const THUMB = require('../../../../common/thumb/index.js');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    entityIndex: null,
    comments: Array,
  },
  data: {
    entityClass: 'App\\Models\\Common\\Comment',
  },
  methods: {
    /**
     * 点赞处理
     */
    thumbUpHandler(event) {
      console.log('thumbUpHandler dataset:', event.currentTarget.dataset);

      let _this = this;

      let commentIndex = event.currentTarget.dataset.commentIndex;
      let comment = this.data.comments[commentIndex];
      let entityClass = this.data.entityClass;
      let value = event.currentTarget.dataset.value;

      let params = {
        entity_id: comment.id,
        entity_class: entityClass,
        type: 'thumb_up',
        value: value,
      };

      THUMB.thumbHandler(params, comment).then(function() {
        // _this.setData({comments: _this.data.comments});

        _this.triggerEvent('updateCommentsDataEvent', {
          entityIndex: _this.data.entityIndex,
          comments: _this.data.comments,
        });
      });
    },

    /**
     * 显示评论框
     */
    showCommentFormModal(event) {
      this.triggerEvent('showCommentFormModalEvent', {
        entityIndex: this.data.entityIndex,
        commentIndex: event.currentTarget.dataset.commentIndex,
        targetUserNickname: event.currentTarget.dataset.targetUserNickname,
      });
    },
  },
});
