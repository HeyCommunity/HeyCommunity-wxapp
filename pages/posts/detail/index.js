const APP = getApp();

Page({
  data: {
    postId: null,
    post: null,

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
  onLoad(options) {
    let _this = this;

    _this.setData({postId: options.id});
  },

  /**
   * onShow
   */
  onShow() {
    wx.startPullDownRefresh();
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
   * 下拉刷新
   */
  onPullDownRefresh() {
    let _this = this;

    // 获取动态
    APP.HTTP.GET('posts/' + _this.data.postId).then(function(result) {
      _this.setData({post: result.data});
    }).catch(function(res) {
      if (APP.HTTP.wxRequestIsOk(res)) {
        wx.showModal({
          title: '未找到动态',
          content: '动态不存在或已被删除',
          showCancel: false,
          complete(res) {
            wx.navigateBack();
          }
        });
      }
    }).finally(() => {
      wx.stopPullDownRefresh();
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
        _this.data.post.comments[commentIndex].i_have_thumb_up = true;
        _this.data.post.comments[commentIndex].thumb_up_num += 1;
      } else if (result.statusCode === 202) {
        message = '取消点赞成功';
        _this.data.post.comments[commentIndex].i_have_thumb_up = false;
        _this.data.post.comments[commentIndex].thumb_up_num -= 1;
      }

      if (message) {
        _this.setData({post: _this.data.post});
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

      if (result.statusCode === 201 || result.statusCode === 200) {
        message = '点赞成功';
        _this.data.post['i_have_thumb_up'] = true;
        _this.data.post['thumb_up_num'] += 1;
      } else if (result.statusCode === 202) {
        message = '取消点赞成功';
        _this.data.post['i_have_thumb_up'] = false;
        _this.data.post['thumb_up_num'] -= 1;
      }

      if (message) {
        _this.setData({post: _this.data.post});
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
        if (type === 'replyComment') _this.data.post.comments[commentIndex].i_have_comment = true;
        _this.data.post.comments.unshift(result.data);
        _this.data.post.comment_num += 1;
        _this.data.post.i_have_comment = true;
        _this.setData({post: _this.data.post});

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
});
