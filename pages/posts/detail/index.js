const APP = getApp();

Page({
  data: {
    skeletonVisible: true,
    post: null,
    postId: null,

    tabType: 'comment',

    // 评论模态框
    commentTextareaFocus: false,
    commentModalVisible: false,
    commentModalContent: null,
    commentModalType: null,
    commentModalPostId: null,
    commentModalCommentIndex: null,
    commentModalCommentId: null,

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
    let _this = this;

    _this.setData({postId: options.id});
  },

  /**
   * onShow
   */
  onShow() {
    this.getPostData();
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
   * 点赞处理
   */
  baseThumbHandler(apiPath, params) {
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
   * 动态点赞处理
   */
  postThumbHandler(event) {
    if (getApp().needAuth()) return;

    let _this = this;
    let postId = this.data.post.id;
    let type = event.currentTarget.dataset.type;
    let value = event.currentTarget.dataset.value;

    let params = {
      post_id: postId,
      type: type,
      value: value,
    };

    this.baseThumbHandler('posts/thumbs', params).then(function(result) {
      let message = null;

      if (result.statusCode === 201 || result.statusCode === 200) {
        message = '点赞成功';
        _this.data.post['i_have_thumb_up'] = true;
        _this.data.post['thumb_up_num'] += 1;
        _this.setData({post: _this.data.post});
      } else if (result.statusCode === 202) {
        message = '取消点赞成功';
        _this.data.post['i_have_thumb_up'] = false;
        _this.data.post['thumb_up_num'] -= 1;
        _this.setData({post: _this.data.post});
      }

      if (message) {
        _this.setData({posts: _this.properties.posts});
        APP.showNotify(message);
      }
    });
  },

  /**
   * 评论点赞
   */
  postCommentThumbHandler(event) {
    if (getApp().needAuth()) return;

    let _this = this;
    let commentIndex = event.currentTarget.dataset.commentIndex;
    let commentId = event.currentTarget.dataset.commentId;
    let type = event.currentTarget.dataset.type;
    let value = event.currentTarget.dataset.value;

    let params = {
      comment_id: commentId,
      type: type,
      value: value,
    };

    this.baseThumbHandler('posts/comments/thumbs', params).then(function(result) {
      let message = null;

      if (result.statusCode === 201) {
        message = '点赞成功';
        _this.data.post.comments[commentIndex].i_have_thumb_up = true;
        _this.data.post.comments[commentIndex].thumb_up_num += 1;
        _this.setData({post: _this.data.post});
      } else if (result.statusCode === 202) {
        message = '取消点赞成功';
        _this.data.post.comments[commentIndex].i_have_thumb_up = false;
        _this.data.post.comments[commentIndex].thumb_up_num -= 1;
        _this.setData({post: _this.data.post});
      }

      if (message) {
        _this.setData({posts: _this.properties.posts});
        APP.showNotify(message);
      }
    });
  },

  /**
   * 打开评论弹出层
   */
  showCommentModal(event) {
    let _this = this;

    if (getApp().needAuth()) return;

    let type = event.currentTarget.dataset.type;
    let postId = event.currentTarget.dataset.postId;
    let commentIndex = event.currentTarget.dataset.commentIndex;
    let commentId = event.currentTarget.dataset.commentId;

    this.setData({
      commentModalVisible: true,
      commentModalType: type,
      commentModalPostId: postId,
      commentModalCommentIndex: commentIndex,
      commentModalCommentId: commentId,
    });

    setTimeout(function() {
      _this.setData({commentTextareaFocus: true});
    }, 200);
  },

  /**
   * 关闭评论弹出层
   */
  hideCommentModal() {
    let _this = this;

    this.setData({
      commentModalVisible: false,
      commentModalContent: null,
      commentModalType: null,
      commentModalPostId: null,
      commentModalCommentIndex: null,
      commentModalCommentId: null,
    });

    setTimeout(function() {
      _this.setData({commentTextareaFocus: true});
    }, 200);
  },

  /**
   * 设置评论内容
   */
  setCommentContentHandler(event) {
    this.setData({commentModalContent: event.detail.value});
  },

  /**
   * 评论处理
   */
  commentHandler(event) {
    let _this = this;

    let type = this.data.commentModalType;
    let postId = this.data.commentModalPostId;
    let commentIndex = this.data.commentModalCommentIndex;
    let commentId = this.data.commentModalCommentId;
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

    // 订阅消息
    let wxappNoticeSubscribeHandler = function() {
      if (APP.globalData.systemSettings
        && APP.globalData.systemSettings.wxapp_subscribe_message
        && APP.globalData.systemSettings.wxapp_subscribe_message.enable
      ) {
        wx.requestSubscribeMessage({
          tmplIds: [
            APP.globalData.systemSettings.wxapp_subscribe_message.thumb_up_temp_id,
            APP.globalData.systemSettings.wxapp_subscribe_message.comment_temp_id,
            APP.globalData.systemSettings.wxapp_subscribe_message.reply_temp_id,
          ],
          complete: function() {
          },
        });
      }
    };

    // 发起评论请求
    APP.HTTP.POST('posts/comments', params).then((result) => {
      _this.hideCommentModal();

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

      // 订阅消息
      wxappNoticeSubscribeHandler();
    }).catch(function(res) {
      let errorMessage = '未知错误';
      if (res.data.message) errorMessage = res.data.message;

      wx.showModal({
        title: '评论失败',
        content: res.data.message,
        showCancel: false,
      });
    });
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
   * 获取 post
   */
  getPostData() {
    let _this = this;

    return new Promise(function(resolve, reject) {
      // 获取动态
      APP.HTTP.GET('posts/' + _this.data.postId).then(function(result) {
        _this.setData({post: result.data});
        _this.setData({skeletonVisible: false});

        resolve(result);
      }).catch(function(res) {
        if (APP.HTTP.wxRequestIsOk(res)) {
          wx.showModal({
            title: '提示',
            content: '动态不存在或已被删除',
            showCancel: false,
            complete(res) {
              wx.navigateBack();
            }
          });
        }

        reject(res);
      });
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getPostData().finally(function() {
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
