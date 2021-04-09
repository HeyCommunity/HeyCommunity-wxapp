const HTTP = require('../../../utils/http.js');

Page({
  data: {
    content: '',
    images: [],
  },

  /**
   * onLoad
   */
  onLoad() {
    if (getApp().needAuth()) return;
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

          HTTP.uploadFile('timeline-images', tempFilePath, {}, function(data) {
            let timelineImageId = data.id;

            _this.data.images.forEach(function(image, index) {
              if (image.tempFilePath === tempFilePath) {
                _this.data.images[index].imageId = timelineImageId;

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
  createTimeline() {
    if (!this.data.content) {
      wx.showModal({
        content: '请说点什么',
        showCancal: false,
      });

      throw 'Timline content can\'t be null';
    }

    wx.showLoading({});

    let params = {
      content: this.data.content,
      image_ids: [],
    };

    this.data.images.forEach(function(image) {
      params.image_ids.push(image.imageId);
    });

    HTTP.httpPost('posts', params, function(data) {
      wx.hideLoading();
      wx.navigateBack();
    });
  },
});
