const app = getApp()
import {request} from '../../util/getErrorMessage'
Page({
    data: {
        expressInfo: {},
        type: 'add'
    },
    onLoad(query) {
        if(!!query.type && query.type === 'edit') {
            const expressInfo = dd.getStorageSync({key: 'expressInfo'}).data
            this.setData({
                expressInfo,
                type: query.type
            })
        }
    },
    updateInfo() {
        console.log('修改客户信息')
    },
    bindKeyInput(e) {
        this.setData({
            expressInfo: {
                ...this.data.expressInfo,
                [e.currentTarget.dataset.type]: e.detail.value
            }
        })
        console.log(this.data.expressInfo)
    },
    addLoading() {
        if (app.globalData.loadingCount < 1) {
            dd.showLoading({
                content: '加载中...'
            })
        }
        app.globalData.loadingCount += 1
    },
    hideLoading() {
        if (app.globalData.loadingCount <= 1) {
            dd.hideLoading()
            app.globalData.loadingCount = 0
        } else {
            app.globalData.loadingCount -= 1
        }
    },
    save() {
        const customerDetailId = dd.getStorageSync({key: 'customerDetailId'}).data
        this.setData({
            expressInfo: {
                ...this.data.expressInfo,
                customerDetailId
            }
        })
        this.addLoading()
        const url = app.globalData.url + (this.data.type === 'edit' ?
            'customerSpecialDeliveryController.do?doUpdate' :
            'customerSpecialDeliveryController.do?doAdd' )
        request({
            hideLoading: this.hideLoading,
            url: url,
            method: 'POST',
            data: this.data.expressInfo,
            success: res => {
                this.once()
            }
        })
    },
    once() {
        dd.setStorage({
            key: 'expressInfo',
            data: this.data.expressInfo,
            success: () => {
                dd.navigateBack({
                    delta: 2
                })
            }
        })
    },
})
