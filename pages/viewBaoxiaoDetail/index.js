import clone from 'lodash/cloneDeep'
import {formatNumber, request} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        baoxiaoDetail: null,
        noticeHidden: true,
        // 发票
        ocrList: []
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        dd.getStorage({
            key: 'baoxiaoDetail',
            success: res => {
                const baoxiaoDetail = clone(res.data)
                // ==========发票相关=========
                if(baoxiaoDetail.invoiceInfoId) {
                    this.getInvoiceDetailById(baoxiaoDetail.invoiceInfoId)
                }
                // ==========================
                this.setData({
                    noticeHidden: baoxiaoDetail.invoiceType == 2 ? false : true
                })
                this.setData({
                    baoxiaoDetail
                })
                dd.removeStorage({
                    key: 'baoxiaoDetail',
                    success: res => {
                        console.log('删除查看报销详情成功....')
                    }
                })
            }
        })
    },
    openExtraInfo(e) {
        const extraMessage = this.data.baoxiaoDetail.extraMessage
        const subjectExtraConf =this.data.baoxiaoDetail.subjectExtraConf
        console.log(subjectExtraConf, 'subjectExtraConf')
        const applicationAmount = this.data.baoxiaoDetail.applicationAmount
        dd.setStorage({
            key: 'extraObj',
            data: {
                extraMessage,
                subjectExtraConf,
                applicationAmount
            },
            success: res => {
                dd.navigateTo({
                    url: '/pages/viewExtra/index'
                })
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
        if (app.globalData.loadingCount <= 0) {
            dd.hideLoading()
        }
    },
    getInvoiceDetailById(ids) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading(),
            method: 'GET',
            url: app.globalData.url + 'invoiceInfoController.do?getInvoiceInfoByIds',
            data: {
                ids,
            },
            success: res => {
                if(res.data.success) {
                    if(res.data.obj.length) {
                        res.data.obj.forEach(item => {
                            item.formatJshj = formatNumber(Number(item.jshj).toFixed(2))
                        })
                    }
                    this.setData({
                        ocrList: res.data.obj
                    })
                }else{
                    dd.alert({
                        content: '获取发票详情失败',
                        buttonText: '好的'
                    })
                }
            },
            fail: err => {
                console.log(err, 'error')
            }
        })
    },
    goToInvoiceDetail(e) {
        const index = e.currentTarget.dataset.index
        dd.setStorage({
            key: 'invoiceDetail',
            data: this.data.ocrList[index],
            success: res => {
                dd.navigateTo({
                    url: '/pages/invoiceInput/index'
                })
            }
        })
    }
})
