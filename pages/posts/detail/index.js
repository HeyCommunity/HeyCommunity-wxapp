const APP = getApp();

Page({
  data: {
    skeletonVisible: true,
    post: null,
    postId: null,

    tabType: 'comment',
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
   * 分享
   */
  onShareAppMessage() {
    return {
      title: this.data.models[0].user_nickname + '发布的动态',
    };
  },
});
