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
    onShow() {
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
        if (app.globalData.loadingCount === 0) {
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
    }
})
