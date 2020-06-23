import moment from 'moment'
import {getErrorMessage, submitSuccess} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        uploadSrc: '',
        type: '',
        billId: '',
        maskHidden: true,
        hesuanMaskHidden: true,
        animationInfo: {},
        hesuanAnimationInfo: {},
        borrowAmount: '',
        remark: '',
        accountbookIndex: 0,
        accountbookList: [],
        departmentIndex: 0,
        departmentList: [],
        borrowIndex: 0,
        borrowList: [],
        incomeBankIndex: 0,
        incomeBankList: [],
        subjectIndex: 0,
        subjectList: [],
        // 资金计划列表
        capitalTypeIndex: 0,
        capitalTypeList: [],
        applicantIndex: 0,
        applicantType: [
            {
                id: 10,
                name: '职员'
            },
            {
                id: 20,
                name: '供应商'
            },
            {
                id: 30,
                name: '客户'
            }
        ],
        // 科目下挂着的辅助核算
        subjectAuxptyList: [],
        // 辅助核算列表(所有)
        allAuxptyList: {},
        isCapitalTypeStart: false,
        submitData: {
            billApEntityListObj: [],
            billDetailListObj: [],
            billFilesObj: [],
            submitDate: moment().format('YYYY-MM-DD'),
            applicantType: 10,
            invoice: 0,
            auxpropertyNames: '',
            businessDateTime: moment().format('YYYY-MM-DD'),
            amount: 0,
            status: 20,
            userName: '',
            billCode: ''
        }
    },
    formatSubmitData(array, name) {
        console.log(array)
        if (array.length) {
            array.forEach((item, index) => {
                Object.keys(item).forEach(keys => {
                    console.log(keys)
                    this.setData({
                        submitData: {
                            ...this.data.submitData,
                            [`${name}[${index}].${keys}`]: item[keys]
                        }
                    })
                })

            })
        }
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
    formSubmit(e) {
        // 处理一下提交格式
        this.formatSubmitData(this.data.submitData.billDetailListObj, 'billDetailList')
        this.formatSubmitData(this.data.submitData.billApEntityListObj, 'billApEntityList')
        this.formatSubmitData(this.data.submitData.billFilesObj, 'billInternetFiles')
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log(this.data)
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        this.addLoading()
        var url = ''
        if (this.data.type === 'add') {
            url = app.globalData.url + 'borrowBillController.do?doAdd'
        } else {
            url = app.globalData.url + 'borrowBillController.do?doUpdate&id=' + this.data.billId
        }
        dd.httpRequest({
            url,
            method: 'POST',
            dataType: 'json',
            data: this.data.submitData,
            success: res => {
                if (res.data && typeof res.data == 'string') {
                    getErrorMessage(res.data)
                }
                // 提交成功
                if (res.data.success) {
                    submitSuccess()
                }
                this.hideLoading()
            },
            fail: res => {
                if (res.data && typeof res.data == 'string') {
                    getErrorMessage(res.data)
                }
                console.log(res, 'fail')
                this.hideLoading()
            }
        })
    },
    radioChange(e) {
        this.setData({
            submitData: {
                ...this.data.submitData,
                invoice: e.detail.value
            }
        })
    },
    bindObjPickerChange(e) {
        var name = e.currentTarget.dataset.name
        var listName = e.currentTarget.dataset.list
        var value = e.detail.value
        var index = e.currentTarget.dataset.index
        // 设置当前框的值
        if (name !== 'incomeBankName') {
            this.setData({
                [index]: e.detail.value,
                submitData: {
                    ...this.data.submitData,
                    [name]: this.data[listName][value].id
                }
            })
        } else {
            this.setData({
                [index]: e.detail.value,
                submitData: {
                    ...this.data.submitData,
                    [name]: this.data[listName][value].bankName
                }
            })
        }
        // --------------------------------------------------------
        if (name === 'accountbookId') {
            this.getDepartmentList(this.data[listName][value].id)
            this.getBorrowBillList(this.data[listName][value].id, 10)
            this.isCapitalTypeStart(this.data[listName][value].id)
        }
        if (name === 'submitterDepartmentId') {
            this.getSubjectList(this.data.submitData.accountbookId, this.data[listName][value].id)
        }
        if (name === 'subjectId') {
            this.getSubjectAuxptyList(this.data[listName][value].id, this.data.submitData.accountbookId, true)
        }
        if (name === 'applicantType') {
            this.getBorrowBillList(this.data.submitData.accountbookId, this.data[listName][value].id)
        }
        if (name === 'applicantId') {
            this.getIncomeBankList(this.data.submitData.applicantType, this.data[listName][value].id)
        }
        if (name === 'incomeBankName') {
            this.setIncomeBankAccount(this.data[listName][value].bankAccount)
        }
    },
    // 核算维度onChange
    specialBindObjPickerChange(e) {
        var auxptyId = e.currentTarget.dataset.id
        this.setData({
            allAuxptyList: {
                ...this.data.allAuxptyList,
                [auxptyId]: {
                    ...this.data.allAuxptyList[auxptyId],
                    index: e.detail.value
                }
            },
        })
    },
    onBlur(e) {
        console.log(e, 'blur')
        this.setData({
            submitData: {
                ...this.data.submitData,
                [e.currentTarget.dataset.name]: e.detail.value
            },
        })
    },
    onBusinessFocus() {
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: moment().format('YYYY-MM-DD'),
            success: (res) => {
                if (!!res.date) {
                    this.setData({
                        submitData: {
                            ...this.data.submitData,
                            businessDateTime: res.date
                        },
                    })
                }
                // 解除focus不触发的解决办法。
                this.onClick()
            },
            fail: res => {
                console.log(res, 'failed dateTime')
            }
        })
    },
    onClick() {
        console.log('onClick')
    },
    onAddShow() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY(0).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: false
        })
        this.setData({
            borrowAmount: '',
            remark: ''
        })
    },
    onHesuanShow() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.hesuanAnimation = animation
        animation.translateY(0).step()
        this.setData({
            hesuanAnimationInfo: animation.export(),
            hesuanMaskHidden: false,
        })
    },
    onHesuanHide() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.hesuanAnimation = animation
        animation.translateY(300).step()
        this.setData({
            hesuanAnimationInfo: animation.export(),
            hesuanMaskHidden: true
        })
    },
    onHesuanSubmit(e) {
        // 辅助核算字符串拼接
        var auxptyNameStr = ''
        // 辅助核算提交需要的数组
        var billApEntityListObj = []
        var tempData = this.data.allAuxptyList
        for (var i in tempData) {
            auxptyNameStr += `${tempData[i].auxptyName}_${tempData[i].data[tempData[i].index][this.getAuxptyNameMap(tempData[i].auxptyId)]},`
            billApEntityListObj.push({
                auxptyId: tempData[i].auxptyId,
                auxptyDetailId: tempData[i]["data"][tempData[i].index].id,
            })
        }
        this.setData({
            submitData: {
                ...this.data.submitData,
                auxpropertyNames: auxptyNameStr.slice(0, -1),
                billApEntityListObj
            }
        })
        this.onHesuanHide()
    },
    onAddHide() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: true
        })
    },
    onShow() {
        // 从缓存里获取上传数据
        dd.getStorage({
            key: 'fileList',
            success: res => {
                if (!!res.data) {
                    this.setData({
                        submitData: {
                            ...this.data.submitData,
                            billFilesObj: this.data.submitData.billFilesObj.concat(res.data.fileLists)
                        }
                    })
                }
            }
        })
        // 页面显示
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        this.setData({
            animationInfo: animation.export()
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
    bindKeyInput(e) {
        // 借款详情
        if (e.currentTarget.dataset.type === 'borrowAmount') {
            this.setData({
                borrowAmount: e.detail.value
            })
        }
        // 备注
        if (e.currentTarget.dataset.type === 'remark') {
            this.setData({
                remark: e.detail.value
            })
        }
    },
    // 删除得时候把submitData里面之前存的报销列表数据清空
    clearListSubmitData(submitData, name) {
        Object.keys(submitData).forEach(key => {
            if (key.indexOf(name) != -1) {
                delete submitData[key]
            }
        })
    },
    deleteBorrowDetail(e) {
        var borrowAmount = e.currentTarget.dataset.detail
        var billDetailListObj = this.data.submitData['billDetailListObj'].filter(item => {
            return item.borrowAmount !== borrowAmount
        })
        this.clearListSubmitData(this.data.submitData, 'billDetailList')
        this.setData({
            submitData: {
                ...this.data.submitData,
                billDetailListObj,
                amount: (Number(this.data.submitData.amount) - Number(borrowAmount)).toFixed(2)
            }
        })
    },
    deleteFile(e) {
        var file = e.currentTarget.dataset.file
        var fileList = this.data.submitData.billFilesObj.filter(item => {
            return item.name !== file
        })
        this.clearListSubmitData(this.data.submitData, 'billFiles')
        this.setData({
            submitData: {
                ...this.data.submitData,
                billFilesObj: fileList
            }
        })
    },
    handleAddBorrow() {
        if (this.data.borrowAmount !== '') {
            var obj = {
                borrowAmount: this.data.borrowAmount,
                remark: this.data.remark
            }
            var billDetailListObj = this.data.submitData['billDetailListObj'].concat(obj)
            // 借款合计
            var amount = 0
            billDetailListObj.forEach(item => {
                amount += Number(item.borrowAmount)
            })
            this.setData({
                submitData: {
                    ...this.data.submitData,
                    billDetailListObj,
                    amount: amount.toFixed(2)
                }
            })
            this.onAddHide()
        }
    },
    handleUpload() {
        dd.chooseImage({
            count: 1,
            success: res => {
                console.log(res)
                this.uploadFile(res.filePaths)
            },
            fail: res => {
                console.log('用户取消操作')
            }
        })
    },
    /**
     *
     * @param 上传图片字符串列表
     */
    uploadFile(array) {
        if(array.length) {
            this.addLoading()
            let promiseList = []
            array.forEach(item => {
                promiseList.push(new Promise((resolve, reject) => {
                    dd.uploadFile({
                        url: app.globalData.url + 'aliyunController/uploadImages.do',
                        fileType: 'image',
                        fileName: item,
                        filePath: item,
                        success: res => {
                            console.log(res)
                            resolve()
                        },
                        fail: res => {
                            reject(res)
                        }
                    })
                }))
            })
            Promise.all(promiseList).then(res => {
                // 提交成功的处理逻辑
                this.hideLoading()
                console.log(res)
            }).catch( error => {
                this.hideLoading()
                console.log('catch')
                console.log(error)
            })
        }
    },
    downloadFile(e) {
        var url = e.currentTarget.dataset.url
        console.log(url)
        dd.downloadFile({
            url,
            success({filePath}) {
                console.log(filePath)
                dd.previewImage({
                    urls: [filePath]
                })
            }
        })
    },
    onLoad(query) {
        app.globalData.loadingCount = 0
        // 清除缓存
        dd.removeStorageSync({
            key: 'fileList',
            success: () => {
                this.setData({
                    submitData: {
                        ...this.data.submitData,
                        billFilesObj: []
                    }
                })
            }
        })
        this.setData({
            submitData: {
                ...this.data.submitData,
                userName: app.globalData.realName
            }
        })
        var type = query.type
        this.setData({
            type
        })
        var id = query.id
        this.setData({
            billId: id
        })
        // 获取账簿列表
        if (type === 'add') {
            this.getAccountbookList()
        }
        if (type === 'edit') {
            // 渲染
            this.getEditData(id)
        }
    },
    // 获取申请组织
    getAccountbookList(data) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'accountbookController.do?getAccountbooksJsonByUserId',
            method: 'GET',
            dataType: 'json',
            success: res => {
                var accountbookIndex = 0
                var accountbookId = !!data ? data.accountbookId : res.data[0].id
                // edit的时候设置值
                if (accountbookId) {
                    res.data.forEach((item, index) => {
                        if (item.id === accountbookId) {
                            accountbookIndex = index
                        }
                    })
                }
                this.setData({
                    accountbookList: res.data,
                    accountbookIndex: accountbookIndex,
                    submitData: {
                        ...this.data.submitData,
                        accountbookId
                    }
                })
                var submitterDepartmentId = data ? data.submitterDepartmentId : ''
                var applicantType = data ? data.applicantType : 10
                var applicantId = data ? data.applicantId : ''
                var incomeBankName = data ? data.incomeBankName : ''
                var subjectId = data ? data.subjectId : ''
                var billApEntityListObj = data ? data.billApEntityList : []
                var capitalTypeDetailId = data ? data.capitalTypeDetailId : null
                this.getBorrowBillList(accountbookId, applicantType, applicantId, incomeBankName)
                this.getDepartmentList(accountbookId, submitterDepartmentId, subjectId, billApEntityListObj)
                this.isCapitalTypeStart(accountbookId, capitalTypeDetailId)
                this.hideLoading()
            }
        })
    },
    // 获取申请部门
    getDepartmentList(accountbookId, departmentId, subjectId, billApEntityListObj) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'newDepartController.do?departsJson&accountbookId=' + accountbookId,
            method: 'GET',
            dataType: 'json',
            success: res => {
                var arr = res.data.map(item => {
                    return {
                        id: item.departDetail.id,
                        name: item.departDetail.depart.departName
                    }
                })
                // edit 的时候设置departmentIndex
                var departmentIndex = 0
                var submitterDepartmentId = !!departmentId ? departmentId : arr[0].id
                if (submitterDepartmentId) {
                    arr.forEach((item, index) => {
                        if (item.id === submitterDepartmentId) {
                            departmentIndex = index
                        }
                    })
                }
                this.setData({
                    departmentList: arr,
                    departmentIndex: departmentIndex,
                    submitData: {
                        ...this.data.submitData,
                        submitterDepartmentId
                    }
                })
                this.getSubjectList(accountbookId, submitterDepartmentId, subjectId, billApEntityListObj)
                this.hideLoading()
            }
        })
    },
    // 获取借款单位
    getBorrowBillList(accountbookId, applicantType, applicant, incomeBankName) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'borrowBillController.do?borrowerObjectList&accountbookId=' + accountbookId + '&applicantType=' + applicantType,
            method: 'GET',
            dataType: 'json',
            success: res => {
                var arr = res.data.map(item => {
                    return {
                        id: item.applicantId,
                        name: item.borrowObject
                    }
                })
                // edit的时候，设置borrowIndex
                var borrowIndex = 0
                var applicantId = !!applicant ? applicant : arr[0].id
                if (applicantId) {
                    arr.forEach((item, index) => {
                        if (item.id === applicantId) {
                            borrowIndex = index
                        }
                    })
                }

                this.setData({
                    borrowList: arr,
                    borrowIndex: borrowIndex,
                    submitData: {
                        ...this.data.submitData,
                        applicantId
                    }
                })
                this.getIncomeBankList(applicantType, applicantId, incomeBankName)
                this.hideLoading()
            }
        })
    },
    // 获取收款银行
    getIncomeBankList(applicantType, applicantId, incomeBankName) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'incomeBankInfoController.do?listInfo&applicantType=' + applicantType + '&applicantId=' + applicantId,
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, 'incomeBankList')
                var arr = res.data.obj
                // edit的时候，设置incomeBankIndex
                var incomeBankIndex = 0
                var bankName = ''
                if (arr.length) {
                    bankName = !!incomeBankName ? incomeBankName : arr[0].bankName
                } else {
                    bankName = !!incomeBankName ? incomeBankName : ''
                }
                if (bankName) {
                    arr.forEach((item, index) => {
                        if (item.bankName === bankName) {
                            incomeBankIndex = index
                        }
                    })
                }
                if (!!arr.length) {
                    this.setData({
                        incomeBankList: arr,
                        incomeBankIndex: incomeBankIndex,
                        submitData: {
                            ...this.data.submitData,
                            incomeBankName: bankName
                        }
                    })
                    this.setIncomeBankAccount(arr[0].bankAccount)
                } else {
                    this.setData({
                        incomeBankList: [],
                        incomeBankIndex: 0,
                        submitData: {
                            ...this.data.submitData,
                            incomeBankName: ''
                        }
                    })
                    this.setIncomeBankAccount('')
                }
                this.hideLoading()
            }
        })
    },
    // 获取科目类型
    getSubjectList(accountbookId, departId, subject, billApEntityListObj) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'subjectController.do?combotree&accountbookId=' + accountbookId + '&departId=' + departId + '&billTypeId=4&findAll=false',
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, '借款类型')
                var arr = []
                if (res.data.length) {
                    res.data.forEach(item => {
                        if (!item.childrenCount) {
                            arr.push({
                                id: item.id,
                                name: item.text
                            })
                        }
                    })
                    // edit的时候，设置subjectIndex
                    var subjectIndex = 0
                    var subjectId = subject ? subject : arr[0].id
                    if (subjectId) {
                        arr.forEach((item, index) => {
                            if (item.id === subjectId) {
                                subjectIndex = index
                            }
                        })
                    }
                    this.setData({
                        subjectList: arr,
                        subjectIndex: subjectIndex,
                        submitData: {
                            ...this.data.submitData,
                            subjectId
                        }
                    })
                    this.getSubjectAuxptyList(subjectId, this.data.submitData.accountbookId, false, billApEntityListObj)
                } else {
                    this.setData({
                        subjectList: [],
                        subjectIndex: 0,
                        submitData: {
                            ...this.data.submitData,
                            subjectId: ''
                        }
                    })
                }
                this.hideLoading()
            }
        })
    },
    // 获取科目对应的辅助核算
    getSubjectAuxptyList(subjectId, accountbookId, flag, billApEntityListObj) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'subjectStartDetailController.do?getInfo&subjectId=' + subjectId + '&accountbookId=' + accountbookId,
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, 'auxpryList')
                if (!!res.data.obj.subjectAuxptyList.length) {
                    var arr = res.data.obj.subjectAuxptyList.map(item => {
                        return {
                            auxptyId: item.auxptyId,
                            auxptyName: item.auxpropertyConfig.auxptyName
                        }
                    })
                    this.setData({
                        subjectAuxptyList: arr,
                        allAuxptyList: {},
                        submitData: {
                            ...this.data.submitData,
                        }
                    })
                    if (!billApEntityListObj) {
                        this.setData({
                            submitData: {
                                ...this.data.submitData,
                                auxpropertyNames: ''
                            }
                        })
                    }
                    // 请求辅助核算列表
                    arr.forEach(item => {
                        this.getAuxptyList(this.data.submitData.accountbookId, item.auxptyId, billApEntityListObj)
                    })
                    if (flag) {
                        this.onHesuanShow()
                    }
                } else {
                    this.setData({
                        subjectAuxptyList: []
                    })
                }
                this.hideLoading()
            }
        })
    },
    // 设置收款账号
    setIncomeBankAccount(account) {
        this.setData({
            submitData: {
                ...this.data.submitData,
                incomeBankAccount: account
            }
        })
    },
    // 设置初始值
    setInitSubmitData() {

    },
    checkFocus() {
        this.onHesuanShow()
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
    // 请求辅助核算列表
    getAuxptyList(accountbookId, auxptyid, billApEntityListObj) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + this.getAuxptyUrl(accountbookId, auxptyid),
            method: 'GET',
            dataType: 'json',
            success: res => {
                // 处理index
                var auxptyIndex = 0
                if (!!billApEntityListObj) {
                    console.log(billApEntityListObj)
                    console.log(auxptyid)
                    console.log('=============')
                    billApEntityListObj.forEach((item, index) => {
                        if (item.auxptyId == auxptyid) {
                            res.data.rows.forEach((row, rowIndex) => {
                                if (row.id == item.auxptyDetailId) {
                                    auxptyIndex = rowIndex
                                }
                            })
                        }
                    })
                }
                var obj = {
                    [auxptyid]: {
                        data: res.data.rows,
                        index: auxptyIndex,
                        name: this.getAuxptyNameMap(auxptyid),
                        auxptyName: this.data.subjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                        auxptyId: auxptyid
                    }
                }
                var newObj = Object.assign({}, this.data.allAuxptyList, obj)
                this.setData({
                    allAuxptyList: newObj
                })
                this.hideLoading()
            }
        })
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
    // 资金计划列表
    getCapitalTypeList(capitalTypeDetailId) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'capitalTypeDetailController.do?getList',
            method: 'GET',
            dataType: 'json',
            success: res => {
                var arr = res.data.obj.map(item => {
                    return {
                        detailId: item.id,
                        detailName: item.detailName
                    }
                })
                console.log(arr, '资金计划类型列表')
                var capitalTypeIndex = 0
                if (!!capitalTypeDetailId) {
                    arr.forEach((item, index) => {
                        if (item.detailId === capitalTypeDetailId) {
                            capitalTypeIndex = index
                        }
                    })
                }
                this.setData({
                    capitalTypeList: arr,
                    capitalTypeIndex
                })
                this.hideLoading()
            }
        })
    },
    // 判断资金计划是否启用
    isCapitalTypeStart(accountbookId, capitalTypeDetailId) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + "accountbookController.do?getModuleIdsByAccountbookId&accountbookId=" + accountbookId,
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, '是否启用')
                this.setData({
                    isCapitalTypeStart: res.data
                })
                if (!!res.data) {
                    this.getCapitalTypeList(capitalTypeDetailId)
                } else {
                    this.setData({
                        capitalTypeList: [],
                        capitalTypeIndex: 0
                    })
                }
                this.hideLoading()
            }
        })
    },
    // 请求编辑回显数据
    getEditData(id) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'borrowBillController.do?getDetail&id=' + id,
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res.data.obj)
                if (res.data.obj) {
                    this.setRenderData(res.data.obj)
                }
                this.hideLoading()
            }
        })
    },
    // 回显数据设置
    setRenderData(data) {
        // billDetailList
        if (data.billDetailList.length) {
            var billDetailListObj = data.billDetailList.map(item => {
                return {
                    borrowAmount: item.borrowAmount,
                    remark: item.remark
                }
            })
        }
        // billApEntityList
        if (data.billApEntityList.length) {
            var billApEntityListObj = data.billApEntityList.map(item => {
                return {
                    auxptyId: item.auxptyId,
                    auxptyDetailId: item.auxptyDetailId
                }
            })
        }
        // fileList
        if (data.billFiles.length) {
            var billFilesObj = data.billFiles.map(item => {
                return item
            })
        }
        // 请求
        this.getAccountbookList(data)
        // 设置数据
        this.setData({
            ...this.data,
            submitData: {
                ...this.data.submitData,
                billApEntityListObj,
                billDetailListObj,
                billFilesObj: billFilesObj || [],
                submitDate: moment().format('YYYY-MM-DD'),
                applicantType: data.applicantType,
                invoice: data.invoice,
                auxpropertyNames: data.auxpropertyNames,
                businessDateTime: data.businessDateTime,
                amount: data.amount,
                status: data.status,
                userName: app.globalData.realName,
                accountbookId: data.accountbookId,
                billCode: data.billCode
            }
        })
    }
})
