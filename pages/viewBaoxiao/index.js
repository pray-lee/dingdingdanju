import {formatNumber} from "../../util/getErrorMessage";
import clone from 'lodash/cloneDeep'

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        result: null
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
    previewFile(e) {
        var url = e.currentTarget.dataset.url
        dd.previewImage({
            urls: [url],
        })
    },
    onLoad(query) {
        const id = query.id
        dd.httpRequest({
            url: app.globalData.url + 'reimbursementBillController.do?getDetail&id=' + id,
            method: 'GET',
            dataType: 'json',
            success: res => {
                if (res.data.obj) {
                    const result = clone(res.data.obj)
                    result.applicationAmount = formatNumber(Number(result.applicationAmount).toFixed(2))
                    result.verificationAmount = formatNumber(Number(result.verificationAmount).toFixed(2))
                    result.totalAmount = formatNumber(Number(result.totalAmount).toFixed(2))
                    result.billDetailList.forEach(item => {
                        item.applicationAmount = formatNumber(Number(item.applicationAmount).toFixed(2))
                    })
                    this.setData({
                        result
                    })
                }
                this.hideLoading()
            }
        })
    },
    showBaoxiaoDetail(e) {
        const index = e.currentTarget.dataset.index
        const tempData = clone(this.data.result.billDetailList[index])
        tempData.taxpayerType = this.data.result.accountbook.taxpayerType
        dd.setStorage({
            key: 'baoxiaoDetail',
            data: tempData,
            success: res => {
                dd.navigateTo({
                    url: '/pages/viewBaoxiaoDetail/index'
                })
            }
        })
    }
})
