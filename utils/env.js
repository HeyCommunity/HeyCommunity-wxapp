const prodApiDomain = 'https://demo.hey-community.com.cn';
const devApiDomain = 'http://192.168.31.111';

// 配置 apiDomain，默认使用 prodApiDomain
let apiDomain = prodApiDomain;

// 如果是开发版则使用 devApiDomain
let wxAccountInfo = wx.getAccountInfoSync();
if (wxAccountInfo.miniProgram.envVersion === 'develop') {
  apiDomain = devApiDomain;
}

// FOR DEV: 强制使用 prodApiDomain
apiDomain = prodApiDomain;

const apiProHost =  apiDomain + '/api';
module.exports = {
  apiDomain, apiProHost,
};
