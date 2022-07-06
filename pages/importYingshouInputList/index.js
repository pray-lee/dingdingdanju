import moment from "moment";
import clone from "lodash/cloneDeep";
import {formatNumber, request, validFn} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        invoiceIndex: 0,
        isPhoneXSeries: false,
        btnHidden: false,
        importList: [],
        remarks: [],
        saveFlag: false,
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
        accountbookId: '',
        origin: ''
    },
    onHide() {
        console.log('hide')
    },
    onLoad(query) {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        // 发票
        this.getAccountbookId()
        if(query && query.origin) {
            this.setData({
                origin: query.origin
            })
        }
        dd.removeStorageSync({key: 'invoiceImportListTag'})
    },
    bindObjPickerChange(e) {
        var id = e.currentTarget.dataset.id
        var value = e.detail.value
        // 设置当前框的值
        const importList = this.data.importList.map(item => {
            if(item.id === id) {
                item.remarkIndex = value
                item.remark = this.data.remarks[value].remark
            }
            return item
        })
        this.setData({
           importList
        })
    },
    showContent() {
        dd.alert({
            content: '导入的单据此处不可编辑',
            buttonText: '好的'
        })
    },
    getImportListFromStorage() {
        dd.removeStorageSync({key: 'invoiceImportListTag'})
        const importList = dd.getStorageSync({key: 'importList'}).data
        const savedImportList = dd.getStorageSync({key: 'savedImportList'}).data || []
        console.log(importList, 'importList')
        if(importList && importList.length) {
            importList.forEach(item => item.applicationAmount = item.unverifyAmount)
            let oldList = savedImportList.concat()
            if(oldList.length) {
                for(let i = 0; i < importList.length; i++) {
                    if(oldList.every(item => item.id !== importList[i].id)) {
                        oldList.push(importList[i])
                    }else{
                        oldList = oldList.map(item => {
                            if(item.id === importList[i].id) {
                                return Object.assign({}, item, importList[i])
                            }else{
                                return item
                            }
                        })
                    }
                }
                // 数据组合
                this.setData({
                    importList: oldList
                })
            }else{
                this.setData({
                    importList: oldList.concat(importList)
                })
            }
        }else{
            this.setData({
                importList: savedImportList
            })
        }
        const tempData = this.data.importList
        for(let i = 0; i < tempData.length; i++) {
           for(let j = 0; j < this.data.remarks.length; j++) {
               if(this.data.remarks[j].remark === tempData[i].remark) {
                   tempData[i].remarkIndex = j
                   break
               }else{
                   tempData[i].remarkIndex = 0
               }
           }
        }
        this.setData({
            importList: tempData
        })
        dd.removeStorageSync({
            key: 'savedImportList'
        })
        dd.removeStorageSync({
            key: 'importList'
        })
    },
    // 获取开票内容
    getRemarksFromStorage(){
        const remarks = dd.getStorageSync({key: 'remarks'}).data
        if(!!remarks && remarks.length) {
            this.setData({
                remarks,
            })
        }
    },
    onShow() {
        // =======发票相关==========
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        this.setData({
            animationInfo: animation.export()
        })
        setTimeout(() => {
            this.getSelectOcrListFromStorage()
            this.getBillInvoiceDetail()
            this.getOcrListFromListFromStorage()
        })
        // =======================
        this.getRemarksFromStorage()
        this.getInvoiceAccountbookIdFromStorage()
        if(!dd.getStorageSync({key: 'invoiceImportListTag'}).data) {
            this.getImportListFromStorage()
        }
    },
    onInput(e) {
        const value = e.detail.value
        const id = e.currentTarget.dataset.id
        const tempData = clone(this.data.importList)
        tempData.forEach(item => {
            if(item.id === id) {
                console.log(item)
                item.applicationAmount = value
                if(Number(value) > Number(item.unverifyAmount)) {
                    dd.alert({
                        content: '开票金额不能大于可申请余额',
                        buttonText: '好的'
                    })
                    this.setData({
                        saveFlag: false
                    })
                }else{
                    this.setData({
                        saveFlag: true
                    })
                }
            }
        })
        this.setData({
            importList: tempData
        })
    },
    saveImportList() {
        console.log(this.data.importList)
        const saveFlag = this.data.importList.every(item => Number(item.applicationAmount) <= Number(item.unverifyAmount))
        if(!saveFlag) {
            dd.alert({
                content: '开票金额不能大于可申请余额',
                buttonText: '好的'
            })
            return
        }
        this.data.importList.forEach(item => {
            item.formatApplicationAmount = formatNumber(Number(item.applicationAmount).toFixed(2))
            item.billId = item.id
            item.subjectName = item['subjectName']
        })
        dd.setStorage({
            key: 'importCommonList',
            data: this.data.importList,
            success: () => {
                dd.navigateBack({
                    delta: 2
                })
            }
        })
        dd.removeStorageSync({
            key: 'tempImportList'
        })
        dd.removeStorageSync({
            key: 'savedImportList'
        })
        dd.removeStorageSync({
            key: 'importList'
        })
    },
    suppleImportList() {
        dd.setStorage({
            key: 'savedImportList',
            data: this.data.importList,
            success: () => {
                dd.navigateBack({
                    delta: 1
                })
            }
        })
    },
    deleteImportInputList(e) {
        const id = e.currentTarget.dataset.id
        const importList = this.data.importList.filter(item => item.id !== id)
        this.setData({
            importList
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
    onAddShow(e) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'invoiceConfigController.do?getInvoiceConfigByAccountbook&accountbookId=' + this.data.accountbookId,
            method: 'GET',
            success: res => {
                if(res.status == 200) {
                    if(res.data) {
                        this.animation.translateY(0).step()
                        this.setData({
                            animationInfo: this.animation.export(),
                            maskHidden: false
                        })
                        const index = e.currentTarget.dataset.index
                        this.setData({
                            invoiceIndex: index
                        })
                    }else{
                        dd.alert({
                            content: '当前组织未开通票据管理',
                            buttonText: '好的'
                        })
                    }
                }
            }
        })
    },
    onAddHide() {
        this.animation.translateY('100%').step()
        this.setData({
            animationInfo: this.animation.export(),
            maskHidden: true
        })
    },
    // 发票相关
    handleUpload() {
        dd.setStorageSync({key: 'invoiceImportListTag', data: 1})
        this.goToInvoiceAccountbookList()
    },
    goToInvoiceAccountbookList() {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'invoiceConfigController.do?getAccountbookListByUserId&userId=' + app.globalData.applicantId,
            method: 'GET',
            success: res => {
                if (res.status === 200) {
                    if(res.data && res.data.length) {
                        dd.setStorage({
                            key: 'invoiceAccountbookList',
                            data: res.data.filter(item => item.id === this.data.accountbookId),
                            success: res => {
                                dd.navigateTo({
                                    url: "/pages/invoiceAccountbookList/index"
                                })
                            }
                        })
                    }else{
                        dd.alert({
                            content: '当前用户没有开通发票模块',
                            buttonText: '好的',
                        })
                    }
                }
            }
        })
    },
    getInvoiceAccountbookIdFromStorage() {
        const accountbookId = dd.getStorageSync({key: 'invoiceAccountbookId'}).data
        dd.alert({
            content: accountbookId,
            buttonText: '好的'
        })
        if(accountbookId) {
            dd.chooseImage({
                count: 9,
                success: res => {
                    this.uploadFile(res.filePaths, accountbookId)
                },
                fail: res => {
                    console.log('用户取消操作')
                    // dd.removeStorageSync({key: 'invoiceImportListTag'})
                }
            })
            dd.removeStorage({
                key: 'invoiceAccountbookId',
                success: () => {}
            })
        }
    },
    invoiceInput() {
        dd.setStorageSync({key: 'invoiceImportListTag', data: 1})
        dd.setStorageSync({
            key: 'fromDetail',
            data: 'fromDetail'
        })
        dd.setStorageSync({
            key: 'accountbookId',
            data: this.data.accountbookId
        })
        dd.navigateTo({
            url: '/pages/invoiceInput/index'
        })
    },
    invoiceSelect() {
        dd.setStorageSync({key: 'invoiceImportListTag', data: 1})
        dd.navigateTo({
            url: '/pages/invoiceListSelect/index?accountbookId=' + this.data.accountbookId
        })
    },
    /**
     *
     * @param 上传图片字符串列表
     */
    uploadFile(array, accountbookId) {
        if (array.length) {
            let promiseList = []
            array.forEach(item => {
                promiseList.push(new Promise((resolve, reject) => {
                    this.addLoading()
                    dd.uploadFile({
                        url: app.globalData.url + 'aliyunController/uploadImages.do',
                        fileType: 'image',
                        fileName: item,
                        filePath: item,
                        formData: {
                            accountbookId: accountbookId,
                            submitterDepartmentId: 'department-invoice'
                        },
                        success: res => {
                            const result = JSON.parse(res.data)
                            if (result.obj && result.obj.length) {
                                const file = result.obj[0]
                                resolve(file)
                            } else {
                                reject('上传失败')
                            }
                        },
                        fail: res => {
                            reject(res)
                        },
                        complete: res => {
                            this.hideLoading()
                        }
                    })
                }))
            })
            Promise.all(promiseList).then(res => {
                // 提交成功的处理逻辑
                var billFilesList = []
                res.forEach(item => {
                    billFilesList.push({
                        name: item.name,
                        uri: item.uri,
                        size: item.size
                    })
                })
                this.doOCR(billFilesList, accountbookId)
            }).catch(error => {
                dd.alert({
                    content: '上传失败',
                    buttonText: '好的',
                    success: res => {
                        console.log(res, '上传失败')
                    }
                })
            })
        }
    },
    doOCR(fileList, accountbookId) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'invoiceInfoController.do?doOCR',
            data: {
                fileList: JSON.stringify(fileList),
                accountbookId: accountbookId
            },
            method: 'POST',
            success: res => {
                if(res.data.success) {
                    if(res.data.obj.length){
                        const result = this.hasInvoiceType(res.data.obj)
                        // 去发票编辑页面
                        if(result) {
                            dd.setStorage({
                                key: 'ocrList',
                                data:res.data.obj,
                                success: () => {
                                    dd.setStorageSync({
                                        key: 'accountbookId',
                                        data: this.data.accountbookId
                                    })
                                    dd.navigateTo({
                                        url: '/pages/invoiceSelect/index?invoiceAccountbookId=' + accountbookId
                                    })
                                }
                            })
                        }
                    }
                }else{
                    dd.alert({
                        content: res.data.msg,
                        buttonText: '好的'
                    })
                }
            }
        })
    },
    hasInvoiceType(data) {
        var noSupportInvoiceType = data.filter(item => !!this.data.nosupportInvoiceType[item.invoiceType])
        if(noSupportInvoiceType && noSupportInvoiceType.length) {
            dd.alert({
                content: `暂不支持${this.data.nosupportInvoiceType[noSupportInvoiceType[0].invoiceType]}，请重新上传`,
                buttonText: '好的'
            })
            return false
        }
        return true
    },
    // 从上传识别之后的列表选
    getSelectOcrListFromStorage() {
        const ocrList = dd.getStorageSync({key: 'selectOcrList'}).data
        if(ocrList) {
            this.saveInvoice(ocrList)
            dd.removeStorage({
                key: 'selectOcrList',
                success: () => {}
            })
        }
    },
    // 从发票录入选
    getBillInvoiceDetail() {
        const data = dd.getStorageSync({key: 'billInvoiceDetail'}).data
        if(data) {
            this.saveInvoice([data])
            dd.removeStorage({
                key: 'billInvoiceDetail',
                success: () => {}
            })
        }
    },
    // 从个人票夹选
    getOcrListFromListFromStorage() {
        const ocrList = dd.getStorageSync({key: 'ocrListFromList'}).data
        if(ocrList) {
            let data = []
            let importObj = this.data.importList[this.data.invoiceIndex]
            if(importObj.ocrList) {
                data = clone(importObj.ocrList).concat(ocrList)
            }else {
                data = ocrList
            }
            this.setInvoiceList(data)
            this.setInvoiceInFukuanDetail(data)
            dd.removeStorage({
                key: 'ocrListFromList',
                success: () => {}
            })
        }
        this.onAddHide()
    },
    saveInvoice(data) {
        data.forEach(item => {
            if(item.formatJshj) {
                delete item.formatJshj
            }
        })
        // 飞机行程单特殊处理
        data.forEach(item => {
            if(item.invoiceType == '93') {
                if(!item.qtsf) {
                    item.qtsf = 0
                }
            }
        })
        this.addLoading()
        this.addSuffix(data)
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'invoiceInfoController.do?doAddList',
            method: 'POST',
            headers:  {'Content-Type': 'application/json;charset=utf-8'},
            data: JSON.stringify(data),
            success: res => {
                if(res.data.success) {
                    let ocrList = []
                    let importObj = this.data.importList[this.data.invoiceIndex]
                    if(importObj.ocrList) {
                        ocrList = clone(importObj.ocrList).concat(res.data.obj)
                    }else{
                        ocrList = clone(res.data.obj)
                    }

                    this.setInvoiceList(ocrList)
                    this.setInvoiceInFukuanDetail(ocrList)
                }else{
                    dd.alert({
                        content: res.data.msg,
                        buttonText: '好的'
                    })
                    console.log('发票保存失败')
                }
            },
            fail: res => {
                console.log(res, 'error')
            },
            complete: res => {
                this.onAddHide()
            }
        })
    },
    addSuffix(data) {
        data && data.length && data.forEach(item => {
            Object.keys(item).forEach(key => {
                if(key == 'kprq' || key == 'rq') {
                    if(typeof item[key] == 'string' && item[key].indexOf(' ') < 0)
                        item[key] = `${item[key]} 00:00:00`
                }
            })
        })
    },
    setInvoiceList(data) {
        if(data && data.length) {
            data.forEach(item => {
                item.formatJshj = formatNumber(Number(item.jshj).toFixed(2))
            })
            let tempData = clone(this.data.importList)
            tempData[this.data.invoiceIndex].ocrList = data
            dd.setStorageSync({
                key: 'importList',
                data: tempData
            })
            this.setData({
                importList: tempData
            })

        }
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
        console.log(data, 'setInvoiceInfoId')
        console.log(this.data.invoiceIndex)
        invoiceInfoId = invoiceInfoId.slice(0, -1)
        const tempData = clone(this.data.importList)
        tempData[this.data.invoiceIndex].invoiceInfoId = invoiceInfoId
        dd.setStorageSync({
            key: 'importList',
            data: tempData
        })
        this.setData({
            importList: tempData
        })
    },
    setOtherInvoiceInfo(data) {
        this.setInvoiceApplicationAmount(data)
    },
    setInvoiceApplicationAmount(data) {
        // applicationAmount
        let applicationAmount = 0
        data.forEach(item => {
            applicationAmount += parseFloat(item.jshj)
        })
        const tempData = clone(this.data.importList)
        tempData[this.data.invoiceIndex].applicationAmount = applicationAmount
        tempData[this.data.invoiceIndex].formatApplicationAmount = formatNumber(Number(applicationAmount).toFixed(2))
        this.setData({
            importList: tempData.map(item => ({...clone(item)}))
        })
        dd.setStorageSync({
            key: 'importList',
            data: tempData
        })
    },
    deleteInvoice(e) {
        const index = e.currentTarget.dataset.index
        const parentIndex = e.currentTarget.dataset.importindex
        this.setData({
            invoiceIndex: parentIndex
        })
        const list = clone(this.data.importList[parentIndex].ocrList)
        let invoiceInfoId = list[index].id
        console.log(invoiceInfoId, 'invoiceInfoId')
        console.log(list, 'list')
        list.splice(index, 1)
        const tempData = clone(this.data.importList)
        tempData[parentIndex].ocrList = list
        dd.setStorageSync({
            key: 'importList',
            data: tempData
        })
        this.setData({
            importList: tempData
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
            data: this.data.importList[this.data.invoiceIndex].ocrList[index],
            success: res => {
                dd.navigateTo({
                    url: '/pages/invoiceInput/index'
                })
            }
        })
    },
    removeInvoiceInfoId(id) {
        let invoiceInfoId = this.data.importList[this.data.invoiceIndex].invoiceInfoId.split(',')
        let newIds = ''
        if(invoiceInfoId.length) {
            let ids = invoiceInfoId.filter(item => item !== id)
            newIds = ids.join(',')
        }
        console.log(this.data.invoiceIndex, 'invoiceIndex')
        console.log(newIds, 'newIds')
        const tempData = clone(this.data.importList)
        tempData[this.data.invoiceIndex].invoiceInfoId = newIds
        dd.setStorageSync({
            key: 'importList',
            data: tempData
        })
        this.setData({
            importList: tempData
        })
    },
    // 获取账簿id
    getAccountbookId() {
       const accountbookId = dd.getStorageSync({key: 'accountbookId'}).data
        this.setData({
            accountbookId
        })
    }
})
