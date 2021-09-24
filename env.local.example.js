//
// 微信小程序名称
// ==================================================
const wxappName = 'HEY社区';


//
// API Domain
// ==================================================
let apiDomain;
const prodApiDomain = 'https://dev.api.heycommunity.com';
const devApiDomain = 'https://dev.api.heycommunity.com';
const localApiDomain = 'http://127.0.0.1:8000';

// 自定义 apiDomain
apiDomain = prodApiDomain;


//
// module exports
// ==================================================
module.exports = {
  appName,
  apiDomain,
};
