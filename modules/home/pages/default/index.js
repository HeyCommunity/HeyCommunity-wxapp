const APP = getApp();

Page({
  data: {
    defaultProfileWaveImagePath: APP.ENV.apiDomain + '/images/users/profile-wave.gif',
    appGlobalData: null,

    sectionHeaderElem: null,
    sectionContentElem: null,


    banners: [
      {id: 1, imagePath: 'https://www.heycommunity.com/images/wxapp/banners/1.png', url: null},
      {id: 2, imagePath: 'https://www.heycommunity.com/images/wxapp/banners/2.png', url: null},
    ],
    community: {
      new_members: [
        {
          user_id: 4,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/FgpZnIOsiUI110pCJ3XPNWPEtukTsjT5RSzVylxs.jpg',
          user_nickname: '2366',
        },
        {
          user_id: 4,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/FgpZnIOsiUI110pCJ3XPNWPEtukTsjT5RSzVylxs.jpg',
          user_nickname: '2366',
        },
        {
          user_id: 4,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/FgpZnIOsiUI110pCJ3XPNWPEtukTsjT5RSzVylxs.jpg',
          user_nickname: '2366',
        },
        {
          user_id: 4,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/FgpZnIOsiUI110pCJ3XPNWPEtukTsjT5RSzVylxs.jpg',
          user_nickname: '2366',
        },
        {
          user_id: 4,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/FgpZnIOsiUI110pCJ3XPNWPEtukTsjT5RSzVylxs.jpg',
          user_nickname: '2366',
        },
        {
          user_id: 4,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/FgpZnIOsiUI110pCJ3XPNWPEtukTsjT5RSzVylxs.jpg',
          user_nickname: '2366',
        },
        {
          user_id: 4,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/FgpZnIOsiUI110pCJ3XPNWPEtukTsjT5RSzVylxs.jpg',
          user_nickname: '2366',
        },
        {
          user_id: 1,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/NUYAmyPXqz5NEPT3ByTpl0kr1Q0yUgDyauAcaNCa.jpg',
          user_nickname: 'Rod',
        },
        {
          user_id: 1,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/NUYAmyPXqz5NEPT3ByTpl0kr1Q0yUgDyauAcaNCa.jpg',
          user_nickname: 'Rod',
        },
        {
          user_id: 1,
          user_avatar: 'https://template.api.heycommunity.com/uploads/users/avatars/NUYAmyPXqz5NEPT3ByTpl0kr1Q0yUgDyauAcaNCa.jpg',
          user_nickname: 'Rod',
        }
      ],
    }
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    APP.authInitedCallback = function() {
      _this.setData({appGlobalData: APP.globalData});
      wx.setNavigationBarTitle({title: APP.globalData.wxappName});
    };


    // 获取动态用于测试
    APP.REQUEST.GET('posts/1').then(function(result) { _this.setData({post: result.data}); });
    APP.REQUEST.GET('posts/1').then(function(result) { _this.setData({post1: result.data}); });
    APP.REQUEST.GET('posts/13').then(function(result) { _this.setData({post2: result.data}); });
    APP.REQUEST.GET('posts/10').then(function(result) { _this.setData({post3: result.data}); });

    APP.REQUEST.GET('activities/1').then(function(result) {
      _this.setData({activity: result.data});
    });

    // 获取数据用于测试
    APP.REQUEST.GET('users/1').then(function(result) {
      _this.setData({userInfo: result.data});
    });
  },

  /**
   * onReady
   */
  onReady() {
    this.setData({
      sectionHeaderElem: () => wx.createSelectorQuery().select('#section-header'),
      sectionContentElem: () => wx.createSelectorQuery().select('#section-content'),
      sectionGoodMembersElem: () => wx.createSelectorQuery().select('#section-good-members'),
      sectionNewMembersElem: () => wx.createSelectorQuery().select('#section-new-members'),
    });
  },

  /**
   * goto 页面
   */
  gotoPage(event) {
    let url = event.currentTarget.dataset.url;

    wx.navigateTo({url: url});
  },

  /**
   * 切换 Tab
   */
  switchTab(event) {
    console.log(event);
    wx.switchTab({
      url: event.currentTarget.dataset.url,
    });
  },
});
