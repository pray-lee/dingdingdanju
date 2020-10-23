const app = getApp()
Page({
    data: {
        expressInfo: {}
    },
    onLoad() {
       console.log('onload')
    },
    updateInfo() {
        console.log('修改客户信息')
    },
    once() {
        console.log('使用一次')
        dd.navigateBack({
            delta: 2
        })
    },
    save() {
        console.log('保存并使用')
    }
})
