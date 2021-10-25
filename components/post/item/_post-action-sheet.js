const HTTP = require('../../../utils/http.js');

let pageThis;
let entity;
let entityId;
let entityClass = '\\Modules\\Post\\Entities\\Post';

let hiddenActionApiPath = 'posts/hidden';
let deleteActionApiPath = 'posts/delete';

let setEntityData = function(entityData) {
  entity = entityData;
  if (pageThis) pageThis.setData({post: entity});
}

let actionSheetActionList = {
  detail: {text: '查看动态详情', value: 'detail', type: 'default'},
  delete: {text: '删除', value: 'delete', type: 'warn'},
  hidden: {text: '下架', value: 'hidden', type: 'warn'},
  report: {text: '报告不良信息', value: 'report', type: 'default'}
};

let userRoleActionSheetActionMaps = {
  guest: ['detail', 'report'],
  user: ['detail', 'report'],
  author: ['detail', 'delete'],
  admin: ['detail', 'report', 'hidden']
};

let makeActionSheetActions = function(userRole, isDetailPage) {
  let actionSheetActions = [];

  let keys = this.data.userRoleActionSheetActionMaps[userRole].slice();
  if (isDetailPage) keys.splice(keys.indexOf('detail'), 1);          // 如果是详情页，则不显示查看详情 Action

  keys.forEach(function(key) {
    actionSheetActions.push(actionSheetActionList[key]);
  });

  return actionSheetActions;
};

let showActionSheet = function(pt) {
  pageThis = pt;
  entity = pageThis.data.post;
  entityId = pageThis.data.post.id;

  pageThis.setData({
    postActionSheetVisible: true,
    postActionSheetActions: [
      {text: '查看动态详情', value: 'detail', type: 'default'},
      {text: '删除', value: 'delete', type: 'warn'},
      {text: '下架', value: 'hidden', type: 'warn'},
      {text: '报告不良信息', value: 'report', type: 'default'}
    ],
  });
};

let hideActionSheet = function(pt) {
  pageThis.setData({
    postActionSheetVisible: false,
    postActionSheetActions: [],
  });
};

let actionSheetHandler = function(event) {
  hideActionSheet();

  let action = event.detail.value;

  switch (action) {
    case 'detail':
      detailActionHandler();
      break;
    case 'hidden':
    case 'delete':
      hiddenAndDeleteActionHandler(action);
      break;
    case 'report':
      reportActionHandler();
      break;
    default:
      wx.showModal({title: '发生错误', content: '未定义的操作', showCancel: false});
      break;
  }
};

/**
 * 查看详情 处理
 */
let detailActionHandler = function() {
  wx.navigateTo({url: '/pages/posts/detail/index?id=' + entityId});
};

/**
 * 下架和删除处理
 */
let hiddenAndDeleteActionHandler = function(actionType) {
  let apiPath;
  let actionTypeName = '未知操作';
  let successfulMessage = '操作成功';

  if (actionType === 'hidden') {
    actionTypeName = '下架';
    successfulMessage = '动态下架成功';
    apiPath = hiddenActionApiPath;
  } else if (actionType === 'delete') {
    actionTypeName = '删除';
    successfulMessage = '动态删除成功';
    apiPath = deleteActionApiPath;
  }

  let confirmHandler = function() {
    wx.showLoading({title: '请稍后'});

    HTTP.POST(apiPath, {id: entityId}).then(function() {
      if (entity.isDetailPage) {
        wx.showModal({
          title: '操作成功',
          content: successfulMessage,
          showCancel: false,
          success(res) {
            // TODO: goback or gotoHomePage
            if (res.confirm) wx.switchTab({url: '/pages/posts/index/index'});
          }
        });
      } else {
        setEntityData(null);
        wx.showToast({title: successfulMessage});
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
};

/**
 * 报告不良信息处理
 */
let reportActionHandler = function() {
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
};

module.exports = {
  showActionSheet,
  actionSheetHandler,
};

