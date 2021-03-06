const THUMB = require('../../../../common/thumb/index.js');
const CommentActionSheet = require('./_comment-action-sheet.js');

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
     * 触发更新 comments 事件
     */
    triggerUpdateCommentsDataEvent(comments) {
      if (comments === undefined) comments = this.data.comments;

      this.triggerEvent('updateCommentsDataEvent', {
        entityIndex: this.data.entityIndex,
        comments: comments,
      });
    },

    /**
     * 点赞处理
     */
    thumbUpHandler(event) {
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
        _this.triggerUpdateCommentsDataEvent();
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

    /**
     * 显示 ActionSheet
     */
    showActionSheet(event) {
      CommentActionSheet.showActionSheet(this, event);
    },

    /**
     * ActionSheet 处理
     */
    actionSheetHandler(event) {
      CommentActionSheet.actionSheetHandler(event);
    },
  },
});
