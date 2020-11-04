const app = getApp()
import clone from 'lodash/cloneDeep'
import {request, validFn} from '../../util/getErrorMessage'
Page({
    data: {
        customInfo: {},
    },
    onLoad() {
        const updateCustomerDetailData = dd.getStorageSync({key: 'updateCustomerDetailData'}).data
        this.setData({
            customInfo: updateCustomerDetailData
        })
    },
    bindKeyInput(e) {
        this.setData({
            customInfo: {
                ...this.data.customInfo,
                [e.currentTarget.dataset.type]: e.detail.value
            }
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
        if (app.globalData.loadingCount === 0) {
            dd.hideLoading()
        }
    },
    updateInfo() {
        if(this.valid(this.data.customInfo)) {
            const tempData = clone(this.data.customInfo)
            tempData.id = this.data.customInfo.customerId
            this.addLoading()
            request({
                hideLoading: this.hideLoading,
                url: app.globalData.url + 'customerDetailController.do?doUpdateForPop',
                method: 'GET',
                data: tempData,
                success: res => {
                    if(res.data.success) {
                        // 把更新的信息返回去
                        dd.setStorage({
                            key: 'updatedCustomInfo',
                            data: this.data.customInfo,
                            success: () => {
                                console.log('更新成功')
                                dd.navigateBack({
                                    delta: 1
                                })
                            }
                        })
                    }
                },
                error: err => {
                    console.log(err)
                    validFn('接口请求发生错误')
                }
            })
        }
    },
    valid(data) {
        if(!data.taxCode) {
            validFn('请填写纳税人识别号')
            return false
        }
        if(!data.invoiceAddress) {
            validFn('请填写开票地址')
            return false
        }
        if(!data.invoicePhone) {
            validFn('请填写开票电话')
            return false
        }
        if(!data.bankName) {
            validFn('请填写开户行名称')
            return false
        }
        if(!data.bankAccount) {
            validFn('请填写开户行账号')
            return false
        }
        return true
    }
})
