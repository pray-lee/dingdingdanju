import moment from 'moment'
var app = getApp()
Page({
    data: {
        maskHidden: true,
        hesuanMaskHidden: true,
        animationInfo: {},
        hesuanAnimationInfo: {},
        borrowAmount: '',
        remark: '',
        fileList: [],
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
            billApEntityList: [],
            billDetailList: [],
            submitDate: moment().format('YYYY-MM-DD'),
            applicantType: 10,
            invoice: 0,
            auxpropertyNames: '',
            amount: 0
        }
    },
    formSubmit(e) {
        console.log(this.data)
        dd.httpRequest({
            url: app.globalData.url + 'borrowBillController.do?doAdd',
            method: 'POST',
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(this.submitData),
            success: res => {
                console.log(res)
            },
            fail: res => {
                console.log(res, 'fail')
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
        this.setData({
            [index]: e.detail.value,
            submitData: {
                ...this.data.submitData,
                [name]: this.data[listName][value].id
            }
        })
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
                this.setData({
                    submitData: {
                        ...this.data.submitData,
                        businessTime: res.date
                    },
                })
                // 解除focus不触发的解决办法。
                this.onClick()
            },
        })
    },
    onClick() {
        console.log('onClick')
    },
    onSubmitFocus() {
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: '2012-12-12',
            success: (res) => {
                this.setData({
                    submitData: {
                        ...this.data.submitData,
                        submitDate: res.date
                    }
                })
                // 解除focus不触发的解决办法。
                this.onClick()
            },
        })
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
        console.log(this.data.allAuxptyList)
        // 辅助核算字符串拼接
        var auxptyNameStr = ''
        // 辅助核算提交需要的数组
        var billApEntityList = []
        var tempData = this.data.allAuxptyList
        for (var i in tempData) {
            auxptyNameStr += `${tempData[i].auxptyName}_${tempData[i].data[tempData[i].index][this.getAuxptyNameMap(tempData[i].auxptyId)]},`
            billApEntityList.push({
                auxptyId: tempData[i].auxptyId,
                auxptyDetailId: tempData[i]["data"][tempData[i].index].id,
            })
        }
        this.setData({
            submitData: {
                ...this.data.submitData,
                auxpropertyNames: auxptyNameStr.slice(0, -1),
                billApEntityList
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
    deleteBorrowDetail(e) {
        var borrowAmount = e.currentTarget.dataset.detail
        var billDetailList = this.data.submitData['billDetailList'].filter(item => {
            return item.borrowAmount !== borrowAmount
        })
        this.setData({
            submitData: {
                ...this.data.submitData,
                billDetailList,
                amount: (Number(this.data.submitData.amount) - Number(borrowAmount)).toFixed(2)
            }
        })
    },
    deleteFile(e) {
        var file = e.currentTarget.dataset.file
        var fileList = this.data.fileList.filter(item => {
            return item !== file
        })
        this.setData({
            fileList
        })
    },
    handleAddBorrow() {
        if (this.data.borrowAmount !== '') {
            var obj = {
                borrowAmount: this.data.borrowAmount,
                remark: this.data.remark
            }
            var billDetailList = this.data.submitData['billDetailList'].concat(obj)
            // 借款合计
            var amount = 0
            billDetailList.forEach(item => {
                amount += Number(item.borrowAmount)
            })
            this.setData({
                submitData: {
                    ...this.data.submitData,
                    billDetailList,
                    amount: amount.toFixed(2)
                }
            })
            this.onAddHide()
        }
    },
    handleUpload() {
        // dd.uploadAttachmentToDingTalk({
        //     image:{multiple:true,compress:false,max:9,spaceId: "12345"},
        //     // space:{corpId:"xxx3020",spaceId:"12345",isCopy:1 , max:9},
        //     file:{spaceId:"12345",max:1},
        //     types:["photo","camera","file"],//PC端支持["photo","file","space"]
        //     success: res => {
        //         console.log(res)
        //     },
        //     file: err => {
        //         console.log(err)
        //     }
        // })
    },
    onLoad() {
        // 获取账簿列表
        this.getAccountbookList()
        // 设置初始值
        // setInitSubmitData()
    },
    // 获取申请组织
    getAccountbookList() {
        dd.httpRequest({
            url: app.globalData.url + 'accountbookController.do?getAccountbooksJsonByUserId',
            method: 'GET',
            dataType: 'json',
            success: res => {
                this.setData({
                    accountbookList: res.data,
                    accountbookIndex: 0,
                    submitData: {
                        ...this.data.submitData,
                        accountbookId: res.data[0].id
                    }
                })
            }
        })
    },
    // 获取申请部门
    getDepartmentList(accountbookId) {
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
                this.setData({
                    departmentList: arr,
                    departmentIndex: 0,
                    submitData: {
                        ...this.data.submitData,
                        submitterDepartmentId: arr[0].id
                    }
                })
                this.getSubjectList(accountbookId, arr[0].id)
            }
        })
    },
    // 获取借款单位
    getBorrowBillList(accountbookId, applicantType) {
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
                this.setData({
                    borrowList: arr,
                    borrowIndex: 0,
                    submitData: {
                        ...this.data.submitData,
                        applicantId: arr[0].id
                    }
                })
                this.getIncomeBankList(applicantType, arr[0].id)
            }
        })
    },
    // 获取收款银行
    getIncomeBankList(applicantType, applicantId) {
        dd.httpRequest({
            url: app.globalData.url + 'incomeBankInfoController.do?listInfo&applicantType=' + applicantType + '&applicantId=' + applicantId,
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, 'incomeBankList')
                var arr = res.data.obj
                if (!!arr.length) {
                    this.setData({
                        incomeBankList: arr,
                        incomeBankIndex: 0,
                        submitData: {
                            ...this.data.submitData,
                            incomeBankName: arr[0].bankName
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
            }
        })
    },
    // 获取科目类型
    getSubjectList(accountbookId, departId) {
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
                    this.setData({
                        subjectList: arr,
                        subjectIndex: 0,
                        submitData: {
                            ...this.data.submitData,
                            subjectId: arr[0].id
                        }
                    })
                    this.getSubjectAuxptyList(arr[0].id, this.data.submitData.accountbookId)

                }
            }
        })
    },
    // 获取科目对应的辅助核算
    getSubjectAuxptyList(subjectId, accountbookId, flag) {
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
                            auxpropertyNames: ''
                        }
                    })
                    // 请求辅助核算列表
                    arr.forEach(item => {
                        this.getAuxptyList(this.data.submitData.accountbookId, item.auxptyId)
                    })
                    if (flag) {
                        this.onHesuanShow()
                    }
                }
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
    getAuxptyList(accountbookId, auxptyid) {
        dd.httpRequest({
            url: app.globalData.url + this.getAuxptyUrl(accountbookId, auxptyid),
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, '辅助核算列表')
                var obj = {
                    [auxptyid]: {
                        data: res.data.rows,
                        index: 0,
                        name: this.getAuxptyNameMap(auxptyid),
                        auxptyName: this.data.subjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                        auxptyId: auxptyid
                    }
                }
                var newObj = Object.assign({}, this.data.allAuxptyList, obj)
                this.setData({
                    allAuxptyList: newObj
                })
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
    getCapitalTypeList() {
        dd.httpRequest({
            url: app.globalData.url + 'capitalTypeDetailController.do?getList',
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, '资金计划')
                var arr = res.data.obj.map(item => {
                    return {
                        detailId: item.detailId,
                        detailName: item.detailName
                    }
                })
                this.setData({
                    capitalTypeList: arr
                })
            }
        })
    },
    // 判断资金计划是否启用
    isCapitalTypeStart(accountbookId) {
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
                    this.getCapitalTypeList()
                }else{
                    this.setData({
                        capitalTypeList: [],
                        capitalTypeIndex: 0
                    })
                }
            }
        })
    }
})
