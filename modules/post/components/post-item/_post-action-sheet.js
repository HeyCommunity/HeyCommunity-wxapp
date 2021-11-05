const REQUEST = require('../../../../libraries/request.js');
const REPORT = require('../../../common/report/index.js');

let pageThis;
let entity;
let entityId;
let entityClass = '\\Modules\\Post\\Entities\\Post';

let hiddenActionApiPath = 'posts/hidden';
let deleteActionApiPath = 'posts/delete';

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

let setEntityData = function(entityData) {
  entity = entityData;
  if (pageThis) pageThis.setData({post: entity});
}

/**
 * 显示 ActionSheet
 */
let showActionSheet = function(pt) {
  pageThis = pt;
  entity = pageThis.data.post;
  entityId = pageThis.data.post.id;

  pageThis.setData({
    postActionSheetVisible: true,
    postActionSheetActions: makeActionSheetActions(),
  });
};

/**
 * 隐藏 ActionSheet
 */
let hideActionSheet = function() {
  pageThis.setData({
    postActionSheetVisible: false,
    postActionSheetActions: [],
  });
};

/**
 * ActionSheet 处理
 *
 * @param event
 */
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
  wx.navigateTo({url: '/modules/post/pages/detail/index?id=' + entityId});
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

    REQUEST.POST(apiPath, {id: entityId}).then(function() {
      wx.hideLoading();

      if (entity.isDetailPage) {
        wx.showModal({
          title: '操作成功',
          content: successfulMessage,
          showCancel: false,
          success(res) {
            // TODO: goBack or gotoHomePage
            if (res.confirm) wx.switchTab({url: '/pages/posts/index/index'});
          }
        });
      } else {
        setEntityData(null);
        wx.showToast({title: successfulMessage});
      }
    }).catch(function() {
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
  REPORT.reportHandler(entityClass, entity.id);
};

/**
 * 生成 ActionSheetActions
 */
let makeActionSheetActions = function() {
  let actionSheetActions = [];

  let APP = getApp();
  let userRole = 'guest';
  if (APP.globalData.isAuth) userRole = 'user';
  if (APP.globalData.isAuth && APP.globalData.userInfo.is_admin) userRole = 'admin';
  if (APP.globalData.isAuth && APP.globalData.userInfo.id === entity.user_id) userRole = 'author';

  let keys = userRoleActionSheetActionMaps[userRole].slice();
  if (pageThis.properties.isDetailPage) keys.splice(keys.indexOf('detail'), 1);          // 如果是详情页，则不显示查看详情 Action

  keys.forEach(function(key) {
    actionSheetActions.push(actionSheetActionList[key]);
  });

  return actionSheetActions;
};

module.exports = {
  showActionSheet,
  actionSheetHandler,
};

