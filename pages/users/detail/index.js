const {apiDomain} = require('../../../utils/env.js');
const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    currentPage: 1,
    lastPage: null,
    refreshLoading: false,
    moreLoading: false,

    defaultUserCoverImagePath: apiDomain + '/images/users/default-cover.jpg',
    defaultProfileWaveImagePath: apiDomain + '/images/users/profile-wave.gif',

    userId: null,
    userInfo: null,

    posts: [],
  },

  /**
   * onLoad
   */
  onLoad(options) {
    let _this = this;

    _this.setData({userId: options.id});
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});

    this.getUserInfo();

    this.getPosts();
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    let _this = this;

    APP.HTTP.GET('users/' + _this.data.userId).then(function(result) {
      _this.setData({userInfo: result.data});

      wx.setNavigationBarTitle({
        title: result.data.nickname,
      });
    });
  },

  /**
   * 获取 posts
   */
  getPosts(pageNum) {
    let _this = this;
    if (! pageNum) pageNum = _this.data.currentPage;

    return new Promise(function(resolve, reject) {
      APP.HTTP.GET('users/' + _this.data.userId + '/posts', {page: pageNum}).then(function(result, res) {
        if (result.meta.current_page === 1) _this.data.posts = [];
        _this.data.posts = _this.data.posts.concat(result.data);
        _this.setData({posts: _this.data.posts});

        _this.setData({
          currentPage: result.meta.current_page,
          lastPage: result.meta.last_page,
        });

        resolve(result, res);
      }).catch(function(result, res) {
        reject(result, res);
      });
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    wx.showLoading({title: '刷新中'});
    _this.getPosts(1).finally(function() {
      wx.stopPullDownRefresh();
      wx.hideLoading();
    });
  },

  /**
   * 下拉加载更多
   */
  onReachBottom() {
    let _this = this;

    if (this.data.currentPage >= this.data.lastPage) {
      wx.showToast({icon: 'none', title: '没有更多数据了'});
    } else {
      // wx.showLoading({title: '加载中'});
      this.setData({moreLoading: true});

      this.getPosts(this.data.currentPage + 1).finally(function() {
        // wx.hideLoading();
        _this.setData({moreLoading: false});
      });
    }
  },
});
