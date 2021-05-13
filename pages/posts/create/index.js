const APP = getApp();

Page({
  data: {
    content: null,
    images: [],
    video: null,
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
          APP.HTTP.uploadFile('post-images', tempFilePath).then(function(result) {
            let postImageId = result.data.id;

            _this.setData({
              images: _this.data.images.concat([{
                'tempFilePath': tempFilePath,
                'imageId': postImageId,
                'imageFilePath': null,
              }]),
            });
          }).catch(function() {
            wx.showModal({
              title: '图片上传失败',
              showCancel: false,
            })
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

        APP.HTTP.uploadFile('post-video', tempFilePath, params).then(function(result) {
          _this.setData({video: result.data});
        });
      }
    });
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

    if (! _this.data.content) {
      wx.showModal({
        content: '请说点什么',
        showCancal: false,
      });

      throw 'Post content can\'t be null';
    }

    // 订阅消息
    wx.requestSubscribeMessage({
      tmplIds: ['LRonMBmk_ejm4aOqJG_cNLwVnzwYYZTYnzsf-1pOPoQ', 'nctxK4mtq5lA_HMxKPTFQXAy7TZV7r3uK6Y5ueVI8UM'],
      complete() {
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

        APP.HTTP.POST('posts', params).then((result) => {
          wx.navigateBack({
            success() {
              if (result.data.status) {
                APP.OnFire.fire('newPost', result.data);
                APP.showNotify('动态发布成功');
              } else {
                APP.showNotify('动态创建成功 \n 管理审核通过后将发布', 'warning');
              }
            }
          });
        }).catch(function() {
          wx.showModal({
            title: '动态创建失败',
            content: '请稍后再试',
            showCancel: false,
          });
        }).finally(() => {
          wx.hideLoading();
        });
      },
    });
  },
});
