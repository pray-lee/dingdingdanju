import clone from "lodash/cloneDeep";
import moment from "moment";

const app = getApp()
Page({
    data: {
        hesuanMaskHidden: true,
        hesuanAnimationInfo: {},
        baoxiaoDetail: {},
        baoxiaoArr: []
    },
    onLoad() {
        const initBaoxiaoDetail = dd.getStorageSync({key: 'initBaoxiaoDetail'}).data
        const baoxiaoDetail = dd.getStorageSync({key: 'baoxiaoDetail'}).data
        console.log(baoxiaoDetail, 'baoxiaoDetail')
        if(!baoxiaoDetail) {
            this.setData({
                baoxiaoDetail: initBaoxiaoDetail
            })
        }else{
           this.setData({
               baoxiaoDetail: baoxiaoDetail
           })
            dd.removeStorage({
                key: 'baoxiaoDetail',
                success: res => {
                   console.log('清除编辑详情数据成功...')
                }
            })
        }
    },
    onShow() {
        console.log(this.data.baoxiaoArr, 'arrrrrr')
        // 获取附加信息
        dd.getStorage({
            key: 'baoxiaoDetail',
            success: res => {
                console.log(res.data)
                const baoxiaoDetail = res.data
                if(!!baoxiaoDetail) {
                    this.setData({
                        baoxiaoDetail
                    })
                }
            }
        })
        // hesuan 弹框
        var animation1 = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.hesuanaAnimation = animation1
        this.setData({
            hesuanAnimationInfo: animation1.export()
        })
    },

    onBaoxiaoBlur(e) {
        var tempData = clone(this.data.baoxiaoDetail)
        var name = e.currentTarget.dataset.name
        tempData[name] = e.detail.value
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
            this.setData({ baoxiaoDetail: baoxiaoItem
            })
        } else {
            baoxiaoItem.taxRageArr = []
            baoxiaoItem.taxRageIndex = 0
            baoxiaoItem.taxRate = ''
            this.setData({
                baoxiaoDetail: baoxiaoItem
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
    // 报销列表的onTap
    bindBaoxiaoObjPickerChange(e) {
        var name = e.currentTarget.dataset.name
        var value = e.detail.value
        var baoxiaoItem = clone(this.data.baoxiaoDetail)
        if (name === 'subjectId') {
            baoxiaoItem.subjectIndex = value
            baoxiaoItem.subjectId = baoxiaoItem.subjectList[value].id
            baoxiaoItem.subjectExtraId = baoxiaoItem.subjectList[value].subjectExtraId
            this.setData({
                baoxiaoDetail: baoxiaoItem
            })
            this.getSubjectAuxptyList('hesuan', baoxiaoItem.subjectList[value].id, baoxiaoItem.accountbookId, true, null)
        } else {
            // yusuan预算
            baoxiaoItem.trueSubjectIndex = value
            baoxiaoItem.trueSubjectId = baoxiaoItem.trueSubjectList[value].id
            this.setData({
                baoxiaoDetail: baoxiaoItem
            })
            this.getSubjectAuxptyList('yusuan', baoxiaoItem.trueSubjectList[value].id, baoxiaoItem.accountbookId, true, null)
        }
    },
    // 获取科目对应的辅助核算 (每一个都是单独调用)
    getSubjectAuxptyList(type, subjectId, accountbookId, flag, auxptyObj) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'subjectStartDetailController.do?getInfo&subjectId=' + subjectId + '&accountbookId=' + accountbookId,
            method: 'GET',
            dataType: 'json',
            success: res => {
                if (!!res.data.obj.subjectAuxptyList.length) {
                    var arr = res.data.obj.subjectAuxptyList.map(item => {
                        return {
                            auxptyId: item.auxptyId,
                            auxptyName: item.auxpropertyConfig.auxptyName
                        }
                    })
                    var tempData = clone(this.data.baoxiaoDetail)
                    if (type === 'hesuan') {
                        tempData.subjectAuxptyList = arr
                        tempData.allAuxptyList = {}
                    } else {
                        tempData.trueSubjectAuxptyList = arr
                        tempData.trueAllAuxptyList = {}
                    }
                    this.setData({
                        baoxiaoDetail: tempData
                    })
                    this.setData({
                        baoxiaoDetail: {
                            ...this.data.baoxiaoDetail,
                            subjectObject: {
                                ...this.data.baoxiaoDetail.subjectObject,
                                subjectAuxptyList: arr,
                                allAuxptyList: {}
                            }
                        }
                    })
                    // 请求辅助核算列表
                    arr.forEach(item => {
                        this.getAuxptyList(type, this.data.baoxiaoDetail.accountbookId, item.auxptyId, auxptyObj)
                    })
                    if (flag) {
                        this.onHesuanShow(type)
                    }
                } else {
                    var tempData = clone(this.data.baoxiaoDetail)
                    if (type === 'hesuan') {
                        tempData.subjectAuxptyList = []
                        tempData.allAuxptyList = {}
                        tempData.auxpropertyNames = ''
                    } else {
                        tempData.trueSubjectAuxptyList = []
                        tempData.trueAllAuxptyList = {}
                        tempData.trueAuxpropertyNames = ''
                    }
                    this.setData({
                        baoxiaoDetail: tempData
                    })
                    this.setData({
                        baoxiaoDetail: {
                            ...this.data.baoxiaoDetail,
                            subjectObject: {
                                ...this.data.baoxiaoDetail.subjectObject,
                                subjectAuxptyList: [],
                                allAuxptyList: []
                            }
                        }
                    })
                }
                this.hideLoading()
            }
        })
    },
    // 请求辅助核算列表
    getAuxptyList(type, accountbookId, auxptyid, auxptyObj) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + this.getAuxptyUrl(accountbookId, auxptyid),
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res.data.rows)
                console.log(auxptyid)
                console.log(auxptyObj)
                // 处理index
                var auxptyIndex = 0
                if (auxptyObj && auxptyObj.length) {
                    auxptyObj.forEach((item, index) => {
                        if (item.auxptyId == auxptyid) {
                            res.data.rows.forEach((row, rowIndex) => {
                                if (row.id == item.auxptyDetailId) {
                                    auxptyIndex = rowIndex
                                }
                            })
                        }
                    })
                }
                if (type === 'hesuan') {
                    var obj = {
                        [auxptyid]: {
                            data: res.data.rows,
                            index: auxptyIndex,
                            name: this.getAuxptyNameMap(auxptyid),
                            auxptyName: this.data.baoxiaoDetail.subjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                            auxptyId: auxptyid
                        }
                    }
                    var tempData = clone(this.data.baoxiaoDetail)
                    var newObj = Object.assign({}, this.data.baoxiaoDetail.allAuxptyList, obj)
                    tempData.allAuxptyList = newObj
                } else {
                    var trueObj = {
                        [auxptyid]: {
                            data: res.data.rows,
                            index: auxptyIndex,
                            name: this.getAuxptyNameMap(auxptyid),
                            auxptyName: this.data.baoxiaoDetail.trueSubjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                            auxptyId: auxptyid
                        }
                    }
                    var trueNewObj = Object.assign({}, this.data.baoxiaoDetail.trueAllAuxptyList, trueObj)
                    var tempData = clone(this.data.baoxiaoDetail)
                    tempData.trueAllAuxptyList = trueNewObj
                }
                this.setData({
                    baoxiaoDetail: tempData
                })
                if (this.data.baoxiaoDetail.subjectObject.subjectAuxptyList.length) {
                    var auxptyName = ''
                    var filterArr = this.data.baoxiaoDetail.subjectObject.subjectAuxptyList.filter(item => auxptyid == item.auxptyId)
                    if (filterArr.length) {
                        auxptyName = filterArr[0].auxptyName
                    }
                    var obj = {
                        [auxptyid]: {
                            data: res.data.rows,
                            index: auxptyIndex,
                            name: this.getAuxptyNameMap(auxptyid),
                            auxptyName,
                            auxptyId: auxptyid
                        }
                    }
                }
                var newObj = Object.assign({}, this.data.baoxiaoDetail.subjectObject.allAuxptyList, obj)
                this.setData({
                    baoxiaoDetail: {
                        ...this.data.baoxiaoDetail,
                        subjectObject: {
                            ...this.data.baoxiaoDetail.subjectObject,
                            allAuxptyList: newObj
                        }
                    }
                })
                this.hideLoading()
            }
        })
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
    onHesuanShow(type) {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.hesuanAnimation = animation
        animation.translateY(0).step()
        this.setData({
            hesuanAnimationInfo: animation.export(),
            hesuanMaskHidden: false,
            hesuanType: type
        })
        // 弹框数据清空
    },
    onHesuanHide() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.hesuanAnimation = animation
        animation.translateY('100%').step()
        this.setData({
            hesuanAnimationInfo: animation.export(),
            hesuanMaskHidden: true
        })
    },
    onHesuanSubmit(e) {
        // 辅助核算字符串拼接
        var tempData = clone(this.data.baoxiaoDetail)
        if (this.data.hesuanType === 'hesuan') {
            var billDetailApEntityListObj = []
            var auxptyNameStr = ''
            var tempAllAuxptyList = tempData.allAuxptyList
            for (var i in tempAllAuxptyList) {
                auxptyNameStr += `${tempAllAuxptyList[i].auxptyName}_${tempAllAuxptyList[i].data[tempAllAuxptyList[i].index][this.getAuxptyNameMap(tempAllAuxptyList[i].auxptyId)]},`
                billDetailApEntityListObj.push({
                    auxptyId: tempAllAuxptyList[i].auxptyId,
                    auxptyDetailId: tempAllAuxptyList[i]["data"][tempAllAuxptyList[i].index].id
                })
            }
            tempData.auxpropertyNames = auxptyNameStr.slice(0, -1)
            tempData.billDetailApEntityListObj = billDetailApEntityListObj
        } else {
            var billDetailTrueApEntityListObj = []
            var trueAuxptyNameStr = ''
            var trueTempAllAuxptyList = tempData.trueAllAuxptyList
            for (var i in trueTempAllAuxptyList) {
                trueAuxptyNameStr += `${trueTempAllAuxptyList[i].auxptyName}_${trueTempAllAuxptyList[i].data[trueTempAllAuxptyList[i].index][this.getAuxptyNameMap(trueTempAllAuxptyList[i].auxptyId)]},`
                billDetailTrueApEntityListObj.push({
                    auxptyId: trueTempAllAuxptyList[i].auxptyId,
                    auxptyDetailId: trueTempAllAuxptyList[i]["data"][trueTempAllAuxptyList[i].index].id
                })
            }
            tempData.trueAuxpropertyNames = trueAuxptyNameStr.slice(0, -1)
            tempData.billDetailTrueApEntityListObj = billDetailTrueApEntityListObj
        }
        this.setData({
            baoxiaoDetail: tempData
        })
        this.onHesuanHide()
    },
    checkFocus(e) {
        var name = e.currentTarget.dataset.name
        var subjectAuxptyName = e.currentTarget.dataset.subjectAuxptyName
        // var index = e.currentTarget.dataset.index
        var type = name === 'auxpropertyNames' ? 'hesuan' : 'yusuan'
        if(this.data.baoxiaoDetail[subjectAuxptyName].length) {
            this.onHesuanShow(type)
        }
    },
    // 核算维度onChange
    specialBindObjPickerChange(e) {
        var auxptyId = e.currentTarget.dataset.id
        var tempData = clone(this.data.baoxiaoDetail)
        if (this.data.hesuanType === 'hesuan') {
            tempData.allAuxptyList = {
                ...tempData.allAuxptyList,
                [auxptyId]: {
                    ...tempData.allAuxptyList[auxptyId],
                    index: e.detail.value
                }
            }
        } else {
            tempData.trueAllAuxptyList = {
                ...tempData.trueAllAuxptyList,
                [auxptyId]: {
                    ...tempData.trueAllAuxptyList[auxptyId],
                    index: e.detail.value
                }
            }
        }
        this.setData({
            baoxiaoDetail: tempData
        })
    },
    submitBaoxiaoDetail() {
        this.setData({
            baoxiaoArr: this.data.baoxiaoArr.concat(this.data.baoxiaoDetail)
        })
        this.addLoading()
        dd.setStorage({
            key: 'newBaoxiaoDetailArr',
            data: this.data.baoxiaoArr,
            success: res => {
                this.hideLoading()
                dd.navigateBack({
                    delta: 1
                })
            }
        })
    },
    addDetail() {
        console.log(this.data.baoxiaoArr.concat(this.data.baoxiaoDetail))
        this.setData({
            baoxiaoArr: this.data.baoxiaoArr.concat(this.data.baoxiaoDetail)
        })
        this.setData({
            baoxiaoDetail: dd.getStorageSync({key: 'initBaoxiaoDetail'}).data
        })
    },
    openExtraInfo(e) {
        var extraId = e.currentTarget.dataset.extraId
        if (this.data.baoxiaoDetail.subjectExtraId) {
            this.getExtraInfo(extraId)
        }
    },
    getExtraInfo(extraId) {
        this.addLoading()
        // 接口有问题
        dd.httpRequest({
            url: app.globalData.url + 'reimbursementBillExtraController.do?getDetail&subjectExtraId=' + extraId,
            method: 'GET',
            dataType: 'json',
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
                            this.hideLoading()
                            dd.navigateTo({
                                url: '/pages/extra/index'
                            })
                        }
                    })
                }
            }
        })
    },

})
