// ===========================================================================================
// ===
// === 环境变量配置文件，请不要随意更改
// === 如果你想自定义一些变量，可以把 `/env.local.example.js` 拷贝成 `/evn.local.js` 然后对其进行编辑
// ===
// ===========================================================================================


//
// 设置 HeyCommunity 信息
// ==================================================
let hcInfo = {
  version: 'v.0.2.x',
};


//
// 配置源，默认使用当前文件
// 优先级: (/ext.json) > (/env.local.js) > (/libraries/env.js)
// ==================================================
let extConfig = wx.getExtConfigSync();
let envLocal = {};
try {
  envLocal = require('../env.local.js');
  console.debug('启用 /env.local.js 文件配置');
} catch (exception) {
  console.debug('/env.local.js 不存在，启用 /libraries/env.js 文件配置');
}


//
// 设置 wxappName 和 wxappSlogan
// ==================================================
let wxappName = 'HEY社区';
let wxappSlogan = '简单交流十分美好';
if (extConfig.wxappName) {
  wxappName = extConfig.wxappName;
  wxappSlogan = extConfig.wxappSlogan;
  console.debug('使用 /ext.json wxappName: ' + wxappName);
  console.debug('使用 /ext.json wxappSlogan: ' + wxappSlogan);
} else if (envLocal && envLocal.wxappName) {
  wxappName = envLocal.wxappName;
  wxappSlogan = envLocal.wxappSlogan;
  console.debug('使用 /env.local.js wxappName: ' + wxappName);
  console.debug('使用 /env.local.js wxappSlogan: ' + wxappSlogan);
} else {
  console.debug('使用 /libraries/env.js wxappName: ' + wxappName);
  console.debug('使用 /libraries/env.js wxappSlogan: ' + wxappSlogan);
}


//
// 设置 apiDomain
// ==================================================
let apiDomain = 'https://dev.api.heycommunity.com';
if (extConfig.apiDomain) {
  apiDomain = extConfig.apiDomain;
  console.debug('使用 /ext.json apiDomain: ' + apiDomain);
} else if (envLocal && envLocal.apiDomain) {
  apiDomain = envLocal.apiDomain;
  console.debug('使用 /env.local.js apiDomain: ' + apiDomain);
} else {
  console.debug('使用 /libraries/env.js apiDomain: ' + apiDomain);
}


//
// 设置 apiProHost
// ==================================================
const apiProHost =  apiDomain + '/api';


//
// module exports
// ==================================================
module.exports = {
  hcInfo,
  wxappName, wxappSlogan,
  apiDomain, apiProHost,
};
