const APP = getApp();
const HTTP = require('../../../utils/http');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    isDetailPage: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    post: null,

    actionSheetVisible: false,
    actionSheetActions: [],

    actionSheetActionList: {
      detail: {text: '查看动态详情', value: 'detail', type: 'default'},
      delete: {text: '删除', value: 'delete', type: 'warn'},
      hidden: {text: '下架', value: 'hidden', type: 'warn'},
      report: {text: '报告不良信息', value: 'report', type: 'default'},
    },
    userRoleActionSheetActionMaps: {
      guest: ['detail', 'report'],
      user: ['detail', 'report'],
      author: ['detail', 'delete'],
      admin: ['detail', 'report', 'hidden'],
    },
  },
  methods: {
    /**
     * 显示 ActionSheet
     */
    showPostActionSheet(pageThis, event) {
      let post = event.currentTarget.dataset.post;

      let userRole = 'guest';
      if (APP.globalData.isAuth) userRole = 'user';
      if (APP.globalData.isAuth && APP.globalData.userInfo.is_admin) userRole = 'admin';
      if (APP.globalData.isAuth && APP.globalData.userInfo.id === post.user_id) userRole = 'author';

      let keys = this.data.userRoleActionSheetActionMaps[userRole].slice();
      if (this.properties.isDetailPage) keys.splice(keys.indexOf('detail'), 1);          // 如果是详情页，则不显示查看详情 Action
      let actionSheetActions = this.makeActionSheetActions(keys);

      this.setData({
        post: post,
        actionSheetVisible: true,
        actionSheetActions: actionSheetActions,
      });
    },
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
     * ActionSheet action 处理
     */
    actionHandler(event) {
      let action = event.detail.value;

      switch (action) {
        case 'detail':
          this.detailActionHandler();
          break;
        case 'hidden':
        case 'delete':
          this.hiddenAndDeleteActionHandler(action);
          break;
        case 'report':
          this.reportActionHandler();
          break;
        default:
          wx.showModal({title: '发生错误', content: '未定义的操作', showCancel: false});
          break;
      }

      this.setData({
        actionSheetVisible: false,
        actionSheetActions: [],
      });
    },

    /**
     * 查看详情 处理
     */
    detailActionHandler() {
      wx.navigateTo({url: '/pages/posts/detail/index?id=' + this.data.post.id});
    },

    /**
     * 下架和删除处理
     */
    hiddenAndDeleteActionHandler(actionType) {
      let _this = this;

      let actionTypeName = '未知操作';
      if (actionType === 'hidden') actionTypeName = '下架';
      if (actionType === 'delete') actionTypeName = '删除';
      let successfulMessage = '动态' + actionTypeName + '成功';

      let confirmHandler = function() {
        wx.showLoading({title: '动态' + actionTypeName + '中'});

        let apiPath = 'posts/' + actionType;
        HTTP.POST(apiPath, {id: _this.data.post.id}).then(function() {
          if (_this.properties.isDetailPage) {
            wx.showModal({
              title: '操作成功',
              content: successfulMessage,
              showCancel: false,
              success(res) { if (res.confirm) wx.switchTab({url: '/pages/posts/index/index'}); }
            });
          } else {
            wx.showToast({title: successfulMessage});
            _this.triggerEvent('updatePostDataEvent', {post: null});
          }
        }).finally(function() {
          wx.hideLoading();
        });
      };

      wx.showModal({
        title: '提示',
        content: '确定要' + actionTypeName + '这条动态？',
        success: function(res) {
          if (res.confirm) confirmHandler();
        },
      });
    },

    /**
     * 报告不良信息处理
     */
    reportActionHandler() {
      let entityClass = '\\Modules\\Post\\Entities\\Post';
      let entityId = this.data.post.id;

      wx.showModal({
        title: '报告不良信息',
        content: '如果该内容包含不良信息，点击「提交报告」向我们进行举报',
        confirmText: '提交报告',
        success: function(res) {
          if (res.confirm) {
            let params = {
              entity_class: entityClass,
              entity_id: entityId,
            };

            HTTP.POST('user-reports', params).then(function() {
              wx.showModal({title: '报告不良信息', content: '感谢，我们已收到你的举报', showCancel: false});
            });
          }
        },
      });
    },
  },
});
