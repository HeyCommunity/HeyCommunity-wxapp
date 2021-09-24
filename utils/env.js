// ===========================================================================================
// ===
// === 环境变量配置文件，请不要随意更改
// === 如果你想自定义一些变量，可以把 `/env.local.example.js` 拷贝成 `/evn.local.js` 然后对其进行编辑
// ===
// ===========================================================================================

//
// 设置 wxappName
// 如果存在 env.local.js，则使用这个文件的 appName
// ==================================================
let wxappName = 'HEY社区';
try {
  let envLocal = require('../env.local.js');
  wxappName = envLocal.wxappName;
  console.debug('使用 env.local.js wxappName: ' + wxappName);
} catch (exception) {
  console.debug('使用 utils/env.js wxappName: ' + wxappName);
}


//
// 设置 apiDomain
// 如果存在 env.local.js，则使用这个文件的 apiDomain
// ==================================================
let apiDomain = 'https://dev.api.heycommunity.com';
try {
  let envLocal = require('../env.local.js');
  apiDomain = envLocal.apiDomain;
  console.debug('使用 env.local.js apiDomain: ' + apiDomain);
} catch (exception) {
  console.debug('使用 utils/env.js apiDomain: ' + apiDomain);
}


//
// 设置 apiProHost
// ==================================================
const apiProHost =  apiDomain + '/api';


//
// TalkDataConfig
// ==================================================
module.exports = {
  wxappName,
  apiDomain, apiProHost,
};
