import clone from "lodash/cloneDeep";
import {formatNumber, validFn, request} from "../../util/getErrorMessage";

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
    },
    onShow() {
        let fukuanDetail = dd.getStorageSync({key: 'fukuanDetail'}).data
        fukuanDetail.formatUnverifyAmount = formatNumber(Number(fukuanDetail.unverifyAmount).toFixed(2))
        if(!!fukuanDetail) {
            this.setData({
                fukuanDetail
            })
            dd.removeStorage({
                key: 'fukuanDetail'
            })
        }
    },
    onKaipiaoBlur(e) {
        var tempData = clone(this.data.fukuanDetail)
        tempData.applicationAmount = e.detail.value
        tempData['formatApplicationAmount'] = formatNumber(Number(e.detail.value).toFixed(2))
        this.setData({
            fukuanDetail: tempData,
        })
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
        if (app.globalData.loadingCount <= 0) {
            dd.hideLoading()
        }
    },
    submitFukuanDetail() {
        if(Number(this.data.fukuanDetail.applicationAmount) > Number(this.data.fukuanDetail.unverifyAmount)) {
            dd.alert({
                content: '开票金额不能大于可申请余额',
                buttonText: '好的'
            })
            return
        }
        dd.setStorage({
            key: 'fukuanDetail',
            data: this.data.fukuanDetail,
            success() {
                dd.navigateBack({
                    delta: 1
                })
            }
        })
    },
    disabled(e) {
        dd.alert({
            content: '导入的单据此处不可编辑',
            buttonText: '好的'
        })
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
