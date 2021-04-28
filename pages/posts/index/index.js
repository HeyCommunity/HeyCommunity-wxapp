const APP = getApp();

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
    APP.HTTP.GET('posts').then(function(result) {
      _this.setData({posts: result.data});
    });

    APP.OnFire.on('newPost', function(post) {
      _this.data.posts.unshift(post);
      _this.setData({posts: _this.data.posts});
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

    // TODO: 请求返回 Thumb，而不是 Post
    APP.HTTP.POST('post-thumbs', params).then((result) => {
      _this.data.posts[postIndex] = result.data;
      _this.setData({posts: _this.data.posts});

      let title = '点赞成功';
      if (! result.data.i_have_thumb_up) title = '取消点赞';
      wx.showToast({title: title, icon: 'none'});
    }).catch(() => {
      wx.showModal({
        title: '点赞失败',
        showCancel: false,
      });
    });
  },

  /**
   * 打开评论弹出层
   */
  openCommentPopup(event) {
    if (getApp().needAuth()) return;

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
    let content = event.detail.value.content;

    if (! content) {
      wx.showModal({
        title: '请说点什么',
        content: '评论内容不能为空',
        showCancel: false,
      });
      throw '请说点什么，评论内容不能为空';
    }

    let params = {
      post_id: postId,
      content: content,
    };

    APP.HTTP.POST('post-comments', params).then((result) => {
      _this.closeCommentPopup();

      if (result.data.status) {
        _this.data.posts[postIndex].comments.unshift(result.data);
        _this.setData({posts: _this.data.posts});

        APP.Notify({type: 'success', message: '评论成功'});
      } else {
        APP.Notify({type: 'warning', message: '评论创建成功 \n 管理员审核通过后将发布'});
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
