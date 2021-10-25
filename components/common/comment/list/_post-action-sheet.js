const HTTP = require('../../../../utils/http.js');
const REPORT = require('../../report/index.js');

let pageThis;
let commentIndex;
let entity;
let entityClass = '\\App\\Models\\Common\\Comment';

let deleteActionApiPath = 'comments/delete';

let actionSheetActionList = {
  delete: {text: '删除', value: 'delete', type: 'warn'},
  report: {text: '报告不良信息', value: 'report', type: 'default'}
};

let userRoleActionSheetActionMaps = {
  guest: ['report'],
  user: ['report'],
  author: ['delete'],
  admin: ['report', 'delete']
};

let setEntityData = function() {
  if (pageThis) pageThis.setData({entity: pageThis.entity});
}

/**
 * 显示 ActionSheet
 */
let showActionSheet = function(pt, event) {
  pageThis = pt;
  commentIndex = event.currentTarget.dataset.commentIndex;
  entity = pageThis.data.entity.comments[commentIndex];

  console.log('sss', commentIndex, entity);

  pageThis.setData({
    commentActionSheetVisible: true,
    commentActionSheetActions: makeActionSheetActions(),
  });
};

/**
 * 隐藏 ActionSheet
 */
let hideActionSheet = function() {
  pageThis.setData({
    commentActionSheetVisible: false,
    commentActionSheetActions: [],
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
    case 'delete':
      deleteActionHandler(action);
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
 * 删除处理
 */
let deleteActionHandler = function(actionType) {
  wx.showModal({
    title: '提示',
    content: '确定要删除这条评论？',
    success: function(res) {
      if (res.confirm) {
        wx.showLoading({title: '请稍后'});

        HTTP.POST(deleteActionApiPath, {id: entity.id}).then(function() {
          entity = null;
          setEntityData();

          wx.showToast({icon: 'none', title: '评论删除成功'});
        }).finally(function() {
          wx.hideLoading();
        });
      }
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

/**
 * module exports
 */
module.exports = {
  showActionSheet,
  actionSheetHandler,
};

