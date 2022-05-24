import clone from "lodash/cloneDeep";
import {formatNumber, validFn, request} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        btnHidden: false,
        fukuanDetail: {},
        // 发票
        maskHidden: true,
        animationInfo: {},
        nosupportInvoiceType: {
            '02': '货运运输业增值税专用发票',
            '03': '机动车销售统一发票',
            '14': '通行费发票',
            '15': '二手车发票',
            '16': '区块链电子发票',
            '21': '全电发票（专用发票）',
            '22': '全电发票（普通发票）',
            '96': '国际小票',
            '85': '可报销其他发票',
            '86': '滴滴出行行程单',
            '87': '完税证明',
            '00': '其他未知票种',
        },
        ocrList: []
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
            // 发票
            if(fukuanDetail.ocrList) {
                this.setInvoiceList(fukuanDetail.ocrList)
            }
            if(fukuanDetail.invoiceInfoId && !fukuanDetail.ocrList) {
                this.getInvoiceDetailById(fukuanDetail.invoiceInfoId)
            }
            // =======
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
    },
    // 发票
    setInvoiceList(data) {
        if(data && data.length) {
            data.forEach(item => {
                item.formatJshj = formatNumber(Number(item.jshj).toFixed(2))
            })
            this.setData({
                ocrList: data
            })
        }
    },
    deleteInvoice(e) {
        const index = e.currentTarget.dataset.index
        let list = clone(this.data.ocrList)
        let invoiceInfoId = list[index].id
        list.splice(index, 1)
        this.setData({
            ocrList: list,
            fukuanDetail: {
                ...this.data.fukuanDetail,
                ocrList: []
            }
        })
        this.removeInvoiceInfoId(invoiceInfoId)
        this.setInvoiceApplicationAmount(list)
        this.setInvoiceInFukuanDetail(list)
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
    },
    removeInvoiceInfoId(id) {
        let invoiceInfoId = this.data.fukuanDetail.invoiceInfoId.split(',')
        let newIds = ''
        if(invoiceInfoId.length) {
            let ids = invoiceInfoId.filter(item => item !== id)
            newIds = ids.join(',')
        }
        this.setData({
            fukuanDetail: {
                ...this.data.fukuanDetail,
                invoiceInfoId: newIds
            }
        })
    },
    setInvoiceApplicationAmount(data) {
        // applicationAmount
        let applicationAmount = 0
        data.forEach(item => {
            applicationAmount += parseFloat(item.jshj)
        })
        this.setData({
            fukuanDetail: {
                ...this.data.fukuanDetail,
                applicationAmount,
                formatApplicationAmount: formatNumber(Number(applicationAmount).toFixed(2))
            }
        })
    },
    setInvoiceInFukuanDetail(data) {
        if(data && data.length) {
            this.setInvoiceInfoId(data)
            this.setOtherInvoiceInfo(data)
        }
    },
    setInvoiceInfoId(data) {
        let invoiceInfoId = ''
        data.forEach(item => {
            invoiceInfoId += item.id + ','
        })
        invoiceInfoId = invoiceInfoId.slice(0, -1)
        this.setData({
            fukuanDetail: {
                ...this.data.fukuanDetail,
                invoiceInfoId
            }
        })
    },
    setOtherInvoiceInfo(data) {
        this.setInvoiceApplicationAmount(data)
    },
})
