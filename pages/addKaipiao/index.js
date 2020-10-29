import clone from "lodash/cloneDeep";
import {getErrorMessage, submitSuccess, formatNumber, request} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
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
            invoiceType:  1,
            billFilesObj: []
        },
        kaipiaoList: [],
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
        if(name === 'submitterDepartmentId') {
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
    onAddKaipiao() {
        var obj = this.generateBaseDetail()
        if(!!obj) {
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
        }else{
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
        if(e.detail.value == 2) {
            // 去快递页面选择
            this.setData({
                isExpress: 2
            })
            // 获取快递信息
            this.getExpressList()
        }else{
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
            key:"updateCustomerDetailData",
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
        dd.navigateTo({
            url: '/pages/importYingshouList/index'
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
                    console.log(this.data.kaipiaoList, 'this.data.kaipiaoListtttttttttttt')
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
    onShow() {
        this.getCustomerDetailFromStorage()
        this.getUpdatedCustomerFromStorage()
        this.getExpressInfoFromStorage()
        // 从缓存里获取baoxiaoDetail
        this.getKaipiaoDetailFromStorage()
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
                if(res.data.success && res.data.obj.length) {
                    var accountbookIndex = 0
                    var accountbookId = !!data ? data.accountbookId:res.data.obj[0].id
                    const accountbookList = res.data.obj
                    if(accountbookId) {
                        accountbookList.forEach((item, index) => {
                            if(item.id === accountbookId) {
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
                    this.getDepartmentList(accountbookId, submitterDepartmentId, subjectId)
                    this.getCustomerList(accountbookId)
                    this.getTaxRateFromAccountbookId(accountbookId)
                    this.getRemarks(accountbookId)
                }
            }
        })
    },
    // 获取申请部门
    getDepartmentList(accountbookId, departmentId, subjectId) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'newDepartController.do?departsJson&accountbookId=' + accountbookId,
            method: 'GET',
            success: res => {
                console.log(res, '部门')
                if(res.data && res.data.length) {
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
                }else{
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
    getSubjectList(accountbookId, departId) {
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
                if(res.status === 200) {
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
        if(!!customerDetail) {
            this.setData({
                customerDetail: customerDetail,
                submitData: {
                    ...this.data.submitData,
                    invoiceType: customerDetail.invoiceType
                }
            })
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
        if(updatedCustomInfo) {
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
    getExpressInfoFromStorage(){
        const expressInfo = dd.getStorageSync({key: 'expressInfo'}).data
        if(expressInfo) {
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
        }else{
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
                if(res.data.success) {
                    if(res.data.obj.length) {
                        const arr = res.data.obj.map(item => item.taxRate)
                        arr.unshift('请选择')
                        // 如果只有一个税率，默认选中第一个
                        if(arr.length <= 2) {
                           this.setData({
                               taxRateIndex: 1
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
    getProcessInstance(billId, accountbookId) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'dingtalkController.do?getProcessinstanceJson&billType=4&billId=' + billId + '&accountbookId=' + accountbookId,
            method: 'GET',
            success: res => {
                if(res.data && res.data.length) {
                    const { title, operationRecords, tasks, ccUserids } = res.data[0]
                    const taskArr = tasks.filter(item => {
                        if(item.taskStatus === 'RUNNING') {
                            if(item.userid.split(',')[2]){
                                item.userName = item.userid.split(',')[2]
                                item.realName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                            }else{
                                item.userName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                                item.realName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                            }
                            item.avatar = item.userid.split(',')[1]
                            item.resultName = '（审批中）'
                            item.operationName = '审批人'
                            return item
                        }
                    })

                    // 抄送人
                    let cc = []
                    if(ccUserids && ccUserids.length) {
                        cc = ccUserids.map(item => {
                            return {
                                userName: item.split(',')[0],
                                realName: item.split(',')[0].length > 1 ? item.split(',')[0].slice(-2) : item.split(',')[0],
                                avatar: item.split(',')[1]
                            }
                        })
                    }

                    const operationArr = operationRecords.filter(item => {
                        if(item.userid.split(',')[2]){
                            item.userName = item.userid.split(',')[2]
                            item.realName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                        }else{
                            item.userName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                            item.realName = item.userid.split(',')[0].length > 1 ? item.userid.split(',')[0].slice(-2) : item.userid.split(',')[0]
                        }
                        console.log(item.realName)
                        item.avatar = item.userid.split(',')[1]
                        if(item.operationType === 'START_PROCESS_INSTANCE') {
                            item.operationName = '发起审批'
                        } else if(item.operationType !== 'NONE') {
                            item.operationName = '审批人'
                        }
                        if(item.operationResult === 'AGREE') {
                            item.resultName = '（已同意）'
                        }else if(item.operationResult === 'REFUSE') {
                            item.resultName = '（已拒绝）'
                        }else{
                            item.resultName = ''
                        }
                        if(item.operationType !== 'NONE') {
                            return item
                        }
                    })
                    this.setData({
                        process: {
                            title,
                            operationRecords: operationArr,
                            tasks: taskArr,
                            cc
                        }
                    })
                }
            },
        })
    },
})
