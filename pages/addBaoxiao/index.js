import moment from "moment";
import clone from 'lodash/cloneDeep'

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        type: '',
        billId: '',
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
        importList: [],
        tempImportList: [],
    },
    // 把baoxiaoList的数据，重组一下，拼在submitData里提交
    formatSubmitData(array, name) {
        console.log(array, 'baoxiaoList..........')
        array.forEach((item, index) => {
            Object.keys(item).forEach(keys => {
                if (item[keys] instanceof Array && keys.indexOf('billDetail') !== -1) {
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
                } else {
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
        this.formatSubmitData(this.data.importList, 'borrowBillList')
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log(this.data)
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        this.addLoading()
        var url = ''
        if (this.data.type === 'add') {
            url = app.globalData.url + 'reimbursementBillController.do?doAdd'
        } else {
            url = app.globalData.url + 'reimbursementBillController.do?doUpdate&id=' + this.data.billId
        }
        dd.httpRequest({
            url,
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
        if (value == 2) {
            baoxiaoItem.taxRageArr = this.data.taxRageObject.taxRageArr
            baoxiaoItem.taxRageIndex = 0
            baoxiaoItem.taxRate = this.data.taxRageObject.taxRageArr[0].id
            this.setData({
                baoxiaoList: [...this.data.baoxiaoList]
            })
        } else {
            baoxiaoItem.taxRageArr = []
            baoxiaoItem.taxRageIndex = 0
            baoxiaoItem.taxRate = ''
            this.setData({
                baoxiaoList: [...this.data.baoxiaoList]
            })
        }
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
            this.getSubjectAuxptyList('hesuan', baoxiaoItem.subjectList[value].id, this.data.submitData.accountbookId, true, null, index)
        } else {
            // yusuan预算
            baoxiaoItem.trueSubjectIndex = value
            baoxiaoItem.trueSubjectId = baoxiaoItem.trueSubjectList[value].id
            this.data.baoxiaoList.splice(index, 1, baoxiaoItem)
            this.setData({
                baoxiaoList: [...this.data.baoxiaoList],
                trueHesuanShowIndex: index
            })
            this.getSubjectAuxptyList('yusuan', baoxiaoItem.trueSubjectList[value].id, this.data.submitData.accountbookId, true, null, index)
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
            // 重新获取科目以后，就要置空报销列表
            this.setData({
                baoxiaoList: []
            })
            this.getDepartmentList(this.data[listName][value].id)
            this.getBorrowBillList(this.data[listName][value].id, 10)
        }
        if (name === 'submitterDepartmentId') {
            // 重新获取科目以后，就要置空报销列表
            this.setData({
                baoxiaoList: []
            })
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
        var applicationAmount = 0
        tempData.forEach(item => {
            applicationAmount += Number(item.applicationAmount)
        })
        this.setData({
            baoxiaoList: tempData,
            submitData: {
                ...this.data.submitData,
                applicationAmount
            }
        })
        this.setTotalAmount()
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
    // 删除得时候把submitData里面之前存的报销列表数据清空
    clearListSubmitData(submitData) {
        Object.keys(submitData).forEach(key => {
            if (key.indexOf('billDetailList') != -1) {
                delete submitData[key]
            }
        })
    },
    deleteBaoxiaoDetail(e) {
        var idx = e.currentTarget.dataset.index
        var baoxiaoList = this.data.baoxiaoList.filter((item, index) => {
            return idx !== index
        })
        console.log(baoxiaoList)
        this.clearListSubmitData(this.data.submitData)
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
        this.setData({
            type
        })
        var id = query.id
        console.log(id)
        this.setData({
            billId: id
        })
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
                console.log(data)
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
                var billDetailList = data ? data.billDetailList : []
                this.getBorrowBillList(accountbookId, applicantType, applicantId, incomeBankName)
                this.getDepartmentList(accountbookId, submitterDepartmentId, billDetailList)
                this.hideLoading()
            }
        })
    },
    // 获取申请部门
    getDepartmentList(accountbookId, departmentId, billDetailList) {
        console.log('getDetap', billDetailList)
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
                this.getSubjectList(accountbookId, submitterDepartmentId, billDetailList)
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
    onAddBaoxiao() {
        console.log(this.data.subjectObject, '.........')
        if (this.data.subjectObject.subjectList.length) {
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
        }
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
        var importList = data.borrowBillList.map(item => {
            return {
                billDetailId: item.billDetailId,
                applicationAmount: item.applicationAmount
            }
        })
        // 设置数据
        this.setData({
            ...this.data,
            importList,
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
    getSubjectList(accountbookId, departId, billDetailList) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'subjectController.do?combotree&accountbookId=' + accountbookId + '&departId=' + departId + '&billTypeId=9&findAll=false',
            method: 'GET',
            dataType: 'json',
            success: res => {
                var arr = []
                if (res.data.length) {
                    res.data.forEach(item => {
                        if (!item.childrenCount) {
                            arr.push({
                                id: item.id,
                                name: item.text,
                                subjectExtraId: item.subjectExtraId
                            })
                        }
                    })
                    // edit的时候，设置subjectIndex
                    if (!!billDetailList && !!billDetailList.length) {
                        var tempData = []
                        billDetailList.forEach((item, index) => {
                            var subjectIndex = 0
                            var trueSubjectIndex = 0
                            var subjectId = item.subjectId
                            var trueSubjectId = item.trueSubjectId
                            arr.forEach((arrItem, arrIndex) => {
                                if (arrItem.id === subjectId) {
                                    subjectIndex = arrIndex
                                }
                                if (arrItem.id === trueSubjectId) {
                                    trueSubjectIndex = arrIndex
                                }
                            })
                            // 重组数据， 钉钉我草你妈！！！
                            var obj = {}
                            obj.subjectId = item.subjectId
                            obj.subjectIndex = subjectIndex
                            obj.subjectList = arr
                            obj.subjectAuxptyList = []
                            obj.allAuxptyList = {}
                            obj.auxpropertyNames = item.auxpropertyNames
                            obj.trueSubjectId = item.trueSubjectId
                            obj.trueSubjectIndex = trueSubjectIndex
                            obj.trueSubjectList = arr
                            obj.trueSubjectAuxptyList = []
                            obj.trueAllAuxptyList = {}
                            obj.trueAuxpropertyNames = item.trueAuxpropertyNames
                            obj.applicationAmount = item.applicationAmount
                            var auxptyObj = []
                            item.billDetailApEntityList.forEach(auxptyItem => {
                                auxptyObj.push({
                                    auxptyId: auxptyItem.auxptyId,
                                    auxptyDetailId: auxptyItem.auxptyDetailId
                                })
                            })
                            obj.billDetailApEntityListObj = auxptyObj
                            var trueAuxptyObj = []
                            item.billDetailTrueApEntityList.forEach(auxptyItem => {
                                trueAuxptyObj.push({
                                    auxptyId: auxptyItem.auxptyId,
                                    auxptyDetailId: auxptyItem.auxptyDetailId
                                })
                            })
                            obj.billDetailTrueApEntityListObj = trueAuxptyObj
                            obj.remark = item.remark
                            if (item.invoiceType == 2) {
                                obj.taxRageArr = this.data.taxRageObject.taxRageArr
                                obj.taxRate = item.taxRate
                                this.data.taxRageObject.taxRageArr.forEach((taxItem, index) => {
                                    if (taxItem.id == item.taxRate) {
                                        obj.taxRageIndex = index
                                    }
                                })
                            }
                            obj.id = item.id
                            obj.invoiceType = item.invoiceType
                            this.setData({
                                baoxiaoList: [...this.data.baoxiaoList, obj],
                            })
                            this.getSubjectAuxptyList('hesuan', subjectId, this.data.submitData.accountbookId, false, auxptyObj, index)
                            this.getSubjectAuxptyList('yusuan', trueSubjectId, this.data.submitData.accountbookId, false, trueAuxptyObj, index)
                        })
                    } else {
                        this.getSubjectAuxptyList('hesuan', arr[0].id, this.data.submitData.accountbookId, false, null, 0)
                    }
                    this.setData({
                        subjectObject: {
                            subjectList: arr,
                            subjectIndex: 0,
                            allAuxptyList: {},
                            subjectAuxptyList: []
                        }
                    })
                } else {
                    this.setData({
                        subjectObject: {
                            subjectList: [],
                            subjectIndex: 0,
                            allAuxptyList: {},
                            subjectAuxptyList: []
                        }
                    })
                }

                this.hideLoading()
            }
        })
    },
    // 获取科目对应的辅助核算 (每一个都是单独调用)
    getSubjectAuxptyList(type, subjectId, accountbookId, flag, auxptyObj, index) {
        var idx = index
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
                    var tempData = clone(this.data.baoxiaoList)
                    if (tempData.length) {
                        if (type === 'hesuan') {
                            tempData[idx].subjectAuxptyList = arr
                            tempData[idx].allAuxptyList = {}
                        } else {
                            tempData[idx].trueSubjectAuxptyList = arr
                            tempData[idx].trueAllAuxptyList = {}
                        }
                    }
                    this.setData({
                        baoxiaoList: tempData
                    })
                    this.setData({
                        subjectObject: {
                            ...this.data.subjectObject,
                            subjectAuxptyList: arr,
                            allAuxptyList: {}
                        }
                    })
                    // 请求辅助核算列表
                    arr.forEach(item => {
                        this.getAuxptyList(type, this.data.submitData.accountbookId, item.auxptyId, auxptyObj, idx)
                    })
                    if (flag) {
                        this.onHesuanShow(type)
                    }
                } else {
                    var tempData = this.data.baoxiaoList
                    if (tempData.length) {
                        if (type === 'hesuan') {
                            tempData[idx].subjectAuxptyList = []
                            tempData[idx].allAuxptyList = {}
                            tempData[idx].auxpropertyNames = ''
                        } else {
                            tempData[idx].trueSubjectAuxptyList = []
                            tempData[idx].trueAllAuxptyList = {}
                            tempData[idx].trueAuxpropertyNames = ''
                        }
                    }
                    this.setData({
                        baoxiaoList: tempData
                    })
                    this.setData({
                        subjectObject: {
                            ...this.data.subjectObject,
                            subjectAuxptyList: [],
                            allAuxptyList: []
                        }
                    })
                }
                this.hideLoading()
            }
        })
    },
    // 请求辅助核算列表
    getAuxptyList(type, accountbookId, auxptyid, auxptyObj, idx) {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + this.getAuxptyUrl(accountbookId, auxptyid),
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res.data.rows)
                console.log(auxptyid)
                console.log(auxptyObj)
                console.log(idx)
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
                if (this.data.baoxiaoList.length > 0) {
                    if (type === 'hesuan') {
                        var obj = {
                            [auxptyid]: {
                                data: res.data.rows,
                                index: auxptyIndex,
                                name: this.getAuxptyNameMap(auxptyid),
                                auxptyName: this.data.baoxiaoList[idx].subjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                                auxptyId: auxptyid
                            }
                        }
                        var tempData = clone(this.data.baoxiaoList)
                        var newObj = Object.assign({}, this.data.baoxiaoList[idx].allAuxptyList, obj)
                        tempData[idx].allAuxptyList = newObj
                    } else {
                        var trueObj = {
                            [auxptyid]: {
                                data: res.data.rows,
                                index: auxptyIndex,
                                name: this.getAuxptyNameMap(auxptyid),
                                auxptyName: this.data.baoxiaoList[idx].trueSubjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                                auxptyId: auxptyid
                            }
                        }
                        var trueNewObj = Object.assign({}, this.data.baoxiaoList[idx].trueAllAuxptyList, trueObj)
                        var tempData = clone(this.data.baoxiaoList)
                        tempData[idx].trueAllAuxptyList = trueNewObj
                    }
                    this.setData({
                        baoxiaoList: tempData
                    })
                }
                if (this.data.subjectObject.subjectAuxptyList.length) {
                    var obj = {
                        [auxptyid]: {
                            data: res.data.rows,
                            index: auxptyIndex,
                            name: this.getAuxptyNameMap(auxptyid),
                            auxptyName: this.data.subjectObject.subjectAuxptyList.filter(item => auxptyid == item.auxptyId)[0].auxptyName,
                            auxptyId: auxptyid
                        }
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
        })
    },
    getImportBorrowList() {
        this.setData({
            tempImportList: []
        })
        dd.httpRequest({
            url: app.globalData.url + 'borrowBillController.do?dataGridManager&accountbookId=' + this.data.submitData.accountbookId + '&applicantType=' + this.data.submitData.applicantType + '&applicantId=' + this.data.submitData.applicantId + '&invoice=0&query=import&field=id,billCode,accountbookId,departDetail.id,departDetail.depart.departName,subjectId,subject.fullSubjectName,auxpropertyNames,submitter.id,submitter.realName,invoice,contractNumber,amount,unverifyAmount,remark,businessDateTime,submitDate,',
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res, '借款单列表...')
                this.setData({
                    tempImportList: res.data.rows
                })
            }
        })
    },
    borrowInput(e) {
        var value = e.detail.value
        var index = e.currentTarget.dataset.index
        var tempData = clone(this.data.importList)
        tempData[index].applicationAmount = value
        this.setData({
            importList: tempData
        })
        this.setBorrowAmount(tempData)
        this.setTotalAmount()
    },
    setBorrowAmount(array) {
        if (array.length) {
            var borrowTotalAmount = 0
            array.forEach(item => {
                borrowTotalAmount += Number(item.applicationAmount)
            })
            this.setData({
                submitData: {
                    ...this.data.submitData,
                    verificationAmount: borrowTotalAmount
                }
            })
        } else {
            this.setData({
                submitData: {
                    ...this.data.submitData,
                    verificationAmount: 0
                }
            })
        }
    },
    setTotalAmount() {
        // 申请报销金额
        var applicationAmount = this.data.submitData.applicationAmount || 0
        // 核销金额
        var verificationAmount = this.data.submitData.verificationAmount || 0
        // 应付款金额
        var totalAmount = Number(applicationAmount) - Number(verificationAmount)
        this.setData({
            submitData: {
                ...this.data.submitData,
                totalAmount
            }
        })
    },

    deleteBorrowDetail(e) {
        var id = e.currentTarget.dataset.id
        var tempArr = this.data.importList.filter(item => item.billDetailId !== id)
        this.setBorrowAmount(tempArr)
        this.setData({
            importList: tempArr
        })
    },
    onCheckboxChange(e) {
        console.log(this.data.importList)
        console.log(e)
    },
    onCheckboxSubmit(e) {
        var arr = e.detail.value
        console.log(arr)
        var newArr = []
        for (var i in arr) {
            if (arr[i].length) {
                var temp = {
                    billDetailId: arr[i][0].id,
                    applicationAmount: arr[i][0].unverifyAmount,
                }
                newArr.push(temp)
            }
        }
        this.setData({
            importList: newArr,
        })
        this.setBorrowAmount(newArr)
        this.onAddHide()
    },
    openExtraInfo() {
        console.log('openExtraInfo')
    },
})
