// App Config
const appName = 'HEY社区';

// API list
const prodApiDomain = 'https://dev.api.heycommunity.com';
const devApiDomain = 'https://dev.api.heycommunity.com';
const localApiDomain = 'http://127.0.0.1:8000';

// 设定 API
let apiDomain = prodApiDomain;
// apiDomain = devApiDomain;
// apiDomain = localApiDomain;

module.exports = {
  apiDomain,
};