const prodApiDomain = 'https://api.hey-community.com.cn';

// 配置 apiDomain
let apiDomain = 'http://192.168.31.111';
// apiDomain = 'https://api.hey-community.com.cn';

// 如果是线上产品则使用 prodApiDomain
let wxAccountInfo = wx.getAccountInfoSync();
if (wxAccountInfo.miniProgram.envVersion === 'release'
  || wxAccountInfo.miniProgram.envVersion === 'trial') {
  apiDomain = prodApiDomain;
}

const apiProHost =  apiDomain + '/api';

module.exports = {
  apiDomain, apiProHost,
};
