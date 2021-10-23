const THUMB = require('../../../common/thumb/script/index.js');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    entity: Object,
    entityId: Number,
    entityClass: String,
  },
  data: {},
  methods: {
    /**
     * 显示评论框
     */
    showCommentModal: function (event) {
      this.selectComponent('.comp-comment-modal').showCommentModal(event);
    },

    /**
     * 点赞处理
     */
    thumbHandler(event) {
      if (getApp().needAuth()) return;

      let _this = this;

      let commentIndex = event.currentTarget.dataset.commentIndex;
      let entity = this.properties.entity.comments[commentIndex];

      let params = {
        entity_id: event.currentTarget.dataset.entityId,
        entity_class: event.currentTarget.dataset.entityClass,
        type: event.currentTarget.dataset.type,
        value: event.currentTarget.dataset.value,
      };

      THUMB.thumbHandler(params, entity).then(function() {
        _this.setData({entity: _this.properties.entity});
      });
    },

    /**
     * 评论成功处理
     */
    commentSuccessfulHandler: function (event) {
      this.setData({entity: event.detail.entity});

      // 更新 entity
      this.triggerEvent('updateEntityDataEvent', {entity: this.properties.entity});
    }
  }
});
