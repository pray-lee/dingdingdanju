import clone from "lodash/cloneDeep";
import moment from "moment";
import {formatNumber, validFn, request} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        btnHidden: false,
        noticeHidden: true,
        baoxiaoDetail: {},
        baoxiaoArr: [],
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
        const isEdit = dd.getStorageSync({key: 'edit'}).data
        const initBaoxiaoDetail = dd.getStorageSync({key: 'initBaoxiaoDetail'}).data
        const baoxiaoDetail = dd.getStorageSync({key: 'baoxiaoDetail'}).data
        if (!baoxiaoDetail) {
            this.setData({
                baoxiaoDetail: initBaoxiaoDetail
            })
        } else {
            if (isEdit) {
                this.getSubjectAuxptyList(baoxiaoDetail.subjectId, baoxiaoDetail.accountbookId, false)
                dd.removeStorage({
                    key: 'edit',
                    success: res => {
                        console.log('清除isEdit成功')
                    }
                })
            }
            this.setData({
                baoxiaoDetail: baoxiaoDetail,
            })
        }
    },
    getBorrowIdFromStorage() {
        // 从缓存里获取借款人id
        const borrowId = dd.getStorageSync({key: 'borrowId'}).data
        if (!!borrowId) {
            var borrowIndex = 0
            this.data.borrowList.forEach((item, index) => {
                if (item.id === borrowId) {
                    borrowIndex = index
                }
            })
            this.setData({
                borrowIndex,
                submitData: {
                    ...this.data.submitData,
                    applicantId: borrowId
                }
            })
            setTimeout(() => {
                this.getIncomeBankList(this.data.submitData.applicantType, borrowId)
            })
        }
    },
    getAuxptyIdFromStorage() {
        // 从缓存里获取auxpty
        const auxpty = dd.getStorageSync({key: 'auxpty'}).data
        if (!!auxpty) {
            this.setSelectedAuxpty(auxpty)
            dd.removeStorage({
                key: 'auxpty'
            })
        }
    },
    getSubjectIdFromStorage() {
        // 从缓存里获取科目id
        const subject = dd.getStorageSync({key: 'subject'}).data
        if (!!subject && subject !== null) {
            this.setData({
                baoxiaoDetail: {
                    ...this.data.baoxiaoDetail,
                    selectedAuxpty: null,
                    subjectId: subject.id,
                    subjectExtraId: subject.subjectExtraId,
                    subjectName: subject.name,
                    billDetailTrueApEntityListObj: [],
                    billDetailApEntityListObj: [],
                    applicationAmount: '',
                }
            })
            dd.removeStorage({
                key: 'subject'
            })
            this.getSubjectAuxptyList(subject.id, this.data.baoxiaoDetail.accountbookId, true)
        }
    },
    onAddShow() {
        this.animation.translateY(0).step()
        this.setData({
            animationInfo: this.animation.export(),
            maskHidden: false
        })
    },
    onAddHide() {
        this.animation.translateY('100%').step()
        this.setData({
            animationInfo: this.animation.export(),
            maskHidden: true
        })
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
        this.getSelectOcrListFromStorage()
        this.getBillInvoiceDetail()
        this.getOcrListFromListFromStorage()
        // =======================
        // ========页面显示=======
        setTimeout(() => {
            this.getAuxptyIdFromStorage()
            this.getBorrowIdFromStorage()
            this.getSubjectIdFromStorage()
        }, 300)
        const baoxiaoDetail = dd.getStorageSync({
            key: 'baoxiaoDetail',
        }).data
        if (!!baoxiaoDetail) {
            this.setData({
                baoxiaoDetail,
                noticeHidden: baoxiaoDetail.invoiceType == 2 ? false : true
            })

        }else{
            this.setData({
                noticeHidden: this.data.baoxiaoDetail.invoiceType == 2 ? false: true
            })
        }
        console.log(baoxiaoDetail, 'onShow')
        dd.removeStorage({
            key: 'baoxiaoDetail',
            success: res => {
                console.log('清除编辑详情数据成功...')
            }
        })
    },
    onBaoxiaoBlur(e) {
        var tempData = clone(this.data.baoxiaoDetail)
        var name = e.currentTarget.dataset.name
        tempData[name] = e.detail.value
        if (name === 'applicationAmount') {
            tempData['formatApplicationAmount'] = formatNumber(Number(e.detail.value).toFixed(2))
        }
        this.setData({
            baoxiaoDetail: tempData,
        })
    },
    baoxiaoRadioChange(e) {
        var value = e.detail.value ? 2 : 1
        var baoxiaoItem = clone(this.data.baoxiaoDetail)
        baoxiaoItem.invoiceType = value
        if (value == 2) {
            baoxiaoItem.taxRageArr = baoxiaoItem.taxRageObject.taxRageArr
            baoxiaoItem.taxRageIndex = 0
            baoxiaoItem.taxRate = baoxiaoItem.taxRageObject.taxRageArr[0].id
            baoxiaoItem.noticeHidden = false
            this.setData({
                baoxiaoDetail: baoxiaoItem,
                noticeHidden: false
            })
        } else {
            baoxiaoItem.taxRageArr = []
            baoxiaoItem.taxRageIndex = 0
            baoxiaoItem.taxRate = ''
            baoxiaoItem.noticeHidden = true
            this.setData({
                baoxiaoDetail: baoxiaoItem,
                noticeHidden: true
            })
        }
    },
    // 税率点击
    bindTaxRagePickerChange(e) {
        var baoxiaoItem = clone(this.data.baoxiaoDetail)
        var value = e.detail.value
        baoxiaoItem.taxRageIndex = value
        baoxiaoItem.taxRate = baoxiaoItem.taxRageArr[value].id
        this.setData({
            baoxiaoDetail: baoxiaoItem
        })
    },
    // 获取科目对应的辅助核算 (每一个都是单独调用)
    getSubjectAuxptyList(subjectId, accountbookId, flag) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'subjectStartDetailController.do?getInfo&subjectId=' + subjectId + '&accountbookId=' + accountbookId,
            method: 'GET',
            success: res => {
                if (!!res.data.obj.subjectAuxptyList.length) {
                    var arr = res.data.obj.subjectAuxptyList.map(item => {
                        return {
                            auxptyId: item.auxptyId,
                            auxptyName: item.auxpropertyConfig.auxptyName
                        }
                    })
                    this.setData({
                        baoxiaoDetail: {
                            ...this.data.baoxiaoDetail,
                            subjectAuxptyList: arr
                        }
                    })
                    arr.forEach(item => {
                        this.getAuxptyList(accountbookId, item.auxptyId, flag)
                    })
                } else {
                    this.setData({
                        baoxiaoDetail: {
                            ...this.data.baoxiaoDetail,
                            subjectAuxptyList: [],
                            allAuxptyList: {},
                        }
                    })
                }
            }
        })
    },
    // 请求辅助核算列表
    getAuxptyList(accountbookId, auxptyid, flag) {
        console.log(auxptyid, 'auxptyid')
        console.log(this.data.baoxiaoDetail)
        this.addLoading()
        let url = this.getAuxptyUrl(accountbookId, auxptyid)
        if(auxptyid == 2 && this.data.baoxiaoDetail.applicantType == 10) {
            url = url + '&id=' + this.data.baoxiaoDetail.applicantId
        }
        if(auxptyid == 3 && this.data.baoxiaoDetail.applicantType == 20) {
            url = url + '&id=' + this.data.baoxiaoDetail.applicantId
        }
        if(auxptyid == 4 && this.data.baoxiaoDetail.applicantType == 30) {
            url = url + '&id=' + this.data.baoxiaoDetail.applicantId
        }
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + url,
            method: 'GET',
            success: res => {
                const name = this.getAuxptyNameMap(auxptyid)
                console.log(res.data.rows, 'res.data.rows')
                const newObj = res.data.rows.map(item => {
                    return {
                        id: item.id,
                        name: item[name],
                        auxptyId: auxptyid
                    }
                })
                const tempData = clone(this.data.baoxiaoDetail.allAuxptyList)
                tempData[auxptyid] = newObj
                console.log(tempData)
                this.setData({
                    baoxiaoDetail: {
                        ...this.data.baoxiaoDetail,
                        allAuxptyList: tempData
                    }
                })
                if(flag) {
                    // 设置默认值
                    let index = null
                    if (auxptyid == 1) {
                        // 部门
                        // 部门
                        let submitterDepartmentId = ''
                        if(this.data.baoxiaoDetail.selectedAuxpty && this.data.baoxiaoDetail.selectedAuxpty[auxptyid]) {
                            submitterDepartmentId = this.data.baoxiaoDetail.selectedAuxpty[auxptyid].id
                        }else{
                            submitterDepartmentId = this.data.baoxiaoDetail.submitterDepartmentId
                        }
                        index = this.setInitIndex(newObj, submitterDepartmentId)
                    }
                    if (auxptyid == 2 && this.data.baoxiaoDetail.applicantType == 10) {
                        index = this.setInitIndex(newObj, this.data.baoxiaoDetail.applicantId)
                    }
                    if (auxptyid == 3 && this.data.baoxiaoDetail.applicantType == 20) {
                        index = this.setInitIndex(newObj, this.data.baoxiaoDetail.applicantId)
                    }
                    if (auxptyid == 4 && this.data.baoxiaoDetail.applicantType == 30) {
                        index = this.setInitIndex(newObj, this.data.baoxiaoDetail.applicantId)
                    }
                    if (index !== null) {
                        this.setSelectedAuxpty(newObj[index])
                    }
                }
            }
        })
    },
    setSelectedAuxpty(auxpty) {
        this.setData({
            baoxiaoDetail: {
                ...this.data.baoxiaoDetail,
                selectedAuxpty: {
                    ...this.data.baoxiaoDetail.selectedAuxpty,
                    [auxpty.auxptyId]: {
                        id: auxpty.id,
                        name: auxpty.name,
                        auxptyId: auxpty.auxptyId
                    }
                }
            }
        })
        const obj = Object.values(this.data.baoxiaoDetail.selectedAuxpty).map(item => {
            return {
                auxptyId: item.auxptyId,
                auxptyDetailId: item.id
            }
        })
        this.setData({
            baoxiaoDetail: {
                ...this.data.baoxiaoDetail,
                billDetailApEntityListObj: obj
            }
        })
    },
    setInitIndex(newObj, id) {
        let initIndex = 0
        newObj.forEach((item, index) => {
            if (item.id === id) {
                initIndex = index
            }
        })
        return initIndex
    },
    // 辅助核算请求url分类
    getAuxptyUrl(accountbookId, auxptyid) {
        var url = ''
        switch (auxptyid) {
            case "1":
                // 部门
                url = "newDepartDetailController.do?datagrid&field=id,depart.departName&status=1&depart.departStatus=1&accountbookId=" + accountbookId
                break
            case "2":
                // 职员
                url = "userController.do?datagrid&field=id,realName&accountbookIds=" + accountbookId
                break
            case "3":
                // 供应商
                url = "supplierDetailController.do?datagrid&field=id,supplier.supplierName&status=1&accountbookId=" + accountbookId
                break
            case "4":
                // 客户
                url = "customerDetailController.do?datagrid&field=id,customer.customerName&customerStatus=1&accountbookId=" + accountbookId
                break
            default:
                url = "auxpropertyDetailController.do?datagridByAuxpropertyPop&field=id,auxptyDetailName&auxptyId=" + auxptyid + "&accountbookId=" + accountbookId
        }
        return url
    },
    // 获取辅助核算名字的map
    getAuxptyNameMap(auxptyid) {
        var name = ''
        switch (auxptyid) {
            case "1":
                // 部门
                name = 'depart.departName'
                break
            case "2":
                // 职员
                name = 'realName'
                break
            case "3":
                // 供应商
                name = 'supplier.supplierName'
                break
            case "4":
                // 客户
                name = "customer.customerName"
                break
            default:
                name = "auxptyDetailName"
        }
        return name
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
    submitBaoxiaoDetail() {
        const validSuccess = this.valid(this.data.baoxiaoDetail)
        if(validSuccess) {
            this.setData({
                baoxiaoArr: this.data.baoxiaoArr.concat(this.data.baoxiaoDetail)
            })
            const tempData = clone(this.data.baoxiaoArr)
            tempData.forEach(item => {
                item.trueSubjectId = item.subjectId
                item.billDetailTrueApEntityListObj = clone(item.billDetailApEntityListObj)
            })
            this.addLoading()
            dd.setStorage({
                key: 'newBaoxiaoDetailArr',
                data: tempData,
                success: res => {
                    this.hideLoading()
                    dd.navigateBack({
                        delta: 1
                    })
                }
            })
        }
    },
    addDetail() {
        const validSuccess = this.valid(this.data.baoxiaoDetail)
        if (validSuccess) {
            this.setData({
                baoxiaoArr: this.data.baoxiaoArr.concat(this.data.baoxiaoDetail)
            })
            this.setData({
                baoxiaoDetail: dd.getStorageSync({key: 'initBaoxiaoDetail'}).data
            })
        }
    },
    openExtraInfo(e) {
        var extraId = e.currentTarget.dataset.extraId
        if (this.data.baoxiaoDetail.subjectExtraId) {
            this.getExtraInfo(extraId)
        }
    },
    getExtraInfo(extraId) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'reimbursementBillExtraController.do?getDetail&subjectExtraId=' + extraId,
            method: 'GET',
            success: res => {
                console.log(res, '附加信息............')
                if (res.data.success) {
                    this.setData({
                        subjectExtraConf: JSON.parse(res.data.obj),
                    })
                    // 回显
                    var tempData = clone(this.data.baoxiaoDetail)
                    if (!tempData.extraMessage) {
                        tempData.extraMessage = []
                        tempData.extraList = []
                        this.setData({
                            baoxiaoDetail: tempData
                        })
                    }
                    dd.setStorage({
                        key: 'subjectExtraConf',
                        data: JSON.parse(res.data.obj),
                        success: res => {
                            dd.setStorageSync({
                                key: 'extraBaoxiaoDetail',
                                data: this.data.baoxiaoDetail
                            })
                            dd.navigateTo({
                                url: '/pages/extra/index'
                            })
                        }
                    })
                }
            }
        })
    },
    goSubjectPage() {
        dd.navigateTo({
            url: '/pages/subjectPage/index'
        })
    },
    goAuxptyPage(e) {
        const auxptyId = e.currentTarget.dataset.id
        console.log(auxptyId, 'auxptyId,......')
        dd.setStorage({
            key: 'auxptyList',
            data: this.data.baoxiaoDetail.allAuxptyList[auxptyId],
            success: res => {
                dd.navigateTo({
                    url: '/pages/auxptyPage/index'
                })
            }
        })
    },
    valid(obj) {
        console.log(obj, '..........')
        if (!obj.subjectId) {
            validFn('请选择费用类型')
            return false
        }
        if (Number(obj.applicationAmount) <= 0) {
            validFn('申请报销金额为空')
            return false
        }
        if (!obj.taxRate && obj.invoiceType == 2) {
            validFn('请选择税率')
            return false
        }
        return true
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
    // 发票相关
    handleUpload() {
        dd.chooseImage({
            count: 9,
            success: res => {
                this.uploadFile(res.filePaths)
            },
            fail: res => {
                console.log('用户取消操作')
            }
        })
    },
    invoiceInput() {
        dd.setStorageSync({
            key: 'fromDetail',
            data: 'fromDetail'
        })
        dd.setStorageSync({
            key: 'accountbookId',
            data: this.data.baoxiaoDetail.accountbookId
        })
        dd.navigateTo({
            url: '/pages/invoiceInput/index'
        })
    },
    invoiceSelect() {
        dd.navigateTo({
            url: '/pages/invoiceListSelect/index'
        })
    },
    /**
     *
     * @param 上传图片字符串列表
     */
    uploadFile(array) {
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
                            accountbookId: 'accountbook-invoice',
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
                this.doOCR(billFilesList)
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
    doOCR(fileList) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'invoiceInfoController.do?doOCR',
            data: {
                fileList: JSON.stringify(fileList),
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
                                        data: this.data.baoxiaoDetail.accountbookId
                                    })
                                    dd.navigateTo({
                                        url: '/pages/invoiceSelect/index'
                                    })
                                }
                            })
                        }
                    }
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
            this.setInvoiceList(ocrList)
            this.setInvoiceInBaoxiaoDetail(ocrList)
            dd.removeStorage({
                key: 'ocrListFromList',
                success: () => {}
            })
        }
        this.onAddHide()
    },
    saveInvoice(data) {
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
                    this.setInvoiceList(res.data.obj)
                    this.setInvoiceInBaoxiaoDetail(res.data.obj)
                }else{
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
                    if(item[key].indexOf(' ') < 0)
                        item[key] = `${item[key]} 00:00:00`
                }
            })
        })
    },
    setInvoiceList(data) {
        if(data && data.length) {
            this.setData({
                ocrList: data
            })
        }
    },
    setInvoiceInBaoxiaoDetail(data) {
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
            baoxiaoDetail: {
                ...this.data.baoxiaoDetail,
                invoiceInfoId
            }
        })
    },
    setOtherInvoiceInfo(data) {
        this.setInvoiceApplicationAmount(data)
        this.setInvoiceRate(data)
    },
    setInvoiceApplicationAmount(data) {
        // applicationAmount
        let applicationAmount = 0
        data.forEach(item => {
            applicationAmount += parseFloat(item.jshj)
        })
        this.setData({
            baoxiaoDetail: {
                ...this.data.baoxiaoDetail,
                applicationAmount,
                formatApplicationAmount: formatNumber(Number(applicationAmount).toFixed(2))
            }
        })

    },
    setInvoiceRate(data) {
        // 税率 专票处理
        const selectedObj = data[0]
        if(selectedObj.invoiceType == '01' || selectedObj.invoiceType == '08') {
            this.setZhuanpiao(selectedObj)
        }else if( selectedObj.invoiceType == '04'|| selectedObj.invoiceType == "10" || selectedObj.invoiceType == "11") {
            if(selectedObj.invoiceDetailEntityObj) {
                if(invoiceDetail.hwmc.indexOf('客运') != -1) {
                    this.setZhuanpiao(selectedObj)
                }else{
                    this.setPupiao(selectedObj)
                }
            }
        }else if(selectedObj.invoiceType == '95') {
            this.setPupiao(selectedObj)
        }else if(selectedObj.invoiceType == '92') {
            this.setZhuanpiao(selectedObj)
        }else if(selectedObj.invoiceType == '93') {
            this.setZhuanpiao(selectedObj)
        }else if(selectedObj.invoiceType == '91') {
            this.setPupiao(selectedObj)
        }else if(selectedObj.invoiceType == '88' || selectedObj.invoiceType == '94') {
            this.setZhuanpiao(selectedObj)
        }else if(selectedObj.invoiceType == '98') {
            this.setZhuanpiao(selectedObj)
        }else if(selectedObj.invoiceType == '97') {
            this.setPupiao(selectedObj)
        }
    },
    // 专票
    setZhuanpiao(selectedObj) {
        // 税率 专票处理
        let invoiceType = this.data.baoxiaoDetail.invoiceType
        let taxRageIndex = this.data.baoxiaoDetail.taxRageIndex
        let taxRate = this.data.baoxiaoDetail.taxRate
        let noticeHidden = true
        let taxRageArr = []
        // 专票
        invoiceType = '2'
        noticeHidden = false
        taxRageArr = this.data.baoxiaoDetail.taxRageObject.taxRageArr
        if(selectedObj.invoiceType == '01' || selectedObj.invoiceType == '08' || selectedObj.invoiceType == '04' || selectedObj.invoiceType == '10' || selectedObj.invoiceType == '11') {
            if(selectedObj.invoiceDetailEntityObj) {
                taxRate = selectedObj.invoiceDetailEntityObj[0].sl
            }
        }else if(selectedObj.invoiceType == '92') {
            taxRate = '9'
        }else if(selectedObj.invoiceType == '93') {
            taxRate = '9'
        }else if(selectedObj.invoiceType == '88' || selectedObj.invoiceType == '94') {
            taxRate = '3'
        }else if(selectedObj.invoiceType == '98') {
            taxRate = '5'
        }
        taxRageArr.forEach((item, index) => {
            if(taxRate == item.id) {
                taxRageIndex = index
            }
        })
        this.setData({
            baoxiaoDetail: {
                ...this.data.baoxiaoDetail,
                invoiceType,
                taxRate,
                taxRageIndex,
                noticeHidden,
                taxRageArr

            }
        })
    },
    // 普票
    setPupiao(selectedObj) {
        // 普票处理
        let invoiceType = this.data.baoxiaoDetail.invoiceType
        let taxRageIndex = this.data.baoxiaoDetail.taxRageIndex
        let taxRate = this.data.baoxiaoDetail.taxRate
        let noticeHidden = true
        let taxRageArr = []
        invoiceType = '1'
        noticeHidden = true
        taxRageArr = []
        taxRageIndex = 0
        taxRate = ''
        this.setData({
            baoxiaoDetail: {
                ...this.data.baoxiaoDetail,
                invoiceType,
                taxRate,
                taxRageIndex,
                noticeHidden,
                taxRageArr
            }
        })
    },
    deleteInvoice(e) {
        const index = e.currentTarget.dataset.index
        const list = clone(this.data.ocrList)
        list.splice(index, 1)
        this.setData({
            ocrList: list
        })
        this.setInvoiceApplicationAmount(list)
        this.setInvoiceInBaoxiaoDetail(list)
    }
})
