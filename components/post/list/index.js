const APP = getApp();

Component({
  options: {
    addGlobalClass: true
  },

  properties: {
    posts: Array,
    isDetail: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    // 评论模板框
    commentPopupVisible: false,
    commentPopupContent: null,
    commentPopupType: null,
    commentPopupPostIndex: null,
    commentPopupPostId: null,
    commentPopupCommentIndex: null,
    commentPopupCommentId: null,

    // 动态操作
    postActionPostIndex: null,
    postActionPost: null,
    postActionSheetVisible: false,
    postActions: [],
    userPostActions: [
      {text: '查看动态详情', value: 'detail'},
      {text: '报告不良信息', value: 'report', type: 'warn'},
    ],
    authorPostActions: [
      {text: '查看动态详情', value: 'detail'},
      {text: '删除', value: 'delete', type: 'warn'},
    ],
    adminPostActions: [
      {text: '查看动态详情', value: 'detail'},
      {text: '报告不良信息', value: 'report', type: 'warn'},
      {text: '下架', value: 'hidden', type: 'warn'},
    ],

    // 动态评论操作
    postCommentActionComment: null,
    postCommentActionCommentIndex: null,
    postCommentActionPostIndex: null,
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

  methods: {
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
     * 视频播放处理
     */
    videoPlayHandler(event) {
      let videoId = event.target.id;

      // 暂时当前播放的视频
      if (this.data.currentVideoId && this.data.currentVideoId != videoId) {
        let currentVideoContext = wx.createVideoContext(this.data.currentVideoId);
        currentVideoContext.pause();
      }

      this.setData({currentVideoId: videoId});
    },

    /**
     * 点赞处理
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

      this.baseThumbUpHandler('posts/thumbs', params).then(function(result) {
        let message = null;

        if (result.statusCode === 201 || result.statusCode === 200) {
          message = '点赞成功';
          _this.properties.posts[postIndex]['i_have_thumb_up'] = true;
          _this.properties.posts[postIndex]['thumb_up_num'] += 1;
        } else if (result.statusCode === 202) {
          message = '取消点赞成功';
          _this.properties.posts[postIndex]['i_have_thumb_up'] = false;
          _this.properties.posts[postIndex]['thumb_up_num'] -= 1;
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

      this.baseThumbUpHandler('posts/comments/thumbs', params).then(function(result) {
        let message = null;

        if (result.statusCode === 201) {
          message = '点赞成功';
          _this.properties.posts[postIndex].comments[commentIndex].i_have_thumb_up = true;
          _this.properties.posts[postIndex].comments[commentIndex].thumb_up_num += 1;
        } else if (result.statusCode === 202) {
          message = '取消点赞成功';
          _this.properties.posts[postIndex].comments[commentIndex].i_have_thumb_up = false;
          _this.properties.posts[postIndex].comments[commentIndex].thumb_up_num -= 1;
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
     * 设置评论内容
     */
    setCommentContentHandler(event) {
      this.setData({commentPopupContent: event.detail.value});
    },

    /**
     * 评论处理
     */
    commentHandler() {
      let _this = this;

      let type = this.data.commentPopupType;
      let postIndex = this.data.commentPopupPostIndex;
      let postId = this.data.commentPopupPostId;
      let commentIndex = this.data.commentPopupCommentIndex;
      let commentId = this.data.commentPopupCommentId;
      let content = this.data.commentPopupContent;

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

      let httpRequest = function() {
        APP.HTTP.POST('posts/comments', params).then((result) => {
          _this.closeCommentPopup();

          if (result.data.status) {
            if (type === 'replyComment') _this.properties.posts[postIndex].comments[commentIndex].i_have_comment = true;
            _this.properties.posts[postIndex].comments.unshift(result.data);
            _this.properties.posts[postIndex].comment_num += 1;
            _this.properties.posts[postIndex].i_have_comment = true;
            _this.setData({posts: _this.properties.posts});

            APP.showNotify('评论成功');
          } else {
            APP.showNotify('评论创建成功 \n 管理员审核通过后将发布', 'warning');
          }
        }).catch(function(res) {
          if (res.data.message) {
            wx.showModal({
              title: '评论失败',
              content: res.data.message,
              showCancel: false,
            });
          } else {
            wx.showModal({
              title: '评论失败',
              showCancel: false,
            });
          }
        });
      };

      // 订阅消息
      if (APP.globalData.systemSettings
        && APP.globalData.systemSettings.wxapp_subscribe_message
        && APP.globalData.systemSettings.wxapp_subscribe_message.enable
      ) {
        wx.requestSubscribeMessage({
          tmplIds: [
            APP.globalData.systemSettings.wxapp_subscribe_message.thumb_up_temp_id,
            APP.globalData.systemSettings.wxapp_subscribe_message.comment_temp_id,
            APP.globalData.systemSettings.wxapp_subscribe_message.reply_temp_id,
          ] ,
          complete: function() {
            httpRequest();
          },
        });
      } else {
        httpRequest();
      }
    },

    /**
     * 显示动态的 actionSheet
     */
    showPostActionSheet(event) {
      let _this = this;
      let post = event.currentTarget.dataset.post;
      let postIndex = event.currentTarget.dataset.postIndex;

      let actions = _this.data.userPostActions;
      if (APP.globalData.isAuth) {
        if (APP.globalData.userInfo.id == post.user_id) {
          actions = _this.data.authorPostActions;
        } else if (APP.globalData.userInfo.is_admin) {
          actions = _this.data.adminPostActions;
        }
      }

      _this.setData({
        postActionSheetVisible: true,
        postActions: actions,
        postActionPost: post,
        postActionPostIndex: postIndex,
      });
    },

    /**
     * 动态 ActionSheet 操作处理
     */
    postActionTapHandler(event) {
      let _this = this;
      let action = event.detail.value;
      let post = _this.data.postActionPost;
      let postIndex = _this.data.postActionPostIndex;

      if (action === 'detail') {
        wx.navigateTo({url: '/pages/posts/detail/index?id=' + post.id});
      } else if (action === 'report') {
        // TODO: 后台处理
        wx.showModal({title: '报告不良信息', content: '感谢，我们已收到你的报告信息', showCancel: false});
      } else if (action === 'delete') {
        wx.showLoading({title: '动态删除中'});
        APP.HTTP.POST('posts/delete', {id: post.id}).then(function(result) {
          _this.data.posts.splice(postIndex, 1);
          _this.setData({posts: _this.data.posts});
          APP.showNotify('动态删除成功');
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
      } else if (action === 'hidden') {
        wx.showLoading({title: '动态下架中'});
        APP.HTTP.POST('posts/hidden', {id: post.id}).then(function(result) {
          _this.data.posts.splice(postIndex, 1);
          _this.setData({posts: _this.data.posts});
          APP.showNotify('动态下架成功');
        }).catch(function(res) {
          if (APP.HTTP.wxRequestIsOk(res)) {
            wx.showModal({
              title: '操作失败',
              content: '动态下架失败: ' + res.data.message,
              showCancel: false,
            });
          }
        }).finally(function() {
          wx.hideLoading();
        });
      } else {
        wx.showModal({title: '通知', content: '未能处理你的操作', showCancel: false});
      }

      _this.setData({postActionSheetVisible: false});
    },

    /**
     * 显示动态评论的 actionSheet
     */
    showPostCommentActionSheet(event) {
      let _this = this;
      let comment = event.currentTarget.dataset.comment;
      let commentIndex = event.currentTarget.dataset.commentIndex;
      let postIndex = event.currentTarget.dataset.postIndex;

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
        postCommentActionPostIndex: postIndex,
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
      let postIndex = _this.data.postCommentActionPostIndex;

      if (action === 'report') {
        // TODO: 后台处理
        wx.showModal({title: '报告不良信息', content: '感谢，我们已收到你的报告', showCancel: false});
      } else if (action === 'delete') {
        wx.showLoading({title: '评论删除中'});
        APP.HTTP.POST('posts/comments/delete', {id: comment.id}).then(function(result) {
          _this.properties.posts[postIndex].comments.splice(commentIndex, 1);
          _this.properties.posts[postIndex].comment_num -= 1;
          _this.setData({posts: _this.data.posts});
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
  },
});
