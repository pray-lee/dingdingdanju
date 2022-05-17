import moment from "moment";

var app = getApp()
app.globalData.loadingCount = 0
import {formatNumber, request} from '../../util/getErrorMessage'
Page({
    data: {
        imgUrl: '',
        fromStorage: false,
        fromEditStorage: false,
        isPhoneXSeries: false,
        scrollTop: 0,
        type: 'zzs',
        typeClass: 'zzs',
        typeText: '增值税发票',
        zzsIndex: 0,
        zzsList: [
            {
                name: '专用',
                invoiceType: '01'
            },
            {
                name: '电子专用',
                invoiceType: '08'
            },
            {
                name: '普通',
                invoiceType: '04'
            },
            {
                name: '电子普通',
                invoiceType: '10'
            },
        ],
        hidden: true,
        topHidden: true,
        animationImg: {},
        animationInfoTopList: {},
        accountbookIndex: 0,
        accountbookList: [],
        submitData: {
            invoiceType: '01',
            accountbookId: '',
            uploadType: '1'
        }
    },
    getEditInvoiceDetailFromStorage() {
        const editInvoiceDetail = dd.getStorageSync({key: 'editInvoiceDetail'}).data
        if(editInvoiceDetail) {
            const arr = ['01', '04', '08', '10', '11']
            const type = arr.includes(editInvoiceDetail.invoiceType) ? 'zzs' : editInvoiceDetail.invoiceType
            if(editInvoiceDetail.invoiceFileEntityList.length) {
                this.setData({
                    imgUrl: editInvoiceDetail.invoiceFileEntityList[0].uri
                })
            }
            this.setData({
                fromEditStorage: true,
                type,
                submitData: {
                    ...this.data.submitData,
                    ...editInvoiceDetail,
                    uploadType: '2'
                }
            })
            dd.removeStorage({
                key: 'editInvoiceDetail',
                success: res => {}
            })
        }
    },
    getInvoiceDetailFromStorage() {
        const invoiceDetail = dd.getStorageSync({key: 'invoiceDetail'}).data
        if(invoiceDetail) {
            const arr = ['01', '04', '08', '10', '11']
            const type = arr.includes(invoiceDetail.invoiceType) ? 'zzs' : invoiceDetail.invoiceType
            this.getInvoiceImgUrl(invoiceDetail.id)
            this.setData({
                fromStorage: true,
                type,
                submitData: {
                    ...this.data.submitData,
                    ...invoiceDetail
                }
            })
            dd.removeStorage({
                key: 'invoiceDetail',
                success: res => {}
            })
        }
        if(!this.data.fromStorage) {
            this.getAccountbookList()
        }
    },
    getInvoiceImgUrl(id) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'invoiceInfoController.do?getInvoiceInfoByIds',
            data: {
                ids: id,
            },
            method: 'GET',
            success: res => {
                if(res.data.success) {
                    if(res.data.obj.length) {
                        if(res.data.obj[0].invoiceFileEntityList.length) {
                            this.setData({
                                imgUrl: res.data.obj[0].invoiceFileEntityList[0].uri
                            })
                        }
                    }
                }
            }
        })
    },
    previewFile(e) {
        var url = e.currentTarget.dataset.url
        if(url.includes('pdf')) {
            dd.alert({
                content: '暂不支持预览PDF文件',
                buttonText: '好的',
            })
            return
        }
        dd.previewImage({
            urls: [url],
        })
    },
    onShow() {
        var animationImg = dd.createAnimation({
            duration: 250,
            timeFunction: 'linear',
            transformOrigin: 'center center'
        })
        this.animationImg = animationImg
        animationImg.rotate(0).step()

        var animationTopList = dd.createAnimation({
            duration: 250,
            timeFunction: 'linear',
        })
        this.animationTopList = animationTopList
        animationTopList.translateY('-200%').step()
        this.setData({
            animationInfoTopList: animationTopList.export()
        })
        this.getInvoiceDetailFromStorage()
        this.getEditInvoiceDetailFromStorage()
        this.setCurrentDate()
    },
    onHide() {

    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries,
        })
    },
    toggleHidden() {
        this.setData({
            hidden: !this.data.hidden
        })
        if (this.data.hidden) {
            this.animationImg.rotate(0).step()
            this.animationTopList.translateY('-200%').step()
            const t = setTimeout(() => {
                this.setData({
                    topHidden: true
                })
                clearTimeout(t)
            })
        } else {
            this.setData({
                topHidden: false
            })
            this.animationImg.rotate(180).step()
            this.animationTopList.translateY(0).step()
        }
        this.setData({
            animationInfoImg: this.animationImg.export(),
            animationInfoTopList: this.animationTopList.export(),
        })
    },
    toggleTemplate(e) {
        this.animationImg.rotate(0).step()
        this.animationTopList.translateY('-200%').step()
        const type = e.currentTarget.dataset.type
        const typeClass = e.currentTarget.dataset.class
        this.clearSubmitData()
        this.setType(type, typeClass)
        this.setCurrentDate()
    },
    clearSubmitData() {
        const accountbookId = this.data.submitData.accountbookId
        const uploadType = this.data.submitData.uploadType
        const invoiceType = this.data.submitData.invoiceType
        this.setData({
            submitData: {
                accountbookId,
                uploadType,
                invoiceType
            }
        })
    },
    setCurrentDate() {
        const type = this.data.type
        const time = type == '93' ? 'rq' : 'kprq'
        this.setData({
            submitData: {
                ...this.data.submitData,
                [time]: moment().format('YYYY-MM-DD')
            }
        })
    },
    setType(type, typeClass) {
        let typeText = ''
        let invoiceType = type
        switch(type) {
            case 'zzs':
                typeText = '增值税发票'
                break
            case '95':
                typeText = '定额发票'
                break
            case '93':
                typeText = '飞机行程单'
                break
            case '92':
                typeText = '火车票'
                break
            case '91':
                typeText = '出租车票'
                break
            case '88':
                typeText = '车船票'
                break
            case '98':
                typeText = '过路费'
                break
            case '97':
                typeText = '通用机打发票'
                break
        }
        if(type == 'zzs') {
            invoiceType = this.data.zzsList[this.data.zzsIndex].invoiceType
        }
        this.setData({
            hidden: true,
            animationInfoImg: this.animationImg.export(),
            animationInfoTopList: this.animationTopList.export(),
            type,
            typeText,
            typeClass,
            submitData: {
                ...this.data.submitData,
                invoiceType
            }
        })
    },
    bindObjPickerChange(e) {
        var name = e.currentTarget.dataset.name
        var listName = e.currentTarget.dataset.list
        var value = e.detail.value
        var index = e.currentTarget.dataset.index
        if(name !== 'accountbookId') {
            this.setData({
                [index]: e.detail.value,
                submitData: {
                    ...this.data.submitData,
                    [name]: this.data[listName][value].invoiceType
                }
            })
        }else{
            this.setData({
                [index]: e.detail.value,
                submitData: {
                    ...this.data.submitData,
                    [name]: this.data[listName][value].id
                }
            })
        }
        console.log(this.data.submitData)
    },
    getAccountbookList() {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'accountbookController.do?getAccountbooksJsonByUserId&agentId=' + app.globalData.agentId,
            method: 'GET',
            success: res => {
                if(res.data.success && res.data.obj.length) {
                    var accountbookIndex = 0
                    var accountbookId = res.data.obj[0].id
                    this.setData({
                        accountbookList: res.data.obj,
                        accountbookIndex: accountbookIndex,
                        submitData: {
                            ...this.data.submitData,
                            accountbookId
                        }
                    })
                }else{
                    dd.alert({
                        content: res.data.msg,
                        buttonText: '好的',
                        success: res => {
                            dd.reLaunch({
                                url: '/pages/index/index'
                            })
                        }
                    })
                }
            },
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
    onBusinessFocus(e) {
        const name = e.currentTarget.dataset.name
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: moment().format('YYYY-MM-DD'),
            success: (res) => {
                if (!!res.date) {
                    this.setData({
                        submitData: {
                            ...this.data.submitData,
                            [name]: res.date
                        },
                    })
                }
            },
            fail: res => {
                console.log(res, 'failed dateTime')
            }
        })
    },
    onBlur(e) {
        this.setData({
            submitData: {
                ...this.data.submitData,
                [e.currentTarget.dataset.name]: e.detail.value
            },
        })
    },
    saveInvoice() {
        if(this.data.fromEditStorage) {
            dd.setStorage({
                key: 'editInvoiceDetail',
                data: this.data.submitData,
                success: res => {
                    dd.navigateBack({
                        delta: 1
                    })
                }
            })
        }else{
            this.addSuffix(this.data.submitData)
            this.addLoading()
            request({
                hideLoading: this.hideLoading,
                url: app.globalData.url + 'invoiceInfoController.do?doAdd',
                method: 'POST',
                headers:  {'Content-Type': 'application/json;charset=utf-8'},
                data: JSON.stringify(this.data.submitData),
                success: res => {
                    console.log(res, 'res')
                },
                fail: res => {
                    console.log(res, 'error')
                }
            })
        }
    },
    addSuffix(data) {
        Object.keys(data).forEach(key => {
            if(key == 'kprq' || key == 'rq') {
                if(data[key].indexOf(' ') < 0)
                    data[key] = `${data[key]} 00:00:00`
            }
        })
    }
})

