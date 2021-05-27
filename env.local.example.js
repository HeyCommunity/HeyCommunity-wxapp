// App Config
const appName = 'HEY社区';

// API list
const prodApiDomain = 'https://dev.hey-community.com.cn';
const trialApiDomain = 'https://dev.hey-community.com.cn';
const devApiDomain = 'https://dev.hey-community.com.cn';
const localApiDomain = 'http://127.0.0.1:8000';

// 设定 API
let apiDomain = prodApiDomain;
// apiDomain = trialApiDomain;
// apiDomain = devApiDomain;
// apiDomain = localApiDomain;

module.exports = {
  apiDomain,
};