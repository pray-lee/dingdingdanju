import moment from 'moment';
import clone from "lodash/cloneDeep";
import {getErrorMessage, submitSuccess} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        type: '',
        billId: '',
        maskHidden: true,
        disabled: true,
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
        // 资金计划列表
        capitalTypeIndex: 0,
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
        // 选择的辅助核算
        selectedAuxpty: null,
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
        if (!!array && array.length) {
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
        app.globalData.loadingCount += 1
    },
    hideLoading() {
        if (app.globalData.loadingCount <= 1) {
            dd.hideLoading()
            app.globalData.loadingCount = 0
        } else {
            app.globalData.loadingCount -= 1
        }
    },
    formSubmit(e) {
        const status = e.currentTarget.dataset.status
        this.setData({
            submitData: {
                ...this.data.submitData,
                status
            }
        })
        // 删除辅助核算的信息，然后通过formatSubmitData重新赋值
        console.log(this.data.submitData)
        Object.keys(this.data.submitData).forEach(item => {
            console.log(item)
            if(item.indexOf('billApEntityList[') != -1) {
                delete this.data.submitData[item]
            }
        })
        // 处理一下提交格式
        this.formatSubmitData(this.data.submitData.billDetailListObj, 'billDetailList')
        this.formatSubmitData(this.data.submitData.billApEntityListObj, 'billApEntityList')
        this.formatSubmitData(this.data.submitData.billFilesObj, 'billFiles')
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
            },
            fail: res => {
                if (res.data && typeof res.data == 'string') {
                    getErrorMessage(res.data)
                }
                console.log(res, 'fail')
            },
            complete: (res) => {
                console.log('compelete', res)
                this.hideLoading()
            }
        })
    },
    radioChange(e) {
        this.setData({
            submitData: {
                ...this.data.submitData,
                invoice: e.detail.value ? 1 : 0
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
            this.clearSubjectData()
            this.setData({
                applicantIndex: 0,
                submitData: {
                    ...this.data.submitData,
                    applicantType: 10
                }
            })
            this.getDepartmentList(this.data[listName][value].id)
            this.getBorrowBillList(this.data[listName][value].id, 10)
            this.isCapitalTypeStart(this.data[listName][value].id)
        }
        if (name === 'submitterDepartmentId') {
            this.clearSubjectData()
            this.setData({
                applicantIndex: 0
            })
            this.getBorrowBillList(this.data.submitData.accountbookId, 10)
            this.getSubjectList(this.data.submitData.accountbookId, this.data[listName][value].id)
        }
        // if (name === 'subjectId') {
        //     this.getSubjectAuxptyList(this.data[listName][value].id, this.data.submitData.accountbookId, true)
        // }
        if (name === 'applicantType') {
            this.getSubjectAuxptyList(this.data.submitData.subjectId, this.data.submitData.accountbookId)
            this.getBorrowBillList(this.data.submitData.accountbookId, this.data[listName][value].id)
        }
        if (name === 'applicantId') {
            this.getIncomeBankList(this.data.submitData.applicantType, this.data[listName][value].id)
        }
        if (name === 'incomeBankName') {
            this.setIncomeBankAccount(this.data[listName][value].bankAccount)
        }
        // if (name === 'capitalTypeDetailId') {
        //     this.setCapitalType(this.data[listName][value].detailId)
        // }
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
    clearSubjectData() {
        // 清空科目数据，当这个发生变化的时候
        this.setData({
            submitData: {
                ...this.data.submitData,
                subjectId: '',
                subjectName: ''
            },
            selectedAuxpty: null,
            subjectAuxptyList: [],
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
    getBorrowIdFromStorage() {
        // 从缓存里获取借款人id
        const borrowId = dd.getStorageSync({key: 'borrowId'}).data
        if (!!borrowId) {
            console.log('借款人id已经获取', borrowId)
            var borrowIndex = null
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
            this.getSubjectAuxptyList(this.data.submitData.subjectId, this.data.submitData.accountbookId)
            this.getIncomeBankList(this.data.submitData.applicantType, borrowId)
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
                selectedAuxpty: null,
                submitData: {
                    ...this.data.submitData,
                    subjectId: subject.id,
                    subjectName: subject.name,
                    billApEntityListObj: []
                }
            })
            dd.removeStorage({
                key: 'subject'
            })
            this.getSubjectAuxptyList(subject.id, this.data.submitData.accountbookId)
        }
    },
    getCapitalDetailIdFromStorage() {
        // 从缓存里获取科目id
        const capital = dd.getStorageSync({key: 'capital'}).data
        console.log(capital, 'apital')
        if (!!capital && capital !== null) {
            this.setData({
                submitData: {
                    ...this.data.submitData,
                    capitalTypeDetailId: capital.id,
                    capitalTypeDetailName: capital.name
                }
            })
            dd.removeStorage({
                key: 'capital'
            })
        }
    },
    onHide() {
        // 清理借款人缓存
        dd.removeStorage({
            key: 'borrowId',
            success: function () {
                console.log('借款人缓存删除成功')
            }
        });
    },
    onShow() {
        app.globalData.loadingCount = 0
        this.getAuxptyIdFromStorage()
        this.getBorrowIdFromStorage()
        this.getSubjectIdFromStorage()
        this.getCapitalDetailIdFromStorage()

        // 页面显示
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        this.setData({
            animationInfo: animation.export()
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
        if (this.data.borrowAmount === '') {
            dd.alert({
                content: '请输入借款金额',
                buttonText: '确定',
                success: res => {
                }
            })
            return
        }
        if (this.data.remark === '') {
            dd.alert({
                content: '请输入备注信息',
                buttonText: '确定',
                success: res => {
                }
            })
            return
        }
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
    },
    handleUpload() {
        dd.chooseImage({
            count: 6,
            success: res => {
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
        if (array.length) {
            this.addLoading()
            let promiseList = []
            array.forEach(item => {
                promiseList.push(new Promise((resolve, reject) => {
                    dd.uploadFile({
                        url: app.globalData.url + 'aliyunController/uploadImages.do',
                        fileType: 'image',
                        fileName: item,
                        filePath: item,
                        formData: {
                            accountbookId: this.data.submitData.accountbookId,
                            submitterDepartmentId: this.data.submitData.submitterDepartmentId
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
                        }
                    })
                }))
            })
            Promise.all(promiseList).then(res => {
                // 提交成功的处理逻辑
                this.hideLoading()
                var billFilesList = []
                res.forEach(item => {
                    billFilesList.push(item)
                })
                this.setData({
                    submitData: {
                        ...this.data.submitData,
                        billFilesObj: this.data.submitData.billFilesObj.concat(billFilesList)
                    }
                })
            }).catch(error => {
                this.hideLoading()
                console.log(error, 'catch')
                dd.alert({
                    content: '上传失败',
                    buttonText: '好的',
                    success: res => {

                    }
                })
            })
        }
    },
    previewFile(e) {
        var url = e.currentTarget.dataset.url
        dd.previewImage({
            urls: [url],
        })
    },
    onLoad(query) {
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
                var capitalTypeDetailId = data ? data.capitalTypeDetailId : null
                this.getBorrowBillList(accountbookId, applicantType, applicantId, incomeBankName)
                this.getDepartmentList(accountbookId, submitterDepartmentId, subjectId)
                this.isCapitalTypeStart(accountbookId, capitalTypeDetailId)
            },
            complete: res => {
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
                    }
                })
                this.getSubjectList(accountbookId, submitterDepartmentId, subjectId)
            },
            complete: res => {
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
                // 写入缓存
                dd.setStorage({
                    key: 'borrowList',
                    data: arr,
                    success: res => {
                    }
                })
                // edit的时候，设置borrowIndex
                var borrowIndex = 0
                var applicantId = !!applicant ? applicant : app.globalData.applicantId
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
            },
            complete: res => {
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
            },
            complete: res => {
                this.hideLoading()
            }
        })
    },
    // 获取科目类型
    getSubjectList(accountbookId, departId) {
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
                    // 写入缓存
                    dd.setStorage({
                        key: 'subjectList',
                        data: arr,
                        success: res => {
                            console.log('写入科目成功....')
                        }
                    })
                } else {
                    // 写入缓存
                    dd.setStorage({
                        key: 'subjectList',
                        data: [],
                        success: res => {
                            console.log('写入科目成功....')
                        }
                    })
                }
            },
            complete: res => {
                this.hideLoading()
            }
        })
    },
    // 获取科目对应的辅助核算
    getSubjectAuxptyList(subjectId, accountbookId) {
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
                    this.setData({
                        subjectAuxptyList: arr,
                    })
                    arr.forEach(item => {
                        this.getAuxptyList(accountbookId, item.auxptyId)
                    })
                } else {
                    this.setData({
                        subjectAuxptyList: [],
                        allAuxptyList: []
                    })
                }
            },
            complete: res => {
                console.log('complete.........')
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
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + this.getAuxptyUrl(accountbookId, auxptyid),
            method: 'GET',
            dataType: 'json',
            success: res => {
                const name = this.getAuxptyNameMap(auxptyid)
                const newObj = res.data.rows.map(item => {
                    return {
                        id: item.id,
                        name: item[name],
                        auxptyId: auxptyid
                    }
                })
                const tempData = clone(this.data.allAuxptyList)
                tempData[auxptyid] = newObj
                console.log(newObj, auxptyid)
                console.log(tempData)
                this.setData({
                    allAuxptyList: tempData
                })
                // 设置默认值
                let index = null
                if (auxptyid == 1) {
                    // 部门
                    index = this.setInitIndex(newObj, this.data.submitData.submitterDepartmentId)
                }
                if (auxptyid == 2 && this.data.submitData.applicantType == 10) {
                    index = this.setInitIndex(newObj, this.data.submitData.applicantId)
                }
                if (auxptyid == 3 && this.data.submitData.applicantType == 20) {
                    index = this.setInitIndex(newObj, this.data.submitData.applicantId)
                }
                if (auxptyid == 4 && this.data.submitData.applicantType == 30) {
                    index = this.setInitIndex(newObj, this.data.submitData.applicantId)
                }
                if (index !== null) {
                    this.setSelectedAuxpty(newObj[index])
                }
            },
            complete: res => {
                console.log('complete', res)
                this.hideLoading()
            }
        })
    },
    setSelectedAuxpty(auxpty) {
        this.setData({
            selectedAuxpty: {
                ...this.data.selectedAuxpty,
                [auxpty.auxptyId]: {
                    id: auxpty.id,
                    name: auxpty.name,
                    auxptyId: auxpty.auxptyId
                }
            }
        })
        const obj = Object.values(this.data.selectedAuxpty).map(item => {
            return {
                auxptyId: item.auxptyId,
                auxptyDetailId: item.id
            }
        })
        this.setData({
            submitData: {
                ...this.data.submitData,
                billApEntityListObj: obj
            }
        })
    },
    setInitIndex(newObj, id) {
        let initIndex = null
        newObj.forEach((item, index) => {
            if (item.id === id) {
                initIndex = index
            }
        })
        return initIndex
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
                        id: item.id,
                        name: item.detailName
                    }
                })
                dd.setStorage({
                    key: 'capitalList',
                    data: arr,
                    success: res => {
                        console.log('资金计划写入成功...')
                    }
                })
                if (!!capitalTypeDetailId) {
                    arr.forEach(item => {
                        if (item.id === capitalTypeDetailId) {
                            this.setData({
                                submitData: {
                                    ...this.data.submitData,
                                    capitalTypeDetailName: item.name,
                                    capitalTypeDetailId: item.id
                                }
                            })
                        }
                    })
                }
            },
            complete: res => {
                console.log('complete', res)
                this.hideLoading()
            }
        })
    },
    setCapitalType(id) {
        this.setData({
            submitData: {
                ...this.data.submitData,
                capitalTypeDetailId: id
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
        console.log('===============================================')
        dd.httpRequest({
            url: app.globalData.url + 'borrowBillController.do?getDetail&id=' + id,
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res.data.obj)
                if (res.data.obj) {
                    this.setRenderData(res.data.obj)
                    this.hideLoading()
                    // 查看
                    this.setDisabled(res.data.obj.status)
                }
            },
            complete: res => {
                console.log('complete', res)
            }
        })
    },
    setDisabled(status) {
       if(status == 10 || status == 25) {
            this.setData({
                disabled: true
            })
       }else{
           this.setData({
               disabled: false
           })
       }
    },
    onDisabled() {
        dd.showToast({
            type: 'none',
            content: '当前单据状态不可被编辑',
            success: () => {
            },
        });
    },
    // 回显数据设置
    setRenderData(data) {
        // 请求
        this.getAccountbookList(data)
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
        var billApEntityListObj = []
        if (data.billApEntityList.length) {
            billApEntityListObj = data.billApEntityList.map(item => {
                return {
                    auxptyId: item.auxptyId,
                    auxptyDetailId: item.auxptyDetailId,
                    auxptyDetailName: item.auxptyDetailName
                }
            })
            const obj = {}
            billApEntityListObj.forEach(item => {
                obj[item.auxptyId] = {
                    auxptyId: item.auxptyId,
                    id: item.auxptyDetailId,
                    name: item.auxptyDetailName
                }
            })
            this.setData({
                selectedAuxpty: obj
            })
        }
        // subjectAuxptyList
        if (data.subject.subjectAuxptyList.length) {
            const subjectAuxptyList = data.subject.subjectAuxptyList.map(item => {
                return {
                    auxptyId: item.auxptyId,
                    auxptyName: item.auxpropertyConfig.auxptyName
                }
            })
            this.setData({
                subjectAuxptyList
            })
        }
        // fileList
        if (data.billFiles.length) {
            var billFilesObj = data.billFiles.map(item => {
                return item
            })
        }
        // 请求科目下的辅助核算
        this.getSubjectAuxptyList(data.subjectId, data.accountbookId)

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
                subjectId: data.subjectId,
                subjectName: data.subject.fullSubjectName,
                businessDateTime: data.businessDateTime,
                amount: data.amount.toFixed(2),
                remark: data.remark,
                status: data.status,
                userName: app.globalData.realName,
                accountbookId: data.accountbookId,
                billCode: data.billCode
            }
        })
    },
    goInfoList() {
        dd.navigateTo({
            url: '/pages/infoList/index'
        })
    },
    goSubjectPage() {
        dd.navigateTo({
            url: '/pages/subjectPage/index'
        })
    },
    goCapitalPage() {
        dd.navigateTo({
            url: '/pages/capitalPage/index'
        })
    },
    goAuxptyPage(e) {
        const auxptyId = e.currentTarget.dataset.id
        dd.setStorage({
            key: 'auxptyList',
            data: this.data.allAuxptyList[auxptyId],
            success: res => {
                dd.navigateTo({
                    url: '/pages/auxptyPage/index'
                })
            }
        })
    }
})
