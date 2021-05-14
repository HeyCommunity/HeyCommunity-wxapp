var WXLog = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null

module.exports = {
  info() {
    if (!WXLog) return
    WXLog.info.apply(WXLog, arguments)
  },
  warn() {
    if (!WXLog) return
    WXLog.warn.apply(WXLog, arguments)
  },
  error() {
    if (!WXLog) return
    WXLog.error.apply(WXLog, arguments)
  },
  setFilterMsg(msg) { // 从基础库2.7.3开始支持
    if (!WXLog || !WXLog.setFilterMsg) return
    if (typeof msg !== 'string') return
    WXLog.setFilterMsg(msg)
  },
  addFilterMsg(msg) { // 从基础库2.8.1开始支持
    if (!WXLog || !WXLog.addFilterMsg) return
    if (typeof msg !== 'string') return
    WXLog.addFilterMsg(msg)
  }
}