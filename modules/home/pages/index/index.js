const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    banners: [
      {id: 1, imagePath: 'https://www.heycommunity.com/images/wxapp/banners/1.png', url: null},
      {id: 2, imagePath: 'https://www.heycommunity.com/images/wxapp/banners/2.png', url: null},
    ],
    articles: [],
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;
    this.setData({appGlobalData: APP.globalData});

    APP.REQUEST.GET('articles/latest-5').then(function(result) {
      _this.setData({articles: result.data});
    });
  },

  /**
   * goto 文章列表页
   */
  gotoArticleIndexPage() {
    this.pageRouter.switchTab({url: '/modules/article/pages/index/index'});
  },

  /**
   * goto 横幅详情页
   */
  gotoBannerDetailPage(event) {
    let url = event.currentTarget.dataset.url;

    if (url) this.pageRouter.switchTab({url: url});
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    console.log('eee', this.data.appGlobalData.wxappName)
    return {
      title: this.data.appGlobalData.wxappName + ': ' + this.data.appGlobalData.wxappSlogan,
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: this.data.appGlobalData.wxappName + ': ' + this.data.appGlobalData.wxappSlogan,
    };
  },
});
