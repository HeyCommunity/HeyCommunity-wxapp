const THUMB = require('../../../common/thumb/script/index.js');

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
    thumbHandler(event) {
      let _this = this;
      let commentIndex = event.currentTarget.dataset.commentIndex;
      let entity = this.properties.entity.comments[commentIndex];

      THUMB.thumbHandler(event, entity).then(function() {
        _this.setData({entity: _this.properties.entity});
      });
    },

    /**
     * 显示评论框
     */
    showCommentModal: function (event) {
      this.selectComponent('.comp-comment-modal').showCommentModal(event);
    },

    /**
     * 评论成功处理
     */
    commentSuccessfulHandler: function (event) {
      this.setData({entity: event.detail.entity});
      this.setData({entityCommentNum: this.properties.entity.comment_num});
    }
  }
});
