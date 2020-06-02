App({
  onLaunch(options) {
    console.log('running....')
    console.log(1)
    dd.getAuthCode({
      success: (res) => {
        dd.httpRequest({
          url: this.globalData.url + "loginController.do?loginDingTalk&code=" + res.authCode,
          method: "GET",
          dataType: "json",
          success: res => {
            var sessionId = res.data.obj
            dd.setStorage({
              key: 'sessionId',
              data: sessionId,
              success: function() {
                console.log('写入成功')
              }
            })
          }
        })
      }
    })
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
  globalData: {
    "corpId": "dingd6db728a5a10ba1f35c2f4657eb6378f",
    "CustomKey": "suiteledp8nm95trck3th",
    "CustomSecret": "pAw2w2JgcMMsF2HW7N0ik3bP0lvEvnxw_nkQRbRSBa1TQs7CbPP-hW836RoGoTAW",
    "url": "https://www.caika.net/Test/"
  }
});
