import clone from "lodash/cloneDeep";
import moment from "moment";
import {formatNumber, validFn, request} from "../../util/getErrorMessage";

const app = getApp()
Page({
    data: {
        isPhoneXSeries: false,
        btnHidden: false,
        kaipiaoDetail: {},
        kaipiaoArr: [],
    },
    onLoad() {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        const isEdit = dd.getStorageSync({key: 'edit'}).data
        const initKaipiaoDetail = dd.getStorageSync({key: 'initKaipiaoDetail'}).data
        const kaipiaoDetail = dd.getStorageSync({key: 'kaipiaoDetail'}).data
        if (!kaipiaoDetail) {
            this.setData({
                kaipiaoDetail: initKaipiaoDetail
            })
        } else {
            if (isEdit) {
                this.getSubjectAuxptyList(kaipiaoDetail.subjectId, kaipiaoDetail.accountbookId, false)
                dd.removeStorage({
                    key: 'edit',
                    success: res => {
                        console.log('清除isEdit成功')
                    }
                })
            }
            this.setData({
                kaipiaoDetail: kaipiaoDetail
            })
            console.log(kaipiaoDetail, '..................')
        }
        console.log('onLoad')
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
        console.log(subject, '...........')
        if (!!subject && subject !== null) {
            this.setData({
                kaipiaoDetail: {
                    ...this.data.kaipiaoDetail,
                    selectedAuxpty: null,
                    subjectId: subject.id,
                    subjectName: subject.name,
                    billDetailTrueApEntityListObj: [],
                    billDetailApEntityListObj: [],
                    applicationAmount: '',
                }
            })
            dd.removeStorage({
                key: 'subject'
            })
            this.getSubjectAuxptyList(subject.id, this.data.kaipiaoDetail.accountbookId, true)
        }
    },
    onShow() {
        setTimeout(() => {
            this.getAuxptyIdFromStorage()
            this.getSubjectIdFromStorage()
        }, 300)
        const kaipiaoDetail = dd.getStorageSync({
            key: 'kaipiaoDetail',
        }).data
        if (!!kaipiaoDetail) {
            this.setData({
                kaipiaoDetail
            })
        }
        dd.removeStorage({
            key: 'kaipiaoDetail',
            success: res => {
                console.log('清除编辑详情数据成功...')
            }
        })
    },
    onKaipiaoBlur(e) {
        var tempData = clone(this.data.kaipiaoDetail)
        var name = e.currentTarget.dataset.name
        tempData[name] = e.detail.value
        if (name === 'applicationAmount') {
            tempData['formatApplicationAmount'] = formatNumber(Number(e.detail.value).toFixed(2))
        }
        this.setData({
            kaipiaoDetail: tempData,
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
                        kaipiaoDetail: {
                            ...this.data.kaipiaoDetail,
                            subjectAuxptyList: arr
                        }
                    })
                    arr.forEach(item => {
                        this.getAuxptyList(accountbookId, item.auxptyId, flag)
                    })
                } else {
                    this.setData({
                        kaipiaoDetail: {
                            ...this.data.kaipiaoDetail,
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
                const tempData = clone(this.data.kaipiaoDetail.allAuxptyList)
                tempData[auxptyid] = newObj
                console.log(tempData)
                this.setData({
                    kaipiaoDetail: {
                        ...this.data.kaipiaoDetail,
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
                        if(this.data.kaipiaoDetail.selectedAuxpty && this.data.kaipiaoDetail.selectedAuxpty[auxptyid]) {
                            submitterDepartmentId = this.data.kaipiaoDetail.selectedAuxpty[auxptyid].id
                        }else{
                            submitterDepartmentId = this.data.kaipiaoDetail.submitterDepartmentId
                        }
                        index = this.setInitIndex(newObj, submitterDepartmentId)
                    }
                    if (auxptyid == 2 && this.data.kaipiaoDetail.applicantType == 10) {
                        index = this.setInitIndex(newObj, this.data.kaipiaoDetail.applicantId)
                    }
                    if (auxptyid == 3 && this.data.kaipiaoDetail.applicantType == 20) {
                        index = this.setInitIndex(newObj, this.data.kaipiaoDetail.applicantId)
                    }
                    if (auxptyid == 4 && this.data.kaipiaoDetail.applicantType == 30) {
                        index = this.setInitIndex(newObj, this.data.kaipiaoDetail.applicantId)
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
            kaipiaoDetail: {
                ...this.data.kaipiaoDetail,
                selectedAuxpty: {
                    ...this.data.kaipiaoDetail.selectedAuxpty,
                    [auxpty.auxptyId]: {
                        id: auxpty.id,
                        name: auxpty.name,
                        auxptyId: auxpty.auxptyId
                    }
                }
            }
        })
        const obj = Object.values(this.data.kaipiaoDetail.selectedAuxpty).map(item => {
            return {
                auxptyId: item.auxptyId,
                auxptyDetailId: item.id
            }
        })
        this.setData({
            kaipiaoDetail: {
                ...this.data.kaipiaoDetail,
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
    submitKaipiaoDetail() {
        const validSuccess = this.valid(this.data.kaipiaoDetail)
        if(validSuccess) {
            this.setData({
                kaipiaoArr: this.data.kaipiaoArr.concat(this.data.kaipiaoDetail)
            })
            const tempData = clone(this.data.kaipiaoArr)
            tempData.forEach(item => {
                item.trueSubjectId = item.subjectId
                item.billDetailTrueApEntityListObj = clone(item.billDetailApEntityListObj)
            })
            this.addLoading()
            dd.setStorage({
                key: 'newKaipiaoDetailArr',
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
        const validSuccess = this.valid(this.data.kaipiaoDetail)
        if (validSuccess) {
            this.setData({
                kaipiaoArr: this.data.kaipiaoArr.concat(this.data.kaipiaoDetail)
            })
            this.setData({
                kaipiaoDetail: dd.getStorageSync({key: 'initKaipiaoDetail'}).data
            })
        }
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
            data: this.data.kaipiaoDetail.allAuxptyList[auxptyId],
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
