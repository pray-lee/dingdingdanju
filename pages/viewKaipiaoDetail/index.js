import clone from "lodash/cloneDeep";

const app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        kaipiaoDetail: null
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        dd.getStorage({
            key: 'kaipiaoDetail',
            success: (res) => {
                const kaipiaoDetail = clone(res.data)
                console.log(kaipiaoDetail, '..........')
                this.setData({
                    kaipiaoDetail
                })
                dd.removeStorage({
                    key: 'kaipiaoDetail',
                    success: res => {
                        console.log('删除查看开票详情成功....')
                    }
                })
            }
        })
    },
})
