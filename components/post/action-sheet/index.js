Component({
  options: {
    addGlobalClass: true,
  },
  properties: {},
  data: {
    post: null,
    postIndex: null,

    actionSheetVisible: false,
    actionSheetActions: [],

    actionSheetActionList: {
      detail: {text: '查看动态详情', value: 'detail'},
      delete: {text: '删除', value: 'delete', type: 'warn'},
      hidden: {text: '下架', value: 'hidden', type: 'warn'},
      report: {text: '报告不良信息', value: 'report', type: 'warn'},
    },
  },
  methods: {
    /**
     * 生成
     */
    makeActionSheetActions(keys) {
      let _this = this;
      let actionSheetActions = [];

      keys.forEach(function(key) {
        actionSheetActions.push(_this.data.actionSheetActionList[key]);
      });

      return actionSheetActions;
    },

    /**
     * 显示 ActionSheet
     */
    showPostActionSheet() {
      let actionSheetActions = [];

      actionSheetActions = this.makeActionSheetActions(['detail', 'report']);

      this.setData({
        actionSheetVisible: true,
        actionSheetActions: actionSheetActions,
      });
    },

    /**
     * ActionSheet action 处理
     */
    actionHandler(event) {
      console.log('actionHandler', event);
    },
  },
});
