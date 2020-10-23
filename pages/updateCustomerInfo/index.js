const app = getApp()
Page({
    data: {
        customInfo: {}
    },
    onLoad() {
       console.log('onload')
    },
    updateInfo() {
        console.log('修改客户信息')
    }
})
