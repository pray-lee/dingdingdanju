import moment from 'moment'

var app = getApp()
Page({
    data: {
        maskHidden: true,
        animationInfo: {},
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
        submitData: {
            billDetailList: [],
            submitDate: moment().format('YYYY-MM-DD'),
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
    bindObjPickerChange(e) {
        var name = e.currentTarget.dataset.name
        var listName = e.currentTarget.dataset.list
        var value = e.detail.value
        var index = e.currentTarget.dataset.index
        this.setData({
            [index]: e.detail.value,
            submitData: {
                ...this.data.submitData,
                [name]: this.data[listName][value].id
            }
        })
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
        console.log(borrowAmount)
        var billDetailList = this.data.submitData['billDetailList'].filter(item => {
            return item.borrowAmount !== borrowAmount
        })
        this.setData({
            submitData: {
                ...this.data.submitData,
                billDetailList
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
            this.setData({
                submitData: {
                    ...this.data.submitData,
                    billDetailList
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
                    accountbookIndex: 0
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
                    departmentIndex: 0
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
                    borrowIndex: 0
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
                        incomeBankIndex: 0
                    })
                    this.setIncomeBankAccount(arr[0].bankAccount)
                } else {
                    this.setData({
                        incomeBankList: [],
                        incomeBankIndex: 0
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
                var arr = []
                res.data.forEach(item => {
                    if (!item.childrenCount) {
                        arr.push({
                            id: item.id,
                            name: item.text
                        })
                    }
                })
                console.log(arr, 'subject')
                this.setData({
                    subjectList: arr,
                    subjectIndex: 0
                })
            }
        })
    },
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

    }
})
