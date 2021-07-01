const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    skeletonVisible: true,
    model: null,
    models: [],
    apiPath: 'posts',
    currentPage: 1,
    lastPage: null,
    refreshLoading: false,
    moreLoading: false,
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    // 获取动态
    setTimeout(function() {
      _this.setData({appGlobalData: APP.globalData});

      _this.getPageModels().then(function() {
        _this.setData({skeletonVisible: false});
      });
    }, 2000);

    APP.OnFire.on('newPost', function(post) {
      _this.data.models.unshift(post);
      _this.setData({models: _this.data.models});
    });
  },

  /**
   * onShow
   */
  onShow() {
    let _this = this;

    _this.setData({appGlobalData: APP.globalData});

    // 暂停当前视频
    let compPostList = this.selectComponent('#comp-post-list');
    if (compPostList) compPostList.pauseCurrentVideo();
  },

  /**
   * goto HeyCommunityPage
   */
  gotoHeyCommunityPage() {
    wx.navigateTo({url: '/pages/users/hey-community/index'});
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    wx.showLoading({title: '刷新中'});
    _this.getPageModels(1).finally(function() {
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

      this.getPageModels(this.data.currentPage + 1).finally(function() {
        // wx.hideLoading();
        _this.setData({moreLoading: false});
      });
    }
  },

  /**
   * 获取 models
   */
  getPageModels(pageNum) {
    let _this = this;
    if (! pageNum) pageNum = _this.data.currentPage;

    return new Promise(function(resolve, reject) {
      APP.HTTP.GET(_this.data.apiPath, {page: pageNum}).then(function(result, res) {
        if (result.meta.current_page === 1) _this.data.models = [];
        _this.data.models = _this.data.models.concat(result.data);
        _this.setData({models: _this.data.models});

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
   * 分享
   */
  onShareAppMessage() {
  },
});
