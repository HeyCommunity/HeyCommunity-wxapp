const APP = getApp();

Page({
  data: {
    content: null,
    images: [],
    video: null,

    uploading: false,

    videoControlVisible: false,
    videoPlayBtnVisible: true,
  },

  /**
   * onLoad
   */
  onLoad() {
  },

  /**
   * 选择图片
   */
  pickImages() {
    let _this = this;

    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        res.tempFilePaths.forEach(function(tempFilePath) {
          _this.setData({uploading: true});

          APP.REQUEST.uploadFile('posts/upload-image', tempFilePath).then(function(result) {
            let postImageId = result.data.id;

            _this.setData({
              images: _this.data.images.concat([{
                'tempFilePath': tempFilePath,
                'imageId': postImageId,
                'imageFilePath': null,
              }]),
            });
          }).catch(function(res) {
            if (res.data.message) {
              wx.showModal({
                title: '图片上传失败',
                content: res.data.message,
                showCancel: false,
              });
            } else {
              wx.showModal({
                title: '图片上传失败',
                showCancel: false,
              })
            }
          }).finally(function() {
            _this.setData({uploading: false});
          });
        });
      }
    });
  },

  /**
   * 预览图片
   */
  previewImage(event) {
    wx.previewImage({
      urls: this.data.images.map(image => image.tempFilePath),
      current: event.currentTarget.dataset.url
    });
  },

  /**
   * 删除照片
   */
  deleteImage(event) {
    wx.showModal({
      title: '操作提示',
      content: '确定要删除这张照片吗？',
      success: res => {
        if (res.confirm) {
          this.data.images.splice(event.currentTarget.dataset.index, 1);
          this.setData({
            images: this.data.images
          })
        }
      }
    })
  },

  /**
   * 选择视频
   */
  pickVideo() {
    let _this = this;

    wx.chooseVideo({
      success: function(res) {
        let tempFilePath = res.tempFilePath;
        let params = {
          duration: res.duration,
          size: res.size,
          height: res.height,
          width: res.width,
        };

        _this.setData({uploading: true});
        APP.REQUEST.uploadFile('posts/upload-video', tempFilePath, params).then(function(result) {
          _this.setData({video: result.data});
        }).finally(function() {
          _this.setData({uploading: false});
        });
      }
    });
  },

  /**
   * 全屏显示视频
   */
  videoPlayHandler() {
    let videoContext = wx.createVideoContext('video');
    videoContext.requestFullScreen();
    videoContext.play();

    this.setData({videoPlayBtnVisible: false});
  },

  /**
   * 视频全屏切换事件处理
   */
  videoFullScreenChangeHandler(event) {
    if (event.detail.fullScreen) {
      this.setData({videoControlVisible: true});
    } else {
      let videoContext = wx.createVideoContext('video');
      videoContext.stop();
      this.setData({
        videoControlVisible: false,
        videoPlayBtnVisible: true,
      });
    }
  },

  /**
   * 删除视频
   */
  deleteVideo() {
    this.setData({video: null});
  },

  /**
   * setInputValue
   */
  setInputValue(event) {
    let field = event.currentTarget.dataset.field;
    this.data[field] = event.detail.value;
  },

  /**
   * 发布动态
   */
  createPost(event) {
    wx.hideKeyboard();

    let _this = this;
    // let formData = event.detail.value;       // 获取表单数据

    // 内容不能为空
    if (! _this.data.content) {
      wx.showModal({
        content: '请说点什么',
        showCancel: false,
      });

      throw 'Post content can\'t be null';
    }

    // 封装处理方法
    let handler = function() {
      let httpRequest = function() {
        wx.showLoading({
          mask: true,
          title: '发布中'
        });

        let params = {
          content: _this.data.content,
          image_ids: [],
        };

        _this.data.images.forEach(function(image) {
          params.image_ids.push(image.imageId);
        });

        if (_this.data.video) {
          params.video_id = _this.data.video.id;
        }

        APP.REQUEST.POST('posts', params).then((result) => {
          wx.navigateBack({
            success() {
              if (result.data.status) {
                APP.OnFire.fire('newPost', result.data);
                APP.Notify({message: '动态发布成功'});
              } else {
                APP.Notify({message: '动态创建成功 \n 管理审核通过后将发布', type: 'warning'});
              }
            }
          });
        }).catch(function(res) {
          if (res.data.message) {
            wx.showModal({
              title: '动态创建失败',
              content: res.data.message,
              showCancel: false,
            });
          } else {
            wx.showModal({
              title: '动态创建失败',
              content: '请稍后再试',
              showCancel: false,
            });
          }
        }).finally(() => {
          wx.hideLoading();
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
    }

    // 如果正在上传
    if (_this.data.uploading) {
      wx.showModal({
        title: '正在上传',
        content: '请等待图片或视频上传完成后再发布动态',
        cancelText: '立即发布',
        confirmText: '再等等',
        success: function(res) {
          if (res.confirm) return false;
          if (res.cancel) {
            // TODO: 停止 HTTP 上传请求，并清空图片和视频
            // _this.setData({images: [], video: null});
            handler();
          }
        }
      })
    } else {
      handler();
    }
  },
});
