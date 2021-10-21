Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    comments: Array,
    model: Object,
    modelIndex: Number,
    entityClass: String,
  },
  data: {},
  methods: {
    showCommentModal: function(event) {
      this.triggerEvent('showCommentModalEvent', event);
    },

    thumbHandler: function(event) {
      this.triggerEvent('thumbHandlerEvent', event);
    },
  }
});
