import clone from "lodash/cloneDeep";
import {formatNumber, request} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        // 增加申请人
        realName: '',
        result: null,
        isPhoneXSeries: false,
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
        // 增加申请人
        this.setData({
            realName: app.globalData.realName
        })
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        this.addLoading()
        const id = query.id
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'invoicebillController.do?getDetail&id=' + id,
            method: 'GET',
            success: res => {
                if (res.data.obj) {
                    console.log(res.data.obj, 'obj')
                    const result = clone(res.data.obj)
                    result.billDetailList.forEach(item => {
                        item.formatApplicationAmount = formatNumber(Number(item.applicationAmount).toFixed(2))
                    })
                    this.setData({
                        result
                    })
                }
            }
        })
    },
    showKaipiaoDetail(e) {
        const index = e.currentTarget.dataset.index
        const tempData = clone(this.data.result.billDetailList[index])
        console.log(tempData, 'viewKaipiao')
        dd.setStorage({
            key: 'kaipiaoDetail',
            data: tempData,
            success: res => {
                dd.navigateTo({
                    url: '/pages/viewKaipiaoDetail/index'
                })
            }
        })
    },
    rollBack() {
        this.addLoading()
        request({
            hideLoading: this.hideLoading(),
            url: app.globalData.url + 'invoicebillController.do?doBatchTemporaryStorage&ids=' + this.data.result.id,
            method: 'GET',
            success: res => {
                if(res.data.success) {
                    dd.redirectTo({
                        url: `/pages/addKaipiao/index?type=edit&id=${this.data.result.id}`
                    })
                }else{
                    dd.alert({
                        content: '删除失败',
                        buttonText: '好的'
                    })
                }
            }
        })
    }
})
