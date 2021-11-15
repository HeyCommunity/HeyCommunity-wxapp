//
// 微信小程序名称和口号
// ==================================================
const wxappName = 'HEY社区';
const wxappSlogan = '简单交流十分美好';


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
  wxappName, wxappSlogan,
  apiDomain,
};
