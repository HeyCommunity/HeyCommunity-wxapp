const APP = getApp();

Page({
  data: {
    model: null,

    tabType: 'comment',

    // 动态评论操作
    postCommentActionComment: null,
    postCommentActionCommentIndex: null,
    postCommentActionSheetVisible: false,
    postCommentActions: [],
    userPostCommentActions: [
      {text: '报告不良信息', value: 'report', type: 'warn'},
    ],
    authorPostCommentActions: [
      {text: '删除', value: 'delete', type: 'warn'},
    ],
    adminPostCommentActions: [
      {text: '报告不良信息', value: 'report', type: 'warn'},
      {text: '删除', value: 'delete', type: 'warn'},
    ],
  },

  /**
   * onLoad
   */
  onLoad(options) {
    this.setData({modelId: options.id});

    wx.showLoading({title: '加载中'});
    APP.MODEL.getModel(this, 'posts/' + this.data.modelId).finally(function() {
      wx.hideLoading();
    });
  },

  /**
   * onShow
   */
  onShow() {
    APP.MODEL.getModel(this, 'posts/' + this.data.modelId);
  },

  /**
   * 进入用户主页
   */
  gotoUserDetailPage(event) {
    let userId = event.currentTarget.dataset.id;

    wx.navigateTo({url: '/pages/users/detail/index?id=' + userId});
  },

  /**
   * Tab 切换处理
   */
  tabSelectHandler(event) {
    this.setData({tabType: event.currentTarget.dataset.type});
  },

  /**
   * 动态点赞处理
   */
  postThumbHandler(event) {
    this.selectComponent('#comp-post-api').postThumbHandler(this, event);
  },

  /**
   * 评论点赞处理
   */
  postCommentThumbHandler(event) {
    this.selectComponent('#comp-post-api').postThumbHandler(this, event);
  },

  /**
   * 打开评论弹出层
   */
  showCommentModal(event) {
    this.selectComponent('#comp-post-api').showCommentModal(this, event);
  },

  /**
   * 显示动态评论的 actionSheet
   */
  showPostCommentActionSheet(event) {
    let _this = this;
    let comment = event.currentTarget.dataset.comment;
    let commentIndex = event.currentTarget.dataset.commentIndex;

    let actions = _this.data.userPostCommentActions;
    if (APP.globalData.isAuth) {
      if (APP.globalData.userInfo.id == comment.user_id) {
        actions = _this.data.authorPostCommentActions;
      } else if (APP.globalData.userInfo.is_admin) {
        actions = _this.data.adminPostCommentActions;
      }
    }

    _this.setData({
      postCommentActionSheetVisible: true,
      postCommentActions: actions,
      postCommentActionComment: comment,
      postCommentActionCommentIndex: commentIndex,
    });
  },

  /**
   * 动态评论 ActionSheet 操作处理
   */
  postCommentActionTapHandler(event) {
    let _this = this;
    let action = event.detail.value;
    let comment = _this.data.postCommentActionComment;
    let commentIndex = _this.data.postCommentActionCommentIndex;

    if (action === 'report') {
      _this.userReportHandler({type: 'comment', entity_id: comment.id});
    } else if (action === 'delete') {
      wx.showLoading({title: '评论删除中'});
      APP.HTTP.POST('posts/comments/delete', {id: comment.id}).then(function(result) {
        _this.data.post.comments.splice(commentIndex, 1);
        _this.data.post.comment_num -= 1;
        _this.setData({post: _this.data.post});
        APP.showNotify('评论删除成功');
      }).catch(function(res) {
        if (APP.HTTP.wxRequestIsOk(res)) {
          wx.showModal({
            title: '操作失败',
            content: '动态删除失败: ' + res.data.message,
            showCancel: false,
          });
        }
      }).finally(function() {
        wx.hideLoading();
      });
    } else {
      wx.showModal({title: '通知', content: '未能处理你的操作', showCancel: false});
    }

    _this.setData({postCommentActionSheetVisible: false});
  },

  /**
   * 用户报告不良信息处理
   */
  userReportHandler(params) {
    APP.HTTP.POST('user-reports', params).finally(function() {
      wx.showModal({title: '报告不良信息', content: '感谢，我们已收到你的报告', showCancel: false});
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    wx.showLoading({title: '加载中'});
    APP.MODEL.getModel(this, 'posts/' + this.data.modelId).finally(function() {
      wx.hideLoading();
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 分享到聊天
   */
  onShareAppMessage() {
    return {
      title: this.data.post.user_nickname + '发布的动态',
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    let imageUrl = null;
    if (this.data.post.images.length) imageUrl = this.data.post.images[0].file_path;

    return {
      title: this.data.post.user_nickname + '发布的动态',
      imageUrl: imageUrl,
    };
  },
});
