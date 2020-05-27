App({
  onLaunch(options) {
    console.log('running....')
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
  globalData: {
    "corpId": "ding8716f43868da3905bc961a6cb783455b",
    "CustomKey": "suiteb21ghue9nj6gkgb0",
    "CustomSecret": "LI8GWNTEuC4hujrgfV8ijRP41gKMlXhop2edp7A_I1jzIRaU1MakY-1pprbSTJwc"
  }
});
