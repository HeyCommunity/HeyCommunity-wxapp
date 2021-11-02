const THUMB = require('../../../common/thumb/script/index.js');
const CommentActionSheet = require('./_post-action-sheet');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    entityCommentNum: {
      type: Number,
      value: 0,
    },
    entity: Object,
    entityId: Number,
    entityClass: String,
  },
  data: {},
  methods: {
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
     * 显示 CommentActionSheet
     */
    showCommentActionSheet(event) {
      this.triggerEvent('showCommentActionSheetEvent', event.currentTarget.dataset);
    },
  }
});
