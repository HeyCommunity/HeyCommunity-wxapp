const APP = getApp();

Page({
  data: {
    defaultProfileWaveImagePath: APP.ENV.apiDomain + '/images/users/profile-wave.gif',
    appGlobalData: null,
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
        }
      ],
    }
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    this.setData({appGlobalData: APP.globalData});

    wx.setNavigationBarTitle({title: APP.globalData.wxappName});

    APP.REQUEST.GET('users/1').then(function(result) {
      _this.setData({userInfo: result.data});
    });
  },
});
