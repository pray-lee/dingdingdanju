import {login} from "./util/getErrorMessage";

App({
  onLaunch(options) {
    console.log('running....')
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
    login(this)
  },
  globalData: {
    "corpId": "ding2fac28f4bbc361e435c2f4657eb6378f",
    // "CustomKey": "suiteledp8nm95trck3th",
    // "CustomSecret": "pAw2w2JgcMMsF2HW7N0ik3bP0lvEvnxw_nkQRbRSBa1TQs7CbPP-hW836RoGoTAW",
    "url": "https://www.caika.net/CaiKa/",
    // "url": "http://39.96.59.19:8081/Test/",
  }
});
