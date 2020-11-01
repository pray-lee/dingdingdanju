import clone from "lodash/cloneDeep";
import {getErrorMessage, submitSuccess, formatNumber, request} from "../../util/getErrorMessage";
import moment from "moment";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        billId: '',
        isPhoneXSeries: false,
        process: null,
        type: '',
        btnHidden: false,
        accountbookIndex: 0,
        accountbookList: [],
        departmentIndex: 0,
        departmentList: [],
        customerList: [],
        customerDetail: {},
        taxRateIndex: 0,
        taxRateArr: [],
        isExpress: 1,
        subjectList: [],
        submitData: {
            invoiceType: 1,
            billFilesObj: [],
            businessDateTime: moment().format('YYYY-MM-DD'),
            amount: 0,
            status: 20
        },
        kaipiaoList: [],
        importList: []
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
                // this.onClick()
            },
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
    formatExpress() {
        const expressInfo = dd.getStorageSync({key: 'expressInfo'}).data
        if(!!expressInfo) {
            this.setData({
                submitData: {
                   ...this.data.submitData,
                   ...expressInfo
                }
            })
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
        Object.keys(this.data.submitData).forEach(item => {
            if (item.indexOf('billDetailList') != -1) {
                delete this.data.submitData[item]
            }
        })
        // 处理一下提交格式
        // const newKaipiaoList = this.data.kaipiaoList.map(item => {
        //     return {
        //         billId: item.billId,
        //         amount:item.amount,
        //         unverifyAmount: item.unverifyAmount,
        //         applicationAmount: item.applicationAmount
        //     }
        // })
        this.formatSubmitData(this.data.kaipiaoList, 'billDetailList')
        this.formatSubmitData(this.data.submitData.billFilesObj, 'billFiles')
        // 处理快递信息
        this.formatExpress()
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log(this.data)
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        this.addLoading()
        var url = ''
        if (this.data.type === 'add') {
            url = app.globalData.url + 'invoicebillController.do?doAdd'
        } else {
            url = app.globalData.url + 'invoicebillController.do?doUpdate&id=' + this.data.billId
        }
        request({
            hideLoading: this.hideLoading,
            url,
            method: 'POST',
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
            }
        })
    },
    // 把baoxiaoList的数据，重组一下，拼在submitData里提交
    formatSubmitData(array, name) {
        console.log(array, 'array')
        array.forEach((item, index) => {
            Object.keys(item).forEach(keys => {
                if (item[keys] instanceof Array && keys.indexOf('billDetail') !== -1) {
                    item[keys].forEach((arrItem, arrIndex) => {
                        Object.keys(arrItem).forEach(arrKeys => {
                            console.log(arrKeys, 'arrKeys')
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
            this.setData({
                kaipiaoList: [],
                submitData: {
                    ...this.data.submitData,
                    taxpayerType: this.data.accountbookList[value].taxpayerType,
                    applicationAmount: '',
                    totalAmount: '',
                    verificationAmount: ''
                },
            })
            this.clearCustomerList()
            this.getDepartmentList(this.data[listName][value].id)
            this.getCustomerList(this.data[listName][value].id)
            this.getTaxRateFromAccountbookId(this.data[listName][value].id)
            this.getRemarks(this.data[listName][value].id)
        }
        if (name === 'submitterDepartmentId') {
            // 重新获取科目以后，就要置空开票列表
            this.setData({
                kaipiaoList: [],
                submitData: {
                    ...this.data.submitData,
                    applicationAmount: '',
                    totalAmount: '',
                    verificationAmount: '',
                },
            })
            this.getSubjectList(this.data.submitData.accountbookId, this.data[listName][value].id)
        }
    },
    // 获取开票内容
    getRemarks(accountbookId) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading(),
            method: 'GET',
            url: app.globalData.url + 'invoicebillDetailController.do?findRemark&accountbookId=' + accountbookId,
            success: res => {
                console.log(res, '开票内容')
                const remarks = res.data.obj.map(item => ({
                    id: item.id,
                    remark: item.remark
                }))
                remarks.unshift({
                    id: '',
                    remark: '请选择'
                })
                dd.setStorage({
                    key: 'remarks',
                    data: remarks
                })
            }
        })
    },
    // 组成初始详情数据
    generateBaseDetail() {
        console.log(this.data.subjectList)
        if (this.data.subjectList.length) {
            var subjectList = clone(this.data.subjectList)
            var obj = {
                subjectList: subjectList,
                selectedAuxpty: null,
                allAuxptyList: {},
                accountbookId: this.data.submitData.accountbookId,
                submitterDepartmentId: this.data.submitData.submitterDepartmentId,
                applicationAmount: '',
            }
        }
        return obj
    },
    // 请求编辑回显数据
    getEditData(id) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'invoicebillController.do?getDetail&id=' + id,
            method: 'GET',
            dataType: 'json',
            success: res => {
                console.log(res)
                if (res.data.obj) {
                    this.setRenderData(res.data.obj)
                }
            }
        })
    },
    // 回显数据设置
    setRenderData(data) {
        // 请求
        this.getAccountbookList(data)
        //fileList
        if (data.billFiles.length) {
            var billFilesObj = data.billFiles.map(item => {
                return item
            })
        }
        // customerDetail
        if(data.customerDetailEntity && data.customerDetailEntity.customer) {
            var customerDetail = {
                id: data.customerDetailEntity.id,
                bankAccount: data.customerDetailEntity.customer.bankAccount,
                bankName: data.customerDetailEntity.customer.bankName,
                customerName: data.customerDetailEntity.customer.customerName,
                taxCode: data.customerDetailEntity.customer.taxCode,
                invoiceAddress: data.customerDetailEntity.customer.invoiceAddress,
                invoicePhone: data.customerDetailEntity.customer.invoicePhone,
                invoiceType: data.customerDetailEntity.customer.invoiceType
            }
        }
        // 设置数据
        this.setData({
            ...this.data,
            // importList,
            customerDetail,
            status: data.status,
            submitData: {
                ...this.data.submitData,
                billFilesObj: billFilesObj || [],
                customerDetailId: data.customerDetailEntity.id,
                submitDate: moment().format('YYYY-MM-DD'),
                businessDateTime: data.businessDateTime,
                status: data.status,
                accountbookId: data.accountbookId,
                billCode: data.billCode,
            },
        })
    },
    onAddKaipiao() {
        var obj = this.generateBaseDetail()
        if (!!obj) {
            dd.setStorage({
                key: 'initKaipiaoDetail',
                data: obj,
                success: res => {
                    console.log('写入开票详情成功...')
                    dd.navigateTo({
                        url: '/pages/kaipiaoDetail/index'
                    })
                }
            })
        } else {
            dd.alert({
                content: '当前部门没有可用的开票类型',
                buttonText: '好的',
                success: () => {
                    //
                },
            });
        }
    },
    clearCustomerList() {
        this.setData({
            customerList: [],
            customerDetail: {},
            submitData: {
                ...this.data.submitData,
                invoiceType: 1
            }
        })
    },
    invoiceTypeChange(e) {
        this.setData({
            submitData: {
                ...this.data.submitData,
                invoiceType: e.detail.value
            }
        })
    },
    radioChange(e) {
        if (e.detail.value == 2) {
            // 去快递页面选择
            this.setData({
                isExpress: 2
            })
            // 获取快递信息
            this.getExpressList()
        } else {
            // 自取
            this.setData({
                isExpress: 1
            })
        }
    },
    getExpressList() {
        this.addLoading()
        request({
            hideLoading: this.hideLoading(),
            url: app.globalData.url + 'customerSpecialDeliveryController.do?listInfo&customerDetailId=' + this.data.customerDetail.id,
            method: 'GET',
            success: res => {
                dd.setStorageSync({
                    key: 'customerDetailId',
                    data: this.data.customerDetail.id
                })
                dd.setStorage({
                    key: 'expressList',
                    data: res.data.obj,
                    success: res => {
                        dd.navigateTo({
                            url: '/pages/express/index'
                        })
                    }
                })
            }
        })
    },
    goUpdateCustomer() {
        dd.setStorageSync({
            key: "updateCustomerDetailData",
            data: this.data.customerDetail
        })
        dd.navigateTo({
            url: '/pages/updateCustomerInfo/index'
        })
    },
    goKaipiaoDetail() {
        dd.navigateTo({
            url: '/pages/kaipiaoDetail/index'
        })
    },
    goYingshouList() {
        this.addLoading()
        request({
            hideLoading: this.hideLoading(),
            url: app.globalData.url + 'receivableBillController.do?datagrid&customerDetailId=' + this.data.customerDetail.id + '&taxRate=' + this.data.taxRateArr[this.data.taxRateIndex] + '&invoiceType=' + this.data.submitData.invoiceType + '&query=import&field=id,receivablebillCode,accountbookId,accountbookEntity.accountbookName,submitterId,user.realName,submitterDepartmentId,departDetailEntity.depart.departName,customerDetailId,customerDetailEntity.customer.customerName,invoiceType,subjectId,trueSubjectId,subjectEntity.fullSubjectName,trueSubjectEntity.fullSubjectName,auxpropertyNames,taxRate,amount,unverifyAmount,submitDateTime,businessDateTime,remark,',
            method: 'GET',
            success: res => {
                if (res.data.rows.length) {
                    dd.setStorage({
                        key: 'tempImportList',
                        data: res.data.rows,
                        success: () => {
                            dd.navigateTo({
                                url: '/pages/importYingshouList/index'
                            })
                        }
                    })
                } else {
                    dd.alert({
                        content: '暂无应收单',
                        buttonText: '好的',
                        success: () => {
                        }
                    })
                }
            }
        })
    },
    onHide() {
    },
    getKaipiaoDetailFromStorage() {
        const index = dd.getStorageSync({key: 'index'}).data
        this.setData({
            submitData: {
                ...this.data.submitData,
            }
        })
        dd.getStorage({
            key: 'newKaipiaoDetailArr',
            success: res => {
                const kaipiaoDetail = res.data
                if (!!kaipiaoDetail) {
                    let kaipiaoList = clone(this.data.kaipiaoList)
                    console.log(index)
                    if (!!index || index == 0) {
                        kaipiaoList.splice(index, 1)
                        dd.removeStorage({
                            key: 'index',
                            success: res => {
                                console.log('清除index成功')
                            }
                        })
                        kaipiaoList.splice(index, 0, kaipiaoDetail[0])
                        kaipiaoList = kaipiaoList.concat(kaipiaoDetail.slice(1))
                        this.setData({
                            kaipiaoList: kaipiaoList
                        })
                    } else {
                        this.setData({
                            kaipiaoList: kaipiaoList.concat(kaipiaoDetail)
                        })
                    }
                    // 计算一下总价
                    let amount = 0
                    this.data.kaipiaoList.forEach(item => {
                        amount += Number(item.applicationAmount)
                    })
                    this.setData({
                        submitData: {
                            ...this.data.submitData,
                            amount: amount.toFixed(2).toString()
                        }
                    })
                    dd.removeStorage({
                        key: 'newKaipiaoDetailArr',
                        success: res => {
                            console.log('清除newkaipiaoDetailArr成功...')
                        }
                    })
                }
            }
        })
    },
    getImportYingshouList() {
        const importList = dd.getStorageSync({key: 'importList'}).data
        if (!!importList) {
            this.setData({
                kaipiaoList: this.data.kaipiaoList.concat(importList)
            })
        }
        console.log(importList, '.........')
    },
    onShow() {
        this.getCustomerDetailFromStorage()
        this.getUpdatedCustomerFromStorage()
        this.getExpressInfoFromStorage()
        // 从缓存里获取baoxiaoDetail
        this.getKaipiaoDetailFromStorage()
        // 从缓存里获取导入应收单
        this.getImportYingshouList()

    },
    // 删除得时候把submitData里面之前存的报销列表数据清空
    clearListSubmitData(submitData) {
        Object.keys(submitData).forEach(key => {
            if (key.indexOf('billDetailList') != -1) {
                delete submitData[key]
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
                            accountbookId: this.data.submitData.accountbookId,
                            submitterDepartmentId: this.data.submitData.submitterDepartmentId
                        },
                        success: res => {
                            const result = JSON.parse(res.data)
                            console.log(result)
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
                    billFilesList.push(item)
                })
                this.setData({
                    submitData: {
                        ...this.data.submitData,
                        billFilesObj: this.data.submitData.billFilesObj.concat(billFilesList)
                    }
                })
            }).catch(error => {
                console.log(error, 'catch')
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
    previewFile(e) {
        var url = e.currentTarget.dataset.url
        dd.previewImage({
            urls: [url],
        })
    },
    onLoad(query) {
        app.globalData.loadingCount = 0
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries,
            submitData: {
                ...this.data.submitData,
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
        // ================test======================
        // type='edit'
        // id='2c91e3e97579b6550175842b74c1024e'
        // ================test======================
        // 获取账簿列表
        if (type === 'add') {
            this.getAccountbookList()
        }
        if (type === 'edit') {
            // 渲染
            this.getEditData(id)
        }
    },
    getAccountbookList(data) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'accountbookController.do?getAccountbooksJsonByUserId&agentId=' + app.globalData.agentId,
            method: 'GET',
            success: res => {
                if (res.data.success && res.data.obj.length) {
                    var accountbookIndex = 0
                    var accountbookId = !!data ? data.accountbookId : res.data.obj[0].id
                    const accountbookList = res.data.obj
                    if (accountbookId) {
                        accountbookList.forEach((item, index) => {
                            if (item.id === accountbookId) {
                                accountbookIndex = index
                            }
                        })
                    }
                    this.setData({
                        accountbookList,
                        accountbookIndex: accountbookIndex,
                        submitData: {
                            ...this.data.submitData,
                            accountbookId,
                        }
                    })
                    var submitterDepartmentId = data ? data.submitterDepartmentId : ''
                    var subjectId = data ? data.subjectId : ''
                    var billDetailList = data ? data.billDetailList : []
                    this.getDepartmentList(accountbookId, submitterDepartmentId, billDetailList)
                    this.getCustomerList(accountbookId)
                    this.getTaxRateFromAccountbookId(accountbookId)
                    this.getRemarks(accountbookId)
                }
            }
        })
    },
    // 获取申请部门
    getDepartmentList(accountbookId, departmentId, billDetailList) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'newDepartController.do?departsJson&accountbookId=' + accountbookId,
            method: 'GET',
            success: res => {
                console.log(res, '部门')
                if (res.data && res.data.length) {
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
                    this.getSubjectList(accountbookId, submitterDepartmentId, billDetailList)
                } else {
                    dd.alert({
                        content: '当前用户未设置部门或者所属部门已禁用',
                        buttonText: '好的',
                        success: res => {
                            dd.reLaunch({
                                url: '/pages/index/index'
                            })
                        }
                    })
                }
            },
        })
    },
    // 获取科目类型
    getSubjectList(accountbookId, departId, billDetailList) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'subjectController.do?combotree&accountbookId=' + accountbookId + '&departId=' + departId + '&billTypeId=5&findAll=false',
            method: 'GET',
            success: res => {
                console.log(res, '科目类型')
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
                    this.setData({
                        subjectList: arr
                    })
                    // billDetailList
                    if (billDetailList && billDetailList.length) {
                        var kaipiaoList = billDetailList.map(item => {
                            var obj = {}
                            var subjectId = item.subjectId
                            obj.accountbookId = accountbookId
                            obj.subjectId = item.subjectId
                            obj.subjectName = item.subjectEntity.fullSubjectName,
                            obj.trueSubjectId = item.trueSubjectId
                            obj.trueSubjectName = item.subjectEntity.trueSubjectName
                            obj.applicationAmount = item.applicationAmount
                            obj.formatApplicationAmount = formatNumber(Number(item.applicationAmount).toFixed(2))
                            // 用户之前有的辅助核算项
                            const auxptyObj = item.billDetailApEntityList.map(auxptyItem => {
                                return {
                                    auxptyId: auxptyItem.auxptyId,
                                    auxptyDetailId: auxptyItem.auxptyDetailId,
                                    auxptyDetailName: auxptyItem.auxptyDetailName
                                }
                            })
                            const billDetailApEntityObj = {}
                            auxptyObj.forEach(item => {
                                billDetailApEntityObj[item.auxptyId] = {
                                    auxptyId: item.auxptyId,
                                    id: item.auxptyDetailId,
                                    name: item.auxptyDetailName
                                }
                            })
                            obj.selectedAuxpty = billDetailApEntityObj
                            obj.billDetailApEntityListObj = auxptyObj
                            obj.allAuxptyList = {}
                            if (item.subjectEntity.subjectAuxptyList && item.subjectEntity.subjectAuxptyList.length) {
                                obj.subjectAuxptyList = item.subjectEntity.subjectAuxptyList.map(item => {
                                    return {
                                        auxptyId: item.auxptyId,
                                        auxptyName: item.auxpropertyConfig.auxptyName
                                    }
                                })
                            }
                            obj.remark = item.remark
                            obj.id = item.id
                            return obj
                        })
                        this.setData({
                            kaipiaoList
                        })
                    }
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
        })
    },
    // 获取客户信息
    getCustomerList(accountbookId) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading(),
            url: app.globalData.url + 'customerDetailController.do?json&accountbook.id=' + accountbookId,
            method: 'GET',
            success: res => {
                if (res.status === 200) {
                    this.setData({
                        customerList: res.data
                    })
                }
            }
        })
    },
    goCustomerList() {
        this.addLoading()
        dd.setStorage({
            key: 'customerList',
            data: this.data.customerList,
            success: () => {
                this.hideLoading()
                dd.navigateTo({
                    url: '/pages/customerList/index'
                })
            }
        })
    },
    // 获取选择的客户信息和客户快递列表
    getCustomerDetailFromStorage() {
        const customerDetail = dd.getStorageSync({key: 'customerDetail'}).data
        if (!!customerDetail) {
            this.setData({
                customerDetail: customerDetail,
                submitData: {
                    ...this.data.submitData,
                    invoiceType: customerDetail.invoiceType,
                    customerDetailId: customerDetail.id
                }
            })
            console.log(customerDetail, '....custoerDetail.....')
            dd.removeStorage({
                key: 'customerDetail',
                success: () => {
                    console.log('清除客户缓存...')
                }
            })
        }
    },
    // 获取修改后的客户信息
    getUpdatedCustomerFromStorage() {
        const updatedCustomInfo = dd.getStorageSync({key: 'updatedCustomInfo'}).data
        if (updatedCustomInfo) {
            this.setData({
                customerDetail: updatedCustomInfo,
            })
        }
        dd.removeStorage({
            key: 'updatedCustomInfo',
            success: () => {
                console.log('清除修改后的客户数据缓存...')
            }
        })
    },
    // 获取用户选择或者修改后的快递信息用于页面渲染
    getExpressInfoFromStorage() {
        const expressInfo = dd.getStorageSync({key: 'expressInfo'}).data
        if (expressInfo) {
            this.setData({
                submitData: {
                    ...this.data.submitData,
                    ...expressInfo
                }
            })
            console.log(this.data.submitData, 'submitDasta')
            dd.removeStorage({
                key: 'expressInfo',
                success: () => {
                    console.log('清除快递信息成功...')
                }
            })
        } else {
            this.setData({
                isExpress: 1
            })
        }
    },
    // 获取某个账簿的税率
    getTaxRateFromAccountbookId(accountbookId) {
        console.log(accountbookId, 'accountbookId')
        this.addLoading()
        request({
            hideLoading: this.hideLoading(),
            method: 'GET',
            url: app.globalData.url + 'accountbookController.do?findAccountbookTaxrate&accountbookId=' + accountbookId,
            success: res => {
                if (res.data.success) {
                    if (res.data.obj.length) {
                        const arr = res.data.obj.map(item => item.taxRate)
                        arr.unshift('请选择')
                        // 如果只有一个税率，默认选中第一个
                        if (arr.length <= 2) {
                            this.setData({
                                taxRateIndex: 1,
                                submitData: {
                                    ...this.data.submitData,
                                    taxRate: arr[1]
                                }
                            })
                        }
                        this.setData({
                            taxRateArr: arr
                        })
                    }
                }
            }
        })
    },
    showKaipiaoDetail(e) {
        // 加一个编辑标志
        dd.setStorage({
            key: 'edit',
            data: true,
            success: res => {
                console.log('编辑标志缓存成功...')
            }
        })
        this.addLoading()
        const index = e.currentTarget.dataset.index
        var obj = this.generateBaseDetail()
        dd.setStorage({
            key: 'index',
            data: index,
            success: res => {
                console.log('index设置成功...')
            }
        })
        dd.setStorage({
            key: 'kaipiaoDetail',
            data: this.data.kaipiaoList[index],
            success: res => {
                console.log(this.data.kaipiaoList[index])
                console.log('写入报销详情成功！！')
                dd.setStorage({
                    key: 'initKaipiaoDetail',
                    data: obj,
                    success: res => {
                        this.hideLoading()
                        dd.navigateTo({
                            url: '/pages/kaipiaoDetail/index'
                        })
                    }
                })
            }
        })
    },
    deleteKaipiaoDetail(e) {
        var idx = e.currentTarget.dataset.index
        var kaipiaoList = this.data.kaipiaoList.filter((item, index) => {
            return idx !== index
        })
        this.clearListSubmitData(this.data.submitData)
        this.setData({
            kaipiaoList
        })
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
})
