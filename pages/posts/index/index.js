const HTTP = require('../../../utils/http.js');

Page({
  data: {
    posts: [],

    commentPopupVisible: false,
    commentPopupPostIndex: null,
    commentPopupPostId: null,
    commentPopupContent: null,
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    // 获取动态
    HTTP.httpGet('posts', {}, function(data) {
      _this.setData({posts: data});
    });
  },

  /**
   * goto 发布动态页面
   */
  gotoCreatePage() {
    if (getApp().needAuth()) return;

    wx.navigateTo({url: '/pages/posts/create/index'});
  },

  /**
   * 预览图片
   */
  previewImage(event) {
    wx.previewImage({
      urls: event.currentTarget.dataset.urls.map(image => image.file_path),
      current: event.currentTarget.dataset.url,
    });
  },

  /**
   * 点赞
   */
  thumbUpHandler(event) {
    let _this = this;
    let postIndex = event.currentTarget.dataset.postIndex;
    let postId = event.currentTarget.dataset.postId;
    let type = event.currentTarget.dataset.type;
    let value = event.currentTarget.dataset.value;

    let params = {
      post_id: postId,
      type: type,
      value: value,
    };

    HTTP.httpPost('post-thumbs', params, function(data) {
      _this.data.posts[postIndex] = data;
      _this.setData({posts: _this.data.posts});

      let title = '点赞成功';
      if (! data.i_have_thumb_up) title = '取消点赞';
      wx.showToast({title: title, icon: 'none'});
    });
  },

  /**
   * 打开评论弹出层
   */
  openCommentPopup(event) {
    let postIndex = event.currentTarget.dataset.postIndex;
    let postId = event.currentTarget.dataset.postId;

    this.setData({
      commentPopupVisible: true,
      commentPopupPostIndex: postIndex,
      commentPopupPostId: postId,
    });
  },

  /**
   * 关闭评论弹出层
   */
  closeCommentPopup() {
    this.setData({
      commentPopupVisible: false,
      commentPopupPostIndex: null,
      commentPopupPostId: null,
      commentPopupContent: null,
    });
  },

  /**
   * 评论
   */
  commentHandler(event) {
    let _this = this;
    let postIndex = this.data.commentPopupPostIndex;
    let postId = this.data.commentPopupPostId;
    let content = this.data.commentPopupContent;

    let params = {
      post_id: postId,
      content: content,
    };

    HTTP.httpPost('post-comments', params, function(data) {
      _this.data.posts[postIndex] = data;
      _this.setData({posts: _this.data.posts});

      _this.closeCommentPopup();
      wx.showToast({title: '评论成功', icon: 'none'});
    }, function() {
      wx.showModal({
        title: '评论失败',
        showCancel: false,
      });
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    // 获取动态
    HTTP.httpGet('posts', {}, function(data) {
      _this.setData({posts: data});
      wx.stopPullDownRefresh();
    });
  },
});
