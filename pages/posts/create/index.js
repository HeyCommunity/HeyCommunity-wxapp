const HTTP = require('../../../utils/http.js');

Page({
  data: {
    images: [],
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
          _this.setData({
            images: _this.data.images.concat([{
              'tempFilePath': tempFilePath,
              'imageId': null,
              'imageFilePath': null,
            }]),
          });

          HTTP.uploadFile('post-images', tempFilePath, {}, function(data) {
            let postImageId = data.id;

            _this.data.images.forEach(function(image, index) {
              if (image.tempFilePath === tempFilePath) {
                _this.data.images[index].imageId = postImageId;

                _this.setData({
                  images: _this.data.images,
                });
              }
            });
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
   * 发布动态
   */
  createPost(event) {
    wx.hideKeyboard();

    let _this = this;
    let formData = event.detail.value;

    if (! formData.content) {
      wx.showModal({
        content: '请说点什么',
        showCancal: false,
      });

      throw 'Post content can\'t be null';
    }

    wx.showLoading({
      mask: true,
      title: '发布中'
    });

    let params = {
      content: formData.content,
      image_ids: [],
    };

    this.data.images.forEach(function(image) {
      params.image_ids.push(image.imageId);
    });

    HTTP.httpPost('posts', params, function(data) {
      wx.hideLoading();

      if (getApp().globalData.userInfo.ugc_safety_level) {
        wx.navigateBack({
          success() {
            wx.showToast({title: '动态发布成功', icon: 'none'});
          },
        });
      } else {
        wx.showModal({
          title: '动态创建成功',
          content: '管理员审核后将发布',
          showCancel: false,
          success() {
            wx.navigateBack();
          },
        });
      }
    });
  },
});
