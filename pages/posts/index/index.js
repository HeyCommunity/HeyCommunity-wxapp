const APP = getApp();
const MODEL = require('../../../utils/model.js');
const THUMB = require('../../../components/common/thumb/index.js');

Page({
  data: {
    appGlobalData: null,
    models: [],
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    MODEL.init(_this, 'posts');

    // 延后 1 秒，以便 app.js 中获取 token 后再请求动态
    setTimeout(function() {
      _this.setData({appGlobalData: APP.globalData});

      MODEL.getFirstPageModels();
    }, 1000);
  },

  /**
   * onShow
   */
  onShow() {
    this.setData({appGlobalData: APP.globalData});
    MODEL.getFirstPageModels();
  },

  /**
   * goto 页面
   */
  gotoPageByUrl(event) {
    let url = event.currentTarget.dataset.url;

    wx.navigateTo({url: url});
  },

  /**
   * 点赞处理
   */
  thumbHandler(event) {
    let _this = this;
    let modelIndex = event.currentTarget.dataset.modelIndex;
    let commentIndex = event.currentTarget.dataset.commentIndex;

    // 动态点赞回调
    let postThumbCallback = function(result) {
      let message;

      if (result.statusCode === 201 || result.statusCode === 200) {
        message = '点赞成功';
        _this.data.models[modelIndex].i_have_thumb_up = true;
        _this.data.models[modelIndex].thumb_up_num += 1;
        _this.setData({models: _this.data.models});
      } else if (result.statusCode === 202) {
        message = '取消点赞';
        _this.data.models[modelIndex].i_have_thumb_up = false;
        _this.data.models[modelIndex].thumb_up_num -= 1;
        _this.setData({models: _this.data.models});
      }

      if (message) wx.showToast({title: message});
    }

    // 动态评论点赞回调
    let postCommentThumbCallback = function(result) {
      let message;

      if (result.statusCode === 201 || result.statusCode === 200) {
        message = '点赞成功';
        _this.data.models[modelIndex].comments[commentIndex].i_have_thumb_up = true;
        _this.data.models[modelIndex].comments[commentIndex].thumb_up_num += 1;
        _this.setData({models: _this.data.models});
      } else if (result.statusCode === 202) {
        message = '取消点赞';
        _this.data.models[modelIndex].comments[commentIndex].i_have_thumb_up = false;
        _this.data.models[modelIndex].comments[commentIndex].thumb_up_num -= 1;
        _this.setData({models: _this.data.models});
      }

      if (message) wx.showToast({title: message});
    }

    THUMB.thumbHandler(event, this);
  },

  /**
   * 打开评论弹出层
   */
  showCommentModal(event) {
    this.selectComponent('#comp-comment').showCommentModal(this, event);
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    MODEL.getFirstPageModels().finally(function() {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 下拉加载更多
   */
  onReachBottom() {
    MODEL.getNextPageModels();
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: this.data.appGlobalData.wxappName + '动态列表',
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    let imageUrl = null;

    return {
      title: this.data.appGlobalData.wxappName + '动态列表',
    };
  },
});
