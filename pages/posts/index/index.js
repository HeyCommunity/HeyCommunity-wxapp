const APP = getApp();

Page({
  data: {
    appGlobalData: null,
    posts: [],

    commentPopupVisible: false,
    commentPopupContent: null,
    commentPopupType: null,
    commentPopupPostIndex: null,
    commentPopupPostId: null,
    commentPopupCommentIndex: null,
    commentPopupCommentId: null,
  },

  /**
   * onLoad
   */
  onLoad() {
    let _this = this;

    // 获取动态
    APP.authInitedCallback = function() {
      _this.setData({appGlobalData: APP.globalData});
      
      APP.HTTP.GET('posts').then(function(result) {
        _this.setData({posts: result.data});
      });
    }

    APP.OnFire.on('newPost', function(post) {
      _this.data.posts.unshift(post);
      _this.setData({posts: _this.data.posts});
    });
  },

  /**
   * onShow
   */
  onShow() {
    let _this = this;

    _this.setData({appGlobalData: APP.globalData});
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
    if (getApp().needAuth()) return;

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

    APP.HTTP.POST('post-thumbs', params).then((result) => {
      let message = null;

      if (result.statusCode === 201) {
        message = '点赞成功';
        _this.data.posts[postIndex]['i_have_thumb_up'] = true;
        _this.data.posts[postIndex]['thumb_up_num'] += 1;
      } else if (result.statusCode === 202) {
        message = '取消点赞成功';
        _this.data.posts[postIndex]['i_have_thumb_up'] = false;
        _this.data.posts[postIndex]['thumb_up_num'] -= 1;
      }

      if (message) {
        _this.setData({posts: _this.data.posts});
        APP.showNotify(message);
      }
    }).catch(() => {
      wx.showModal({
        title: value ? '点赞失败' : '取消点赞失败',
        showCancel: false,
      });
    });
  },

  /**
   * BaseThumbUpHandler
   */
  baseThumbUpHandler(apiPath, params) {
    return new Promise(function(resolve, reject) {
      APP.HTTP.POST(apiPath, params).then(function(result) {
        resolve(result);
      }).catch(function(res) {
        wx.showModal({
          title: params.value ? '点赞失败' : '取消点赞失败',
          showCancel: false,
        });

        reject(res);
      });
    });
  },


  /**
   * 动态评论点赞
   */
  postCommentThumbUpHandler(event) {
    if (getApp().needAuth()) return;

    let _this = this;
    let postIndex = event.currentTarget.dataset.postIndex;
    let commentIndex = event.currentTarget.dataset.commentIndex;
    let commentId = event.currentTarget.dataset.commentId;
    let type = event.currentTarget.dataset.type;
    let value = event.currentTarget.dataset.value;

    let params = {
      comment_id: commentId,
      type: type,
      value: value,
    };

    this.baseThumbUpHandler('post-comment-thumbs', params).then(function(result) {
      let message = null;

      if (result.statusCode === 201) {
        message = '点赞成功';
        _this.data.posts[postIndex].comments[commentIndex].i_have_thumb_up = true;
        _this.data.posts[postIndex].comments[commentIndex].thumb_up_num += 1;
      } else if (result.statusCode === 202) {
        message = '取消点赞成功';
        _this.data.posts[postIndex].comments[commentIndex].i_have_thumb_up = false;
        _this.data.posts[postIndex].comments[commentIndex].thumb_up_num -= 1;
      }

      if (message) {
        _this.setData({posts: _this.data.posts});
        APP.showNotify(message);
      }
    });
  },


  /**
   * 动态点赞
   */
  postThumbUpHandler(event) {
    if (getApp().needAuth()) return;

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

    this.baseThumbUpHandler('post-thumbs', params).then(function(result) {
      let message = null;

      if (result.statusCode === 201) {
        message = '点赞成功';
        _this.data.posts[postIndex]['i_have_thumb_up'] = true;
        _this.data.posts[postIndex]['thumb_up_num'] += 1;
      } else if (result.statusCode === 202) {
        message = '取消点赞成功';
        _this.data.posts[postIndex]['i_have_thumb_up'] = false;
        _this.data.posts[postIndex]['thumb_up_num'] -= 1;
      }

      if (message) {
        _this.setData({posts: _this.data.posts});
        APP.showNotify(message);
      }
    });
  },

  /**
   * 打开评论弹出层
   */
  openCommentPopup(event) {
    if (getApp().needAuth()) return;

    let type = event.currentTarget.dataset.type;
    let postIndex = event.currentTarget.dataset.postIndex;
    let postId = event.currentTarget.dataset.postId;
    let commentIndex = event.currentTarget.dataset.commentIndex;
    let commentId = event.currentTarget.dataset.commentId;

    this.setData({
      commentPopupVisible: true,
      commentPopupType: type,
      commentPopupPostIndex: postIndex,
      commentPopupPostId: postId,
      commentPopupCommentIndex: commentIndex,
      commentPopupCommentId: commentId,
    });
  },

  /**
   * 关闭评论弹出层
   */
  closeCommentPopup() {
    this.setData({
      commentPopupVisible: false,
      commentPopupContent: null,
      commentPopupType: null,
      commentPopupPostIndex: null,
      commentPopupPostId: null,
      commentPopupCommentIndex: null,
      commentPopupCommentId: null,
    });
  },

  /**
   * 评论
   */
  commentHandler(event) {
    let _this = this;

    let type = this.data.commentPopupType;
    let postIndex = this.data.commentPopupPostIndex;
    let postId = this.data.commentPopupPostId;
    let commentIndex = this.data.commentPopupCommentIndex;
    let commentId = this.data.commentPopupCommentId;
    let content = event.detail.value.content;

    if (! content) {
      wx.showModal({
        title: '请说点什么',
        content: '内容不能为空',
        showCancel: false,
      });
      throw '请说点什么，内容不能为空';
    }

    // 请求参数
    let params = {content: content};
    if (type === 'comment') params.post_id = postId;
    if (type === 'replyComment') params.comment_id = commentId;

    APP.HTTP.POST('post-comments', params).then((result) => {
      _this.closeCommentPopup();

      if (result.data.status) {
        if (type === 'replyComment') _this.data.posts[postIndex].comments[commentIndex].i_have_comment = true;
        _this.data.posts[postIndex].comments.unshift(result.data);
        _this.data.posts[postIndex].comment_num += 1;
        _this.data.posts[postIndex].i_have_comment = true;
        _this.setData({posts: _this.data.posts});

        APP.showNotify('评论成功');
      } else {
        APP.showNotify('评论创建成功 \n 管理员审核通过后将发布', 'warning');
      }
    }).catch(() => {
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
    APP.HTTP.GET('posts').then((result) => {
      _this.setData({posts: result.data});
    }).finally(() => {
      wx.stopPullDownRefresh();
    });
  },
});
