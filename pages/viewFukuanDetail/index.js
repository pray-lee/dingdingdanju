import clone from "lodash/cloneDeep";

const app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        btnHidden: false,
        fukuanDetail: {},
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        const fukuanDetail = dd.getStorageSync({key: 'fukuanDetail'}).data
        this.setData({
            fukuanDetail
        })
        dd.removeStorage({
            key: 'fukuanDetail',
            success: res => {
                console.log('删除查看付款详情成功....')
            }
        })
    },
    onShow() {
    },
    addLoading() {
        if (app.globalData.loadingCount < 1) {
            dd.showLoading({
                content: '加载中...'
            })
        }
        app.globalData.loadingCount++
    },
    hideLoading() {
        app.globalData.loadingCount--
        if (app.globalData.loadingCount === 0) {
            dd.hideLoading()
        }
    },
    onKeyboardShow() {
        this.setData({
            btnHidden: true
        })
    },
    onKeyboardHide() {
        this.setData({
            btnHidden: false
        })
    }
})
