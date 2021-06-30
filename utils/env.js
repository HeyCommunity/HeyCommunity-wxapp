let apiDomain;
const prodApiDomain = 'https://dev.api.heycommunity.com';
const devApiDomain = 'http://127.0.0.1:8000';

// 配置 apiDomain，默认使用 prodApiDomain
apiDomain = prodApiDomain;

// 如果存在 env.local.js，则使用这个文件的 apiDomain
try {
  let envLocal = require('../env.local.js');
  apiDomain = envLocal.apiDomain;
  console.debug('使用 env.local.js apiDomain: ' + apiDomain);
} catch (exception) {
  console.debug('使用 utils/env.js apiDomain: ' + apiDomain);
}

const apiProHost =  apiDomain + '/api';
module.exports = {
  apiDomain, apiProHost,
};
