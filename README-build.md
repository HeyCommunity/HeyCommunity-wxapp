构建 HeyCommunity-wxapp
================================

`HeyCommunity-wxapp` 是小程序端项目。在微信开发者工具中导入此项目，即可体验预览。   
如有需要按以下步骤进行配置。

## 更换 API

复制 `/env.local.example.js` 为 `/env.local.js`，并修改文件中 `apiDomain` 变量值为你的 `apiDomain` 地址。   
默认使用我们提供的 `devApiDomain`。如有需要可自主部署 API。   
API 项目地址: https://github.com/HeyCommunity/HeyCommunity-core    
API 项目部署文档: https://github.com/HeyCommunity/HeyCommunity-core/blob/dev-master/README-deploy.md

## 配置 talkingData（非必须）

talkingData 用于小程序的统计和分析，默认已启用，用于观察此开源项目的流行度。   
更多配置和使用信息请移步 -> https://www.talkingdata.com
