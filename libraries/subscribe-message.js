const APP = getApp();

class SubscribeMessage {
  /**
   * 订阅指定的模板
   */
  static specifyTemplates(...temps) {
    let tempIds = this.getTempIds(temps);

    // 订阅消息
    return new Promise(function(resolve, reject) {
      if (APP.globalData.systemSettings
        && APP.globalData.systemSettings.wxapp_subscribe_message
        && APP.globalData.systemSettings.wxapp_subscribe_message.enable
        && Array.isArray(tempIds) && tempIds.length
      ) {
        wx.requestSubscribeMessage({
          tmplIds: tempIds,
          complete: function(res) {
            resolve(res);
          },
        });
      } else {
        reject();
      }
    });
  }

  /**
   * 获取模板 ID
   */
  static getTempIds(temps) {
    let tempIds = [];

    if (APP.globalData.systemSettings
      && APP.globalData.systemSettings.wxapp_subscribe_message
      && APP.globalData.systemSettings.wxapp_subscribe_message.enable
    ) {
      temps.forEach(function(temp) {
        let tempKey = temp + '_temp_id';

        if (APP.globalData.systemSettings.wxapp_subscribe_message[tempKey]) {
          tempIds = tempIds.concat(APP.globalData.systemSettings.wxapp_subscribe_message[tempKey]);
        }
      });
    }

    return tempIds;
  }
}

module.exports = SubscribeMessage;
