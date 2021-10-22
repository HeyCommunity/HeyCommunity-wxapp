const APP = getApp();
const HTTP = require('../../../utils/http');

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {},
  data: {
    pageThis: null,
    post: null,
    postIndex: null,

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
    showPostActionSheet(pageThis, event) {
      let post = event.currentTarget.dataset.post;
      let postIndex = event.currentTarget.dataset.postIndex;

      this.setData({
        post: post,
        postIndex: postIndex,
        pageThis: pageThis,
      });

      let userRole = 'guest';
      if (APP.globalData.isAuth) userRole = 'user';
      if (APP.globalData.isAuth && APP.globalData.userInfo.is_admin) userRole = 'admin';
      if (APP.globalData.isAuth && APP.globalData.userInfo.id === post.user_id) userRole = 'author';

      let keys = this.data.userRoleActionSheetActionMaps[userRole].slice();
      if (postIndex == null) keys.splice(keys.indexOf('detail'), 1);          // 如果是详情页，则不显示查看详情 Action
      let actionSheetActions = this.makeActionSheetActions(keys);

      this.setData({
        actionSheetVisible: true,
        actionSheetActions: actionSheetActions,
      });
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
      let pageThis = this.data.pageThis;

      let actionTypeName = '未知操作';
      if (actionType === 'hidden') actionTypeName = '下架';
      if (actionType === 'delete') actionTypeName = '删除';

      let confirmHandler = function() {
        wx.showLoading({title: '动态' + actionTypeName + '中'});

        let apiPath = 'posts/' + actionType;
        HTTP.POST(apiPath, {id: _this.data.post.id}).then(function(result) {
          if (_this.data.postIndex != null) {
            pageThis.data.models.splice(_this.data.postIndex, 1);
            pageThis.setData({models: pageThis.data.models});
            wx.showToast({title: '动态' + actionTypeName + '成功'});
          } else {
            wx.showModal({
              title: '操作成功',
              content: '动态' + actionTypeName + '成功',
              showCancel: false,
              success(res) {
                if (res.confirm) wx.switchTab({url: '/pages/posts/index/index'});
              }
            });
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
      let _this = this;

      wx.showModal({
        title: '报告不良信息',
        content: '如果你认为这条动态包含不良信息，请向我们报告',
        confirmText: '提交',
        success: function(res) {
          if (res.confirm) {
            let params = {
              entity_class: '\\Modules\\Post\\Entities\\Post',
              entity_id: _this.data.post.id,
            };

            HTTP.POST('user-reports', params).then(function() {
              wx.showModal({title: '报告不良信息', content: '感谢，我们已收到你的报告', showCancel: false});
            });
          }
        },
      });
    },
  },
});
