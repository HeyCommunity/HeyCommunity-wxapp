let wxAppid = 'wxbfb0f224688b7291';
let appKey = '6D435BFFDA5D474693562AA93982AE80';
let appName = 'HEY社区';
let versionName = 'DEV';
let versionCode = '0.1.x';

try {
  let envLocal = require('../../env.local.js');

  if (envLocal.tdConfig) {
    if (envLocal.tdConfig.wxAppid) wxAppid = envLocal.tdConfig.wxAppid;
    if (envLocal.tdConfig.appKey) appKey = envLocal.tdConfig.appKey;
    if (envLocal.tdConfig.appName) appName = envLocal.tdConfig.appName;
    if (envLocal.tdConfig.versionName) versionName = envLocal.tdConfig.versionName;
    if (envLocal.tdConfig.versionCode) versionCode = envLocal.tdConfig.versionCode;
  }
} catch (exception) {
}

exports.config = {
  appkey: appKey,
  appName: appName,
  versionName: versionName,
  versionCode: versionCode,
  wxAppid: wxAppid,
  getLocation: false,                   // 默认不获取用户位置
  autoOnPullDownRefresh: true,          // 默认不统计下拉刷新数据
  autoOnReachBottom: true               // 默认不统计页面触底数据
};
