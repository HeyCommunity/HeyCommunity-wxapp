const APP = getApp();
const SubscribeMessage = require('../../../../libraries/subscribe-message.js');

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
  createPostHandler(event) {
    wx.hideKeyboard();

    let _this = this;

    // 内容不能为空
    if (! _this.data.content) {
      wx.showModal({
        content: '请说点什么',
        showCancel: false,
      });

      throw 'post content can\'t be null';
    }

    // 如果正在上传
    if (_this.data.uploading) {
      wx.showModal({
        title: '正在上传',
        content: '请等待图片或视频上传完成后再发布动态',
        showCancel: false,
        confirmText: '再等等',
      });

      throw '请等待图片或视频上传完成后再发布动态';
    }

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

    wx.showLoading({mask: true, title: '发布中'});
    APP.REQUEST.POST('posts', params, {requestFailModalTitle: '动态发布失败'}).then((result) => {
      // 订阅微信通知
      SubscribeMessage.specifyTemplates('thumb_up', 'comment', 'reply').finally(function() {
        wx.navigateBack({
          success() {
            if (result.data.status) {
              APP.OnFire.fire('newPost', result.data);
              APP.Notify({message: '动态发布成功', type: 'primary'});
            } else {
              APP.Notify({message: '动态创建成功 \n 管理审核通过后将发布', type: 'warning'});
            }
          }
        });
      });
    }).finally(() => {
      wx.hideLoading();
    });
  },
});
