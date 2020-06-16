import moment from "moment";
import clone from 'lodash/cloneDeep'

var app = getApp()
app.globalData.loadingCount = 0
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
        // 税率
        taxRageObject: {
            taxRageArr: [],
            taxRageIndex: 0,
        },
        // 发票类型
        invoiceTypeArr: [],
        incomeBankIndex: 0,
        incomeBankList: [],
        applicantIndex: 0,
        applicantTypeList: [
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
        // 每新增一个报销列表，就从这个数据结构拷贝一份
        subjectObject: {
            subjectIndex: 0,
            subjectList: [],
            allAuxptyList: {},
            subjectAuxptyList: []
        },
        hesuanShowIndex: 0,
        trueHesuanShowIndex: 0,
        submitData: {
            submitDate: moment().format('YYYY-MM-DD'),
            applicantType: 10,
            applicantId: '',
            invoice: 0,
            businessDateTime: moment().format('YYYY-MM-DD'),
            applicationAmount: 0,
            totalAmount: 0,
            verificationAmount: 0,
            status: 20,
            userName: '',
            billCode: '',
            auxpropertyNames: ''
        },
        baoxiaoList: [],
        importBorrowList: [],
    },
    // 把baoxiaoList的数据，重组一下，拼在submitData里提交
    formatSubmitData(array, name) {
        console.log(array)
        array.forEach((item, index) => {
            Object.keys(item).forEach(keys => {
                if(item[keys] instanceof Array && keys.indexOf('billDetail') !== -1) {
                    item[keys].forEach((arrItem, arrIndex) => {
                        Object.keys(arrItem).forEach(arrKeys => {
                            this.setData({
                                submitData: {
                                    ...this.data.submitData,
                                    [`${name}[${index}].${keys.slice(0, -3)}[${arrIndex}].${arrKeys}`]: arrItem[arrKeys]
                                }
                            })
                        })
                    })
                }else{
                    this.setData({
                        submitData: {
                            ...this.data.submitData,
                            [`${name}[${index}].${keys}`]: item[keys]
                        }
                    })
                }
            })
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
        if (app.globalData.loadingCount === 0) {
            dd.hideLoading()
        }
    },
    formSubmit(e) {
        // 处理一下提交格式
        this.formatSubmitData(this.data.baoxiaoList, 'billDetailList')
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log(this.data)
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'reimbursementBillController.do?doAdd',
            method: 'POST',
            dataType: 'json',
            data: this.data.submitData,
            success: res => {
                console.log(res, 'submitData...')
                this.hideLoading()
            },
            fail: res => {
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
    baoxiaoRadioChange(e) {
        var index = e.currentTarget.dataset.index
        var baoxiaoItem = this.data.baoxiaoList[index]
        var value = e.detail.value
        baoxiaoItem.invoiceType = value
        this.data.baoxiaoList.splice(index, 1, baoxiaoItem)
        this.setData({
            baoxiaoList: [...this.data.baoxiaoList]
        })
    },
    // 税率点击
    bindTaxRagePickerChange(e) {
        var index = e.currentTarget.dataset.index
        var baoxiaoItem = this.data.baoxiaoList[index]
        var value = e.detail.value
        baoxiaoItem.taxRageIndex = value
        baoxiaoItem.taxRate = baoxiaoItem.taxRageArr[value].id
        this.data.baoxiaoList.splice(index, 1, baoxiaoItem)
        this.setData({
            baoxiaoList: [...this.data.baoxiaoList]
        })
    },
    // 报销列表的onTap
    bindBaoxiaoObjPickerChange(e) {
        var name = e.currentTarget.dataset.name
        var index = e.currentTarget.dataset.index
        var value = e.detail.value
        var baoxiaoItem = this.data.baoxiaoList[index]
        if (name === 'subjectId') {
            baoxiaoItem.subjectIndex = value
            baoxiaoItem.subjectId = baoxiaoItem.subjectList[value].id
            this.data.baoxiaoList.splice(index, 1, baoxiaoItem)
            this.setData({
                baoxiaoList: [...this.data.baoxiaoList],
                hesuanShowIndex: index,
                trueHesuanShowIndex: index
            })
            this.getSubjectAuxptyList('hesuan', baoxiaoItem.subjectList[value].id, this.data.submitData.accountbookId, true)

        } else {
            // yusuan预算
            baoxiaoItem.trueSubjectIndex = value
            baoxiaoItem.trueSubjectId = baoxiaoItem.trueSubjectList[value].id
            this.data.baoxiaoList.splice(index, 1, baoxiaoItem)
            this.setData({
                baoxiaoList: [...this.data.baoxiaoList],
                trueHesuanShowIndex: index
            })
            this.getSubjectAuxptyList('yusuan', baoxiaoItem.trueSubjectList[value].id, this.data.submitData.accountbookId, true)
        }
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
        }
        if (name === 'submitterDepartmentId') {
            this.getSubjectList(this.data.submitData.accountbookId, this.data[listName][value].id)
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
        var tempData = clone(this.data.baoxiaoList)
        if (this.data.hesuanType === 'hesuan') {
            tempData[this.data.hesuanShowIndex].allAuxptyList = {
                ...tempData[this.data.hesuanShowIndex].allAuxptyList,
                [auxptyId]: {
                    ...tempData[this.data.hesuanShowIndex].allAuxptyList[auxptyId],
                    index: e.detail.value
                }
            }
        } else {
            tempData[this.data.trueHesuanShowIndex].trueAllAuxptyList = {
                ...tempData[this.data.trueHesuanShowIndex].trueAllAuxptyList,
                [auxptyId]: {
                    ...tempData[this.data.trueHesuanShowIndex].trueAllAuxptyList[auxptyId],
                    index: e.detail.value
                }
            }
        }
        this.setData({
            baoxiaoList: tempData
        })
    },
    onBlur(e) {
        console.log(e, 'blur')
        this.setData({
            submitData: {
                ...this.data.submitData,
                [e.currentTarget.dataset.name]: e.detail.value
            }
        })
    },
    onBaoxiaoBlur(e) {
        var tempData = clone(this.data.baoxiaoList)
        var name = e.currentTarget.dataset.name
        var index = e.currentTarget.dataset.index
        tempData[index][name] = e.detail.value
        this.setData({
            baoxiaoList: tempData
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
                        businessDateTime: res.date
                    }
                })
                // 解除focus不触发的解决办法。
                this.onClick()
            },
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
        // 弹框数据清空
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
        animation.translateY(300).step()
        this.setData({
            hesuanAnimationInfo: animation.export(),
            hesuanMaskHidden: true
        })
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
                borrowDetail: e.detail.value
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
        // var borrowAmount = e.currentTarget.dataset.detail
        // var billDetailListObj = this.data.submitData['billDetailListObj'].filter(item => {
        //     return item.borrowAmount !== borrowAmount
        // })
        // this.setData({
        //     submitData: {
        //         ...this.data.submitData,
        //         billDetailListObj,
        //         amount: (Number(this.data.submitData.amount) - Number(borrowAmount)).toFixed(2)
        //     }
        // })
        var id = e.currentTarget.dataset.id
        var tempArr = this.data.importList.filter(item => item.id !== id)
        this.setData({
            importList: tempArr
        })
    },
    deleteBaoxiaoDetail(e) {
        var idx = e.currentTarget.dataset.index
        var baoxiaoList = this.data.baoxiaoList.filter((item, index) => {
            return idx !== index
        })
        this.setData({
            baoxiaoList
        })
    },
    deleteFile(e) {
        var file = e.currentTarget.dataset.file
        var fileList = this.data.fileList.filter(item => item !== file)
        this.setData({
            fileList
        })
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
    onLoad(query) {
        this.getTaxRageArr()
        this.getInvoiceTypeArr()
        this.setData({
            submitData: {
                ...this.data.submitData,
                userName: app.globalData.realName
            }
        })
        var type = query.type
        var id = query.id
        // 获取账簿列表
        if (type === 'add') {
            this.getAccountbookList()
        }
        if (type === 'edit') {
            //渲染
            this.getEditData(id)
        }
    },
    // 获取税率
    getTaxRageArr() {
        dd.httpRequest({
            url: app.globalData.url + 'systemController.do?formTree&typegroupCode=VATRateForMost',
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, '税率')
                this.setData({
                    taxRageObject: {
                        taxRageArr: res.data[0].children,
                        taxRageIndex: 0
                    }
                })
            }
        })
    },
    getInvoiceTypeArr() {
        dd.httpRequest({
            url: app.globalData.url + 'systemController.do?formTree&typegroupCode=invoiceType',
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, '发票类型')
                this.setData({
                    invoiceTypeArr: res.data[0].children
                })
            }
        })
    },
    // 获取申请组织
    getAccountbookList(data) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'accountbookController.do?getAccountbooksJsonByUserId',
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res.data, 'accountbookList')
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
                var subjectId = data ? data.subjectId : ''
                var incomeBankName = data ? data.incomeBankName : ''
                this.getBorrowBillList(accountbookId, applicantType, applicantId, incomeBankName)
                this.getDepartmentList(accountbookId, submitterDepartmentId, subjectId)
                this.hideLoading()
            }
        })
    },
    // 获取申请部门
    getDepartmentList(accountbookId, departmentId, subjectId) {
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
                    },
                })
                this.getSubjectList(accountbookId, submitterDepartmentId, subjectId)
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
                if (arr.length) {

                }
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
    // 设置收款账号
    setIncomeBankAccount(account) {
        this.setData({
            submitData: {
                ...this.data.submitData,
                incomeBankAccount: account
            }
        })
    },
    onCheckboxChange(e) {
        console.log(e)
    },
    onCheckboxSubmit(e) {
        var arr = e.detail.value
        console.log(arr)
        var newArr = []
        for (var i in arr) {
            if (arr[i] != '') {
                var temp = {
                    id: i,
                    unverifyAmount: arr[i]
                }
                newArr.push(temp)
            }
        }
        this.setData({
            importList: newArr,
            importBorrowList: []
        })
        this.onAddHide()
    },
    onAddBaoxiao() {
        var newSubjectObj = clone(this.data.subjectObject)
        var newTaxRageObj = clone(this.data.taxRageObject)
        var obj = {
            subjectId: this.data.subjectObject.subjectList[0].id,
            trueSubjectId: this.data.subjectObject.subjectList[0].id,
            applicationAmount: '',
            invoiceType: this.data.invoiceTypeArr[1].id,
            taxRageArr: clone(newTaxRageObj).taxRageArr,
            taxRageIndex: clone(newTaxRageObj).taxRageIndex,
            taxRate: this.data.taxRageObject.taxRageArr[0].id,
            remark: '',
            allAuxptyList: clone(newSubjectObj).allAuxptyList,
            trueAllAuxptyList: clone(newSubjectObj).allAuxptyList,
            subjectList: clone(newSubjectObj).subjectList,
            trueSubjectList: clone(newSubjectObj).subjectList,
            // 科目index
            subjectIndex: clone(newSubjectObj).subjectIndex,
            trueSubjectIndex: clone(newSubjectObj).subjectIndex,
            trueSubjectAuxptyList: clone(newSubjectObj).subjectAuxptyList,
            subjectAuxptyList: clone(newSubjectObj).subjectAuxptyList
        }
        console.log(this.data.baoxiaoList)
        this.setData({
            baoxiaoList: this.data.baoxiaoList.concat(obj),
        })
    },
    checkFocus(e) {
        var name = e.currentTarget.dataset.name
        if (name === 'auxpropertyNames') {
            this.setData({
                hesuanShowIndex: e.currentTarget.dataset.index
            })
        } else {
            this.setData({
                trueHesuanShowIndex: e.currentTarget.dataset.index
            })
        }
        var type = name === 'auxpropertyNames' ? 'hesuan' : 'yusuan'
        this.onHesuanShow(type)
    },
    onHesuanSubmit(e) {
        // 辅助核算字符串拼接
        var tempData = this.data.baoxiaoList
        if (this.data.hesuanType === 'hesuan') {
            var billDetailApEntityListObj = []
            var auxptyNameStr = ''
            var tempAllAuxptyList = tempData[this.data.hesuanShowIndex].allAuxptyList
            for (var i in tempAllAuxptyList) {
                auxptyNameStr += `${tempAllAuxptyList[i].auxptyName}_${tempAllAuxptyList[i].data[tempAllAuxptyList[i].index][this.getAuxptyNameMap(tempAllAuxptyList[i].auxptyId)]},`
                billDetailApEntityListObj.push({
                    auxptyId: tempAllAuxptyList[i].auxptyId,
                    auxptyDetailId: tempAllAuxptyList[i]["data"][tempAllAuxptyList[i].index].id
                })
            }
            tempData[this.data.hesuanShowIndex].auxpropertyNames = auxptyNameStr.slice(0, -1)
            tempData[this.data.hesuanShowIndex].billDetailApEntityListObj = billDetailApEntityListObj
        } else {
            var billDetailTrueApEntityListObj = []
            var trueAuxptyNameStr = ''
            var trueTempAllAuxptyList = tempData[this.data.trueHesuanShowIndex].trueAllAuxptyList
            for (var i in trueTempAllAuxptyList) {
                trueAuxptyNameStr += `${trueTempAllAuxptyList[i].auxptyName}_${trueTempAllAuxptyList[i].data[trueTempAllAuxptyList[i].index][this.getAuxptyNameMap(trueTempAllAuxptyList[i].auxptyId)]},`
                billDetailTrueApEntityListObj.push({
                    auxptyId: trueTempAllAuxptyList[i].auxptyId,
                    auxptyDetailId: trueTempAllAuxptyList[i]["data"][trueTempAllAuxptyList[i].index].id
                })
            }
            tempData[this.data.trueHesuanShowIndex].trueAuxpropertyNames = trueAuxptyNameStr.slice(0, -1)
            tempData[this.data.trueHesuanShowIndex].billDetailTrueApEntityListObj = billDetailTrueApEntityListObj
        }
        this.setData({
            baoxiaoList: tempData
        })
        this.onHesuanHide()
    },
    // 请求编辑回显数据
    getEditData(id) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'reimbursementBillController.do?getDetail&id=' + id,
            method: 'GET',
            dataType: 'json',
            success: res => {
                if (res.data.obj) {
                    this.setRenderData(res.data.obj)
                }
                this.hideLoading()
            }
        })
    },
    // 回显数据设置
    setRenderData(data) {
        // 请求
        this.getAccountbookList(data)
        // 设置数据
        this.setData({
            ...this.data,
            baoxiaoList: data.billDetailList,
            submitData: {
                ...this.data.submitData,
                submitDate: moment().format('YYYY-MM-DD'),
                applicantType: data.applicantType,
                invoice: data.invoice,
                businessDateTime: data.businessDateTime,
                applicationAmount: data.applicationAmount,
                verificationAmount: data.verificationAmount,
                totalAmount: data.totalAmount,
                status: data.status,
                userName: app.globalData.realName,
                accountbookId: data.accountbookId,
                billCode: data.billCode,
            },
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
    // 获取科目类型
    getSubjectList(accountbookId, departId, subject) {
        // 重新获取科目以后，就要置空报销列表
        // this.setData({
        //     baoxiaoList: []
        // })
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'subjectController.do?combotree&accountbookId=' + accountbookId + '&departId=' + departId + '&billTypeId=9&findAll=false',
            method: 'GET',
            dataType: 'json',
            success: res => {
                var arr = []
                res.data.forEach(item => {
                    if (!item.childrenCount) {
                        arr.push({
                            id: item.id,
                            name: item.text
                        })
                    }
                })
                var subjectId = subject ? subject : arr[0].id
                this.setData({
                    subjectObject: {
                        subjectList: arr,
                        subjectIndex: 0,
                        allAuxptyList: {},
                        subjectAuxptyList: []
                    }
                })
                this.getSubjectAuxptyList('hesuan', subjectId, this.data.submitData.accountbookId, false)
                this.hideLoading()
            }
        })
    },
    // 获取科目对应的辅助核算 (每一个都是单独调用)
    getSubjectAuxptyList(type, subjectId, accountbookId, flag) {
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
                    if (this.data.baoxiaoList.length) {
                        var tempData = clone(this.data.baoxiaoList)
                        if (type === 'hesuan') {
                            tempData[this.data.hesuanShowIndex].subjectAuxptyList = arr
                            tempData[this.data.hesuanShowIndex].allAuxptyList = []
                            tempData[this.data.hesuanShowIndex].auxpropertyNames = ''
                        } else {
                            tempData[this.data.trueHesuanShowIndex].trueSubjectAuxptyList = arr
                            tempData[this.data.trueHesuanShowIndex].trueAllAuxptyList = []
                            tempData[this.data.trueHesuanShowIndex].trueAuxpropertyNames = ''
                        }
                        console.log(tempData, 'tempData.............')
                        this.setData({
                            baoxiaoList: tempData,
                        })
                    } else {
                        this.setData({
                            subjectObject: {
                                ...this.data.subjectObject,
                                subjectAuxptyList: arr,
                            }
                        })
                    }
                    // 请求辅助核算列表
                    arr.forEach(item => {
                        this.getAuxptyList(type, this.data.submitData.accountbookId, item.auxptyId)
                    })
                    if (flag) {
                        this.onHesuanShow(type)
                    }
                } else {
                    if (this.data.baoxiaoList.length) {
                        var tempData = clone(this.data.baoxiaoList)
                        if (type === 'hesuan') {
                            tempData[this.data.hesuanShowIndex].subjectAuxptyList = []
                            tempData[this.data.hesuanShowIndex].allAuxptyList = {}
                            // tempData[this.data.hesuanShowIndex].auxpropertyNames = ''
                        } else {
                            tempData[this.data.trueHesuanShowIndex].trueSubjectAuxptyList = []
                            tempData[this.data.trueHesuanShowIndex].trueAllAuxptyList = {}
                            // tempData[this.data.trueHesuanShowIndex].trueAuxpropertyNames = ''
                        }
                        this.setData({
                            baoxiaoList: tempData
                        })
                    }
                }
                this.hideLoading()
            }
        })
    },
    // 请求辅助核算列表
    getAuxptyList(type, accountbookId, auxptyid) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + this.getAuxptyUrl(accountbookId, auxptyid),
            method: 'GET',
            dataType: 'json',
            success: res => {
                // 处理index
                var auxptyIndex = 0
                if (this.data.baoxiaoList.length > 0) {
                    if (type === 'hesuan') {
                        var obj = {
                            [auxptyid]: {
                                data: res.data.rows,
                                index: auxptyIndex,
                                name: this.getAuxptyNameMap(auxptyid),
                                auxptyName: this.data.baoxiaoList[this.data.hesuanShowIndex].subjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                                auxptyId: auxptyid
                            }
                        }
                        var tempData = clone(this.data.baoxiaoList)
                        var newObj = Object.assign({}, this.data.baoxiaoList[this.data.hesuanShowIndex].allAuxptyList, obj)
                        tempData[this.data.hesuanShowIndex].allAuxptyList = newObj
                    } else {
                        var trueObj = {
                            [auxptyid]: {
                                data: res.data.rows,
                                index: auxptyIndex,
                                name: this.getAuxptyNameMap(auxptyid),
                                auxptyName: this.data.baoxiaoList[this.data.trueHesuanShowIndex].trueSubjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                                auxptyId: auxptyid
                            }
                        }
                        var trueNewObj = Object.assign({}, this.data.baoxiaoList[this.data.trueHesuanShowIndex].trueAllAuxptyList, trueObj)
                        var tempData = clone(this.data.baoxiaoList)
                        tempData[this.data.trueHesuanShowIndex].trueAllAuxptyList = trueNewObj
                    }
                    this.setData({
                        baoxiaoList: tempData
                    })
                    this.hideLoading()
                } else {
                    var obj = {
                        [auxptyid]: {
                            data: res.data.rows,
                            index: auxptyIndex,
                            name: this.getAuxptyNameMap(auxptyid),
                            auxptyName: this.data.subjectObject.subjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                            auxptyId: auxptyid
                        }
                    }
                    var newObj = Object.assign({}, this.data.subjectObject.allAuxptyList, obj)
                    this.setData({
                        subjectObject: {
                            ...this.data.subjectObject,
                            allAuxptyList: newObj
                        }
                    })
                    this.hideLoading()
                }
            }
        })
    },
    getImportBorrowList() {
        dd.httpRequest({
            url: app.globalData.url + 'borrowBillController.do?dataGridManager&accountbookId=' + this.data.submitData.accountbookId + '&applicantType=' + this.data.submitData.applicantType + '&applicantId=' + this.data.submitData.applicantId + '&invoice=0&query=import&field=id,billCode,accountbookId,departDetail.id,departDetail.depart.departName,subjectId,subject.fullSubjectName,auxpropertyNames,submitter.id,submitter.realName,invoice,contractNumber,amount,unverifyAmount,remark,businessDateTime,submitDate,',
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, '借款单列表...')
                this.setData({
                    importBorrowList: res.data.rows
                })
            }
        })
    }
})
