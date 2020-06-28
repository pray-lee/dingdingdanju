var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        type: '',
        maskHidden: true,
        animationInfo: {},
        list: [],
        statusObj: {
            10: "待提交",
            20: "待审批",
            25: "审批驳回",
            30: "已审批",
            60: "已提交付款",
            80: "已付款"
        },
        applicantType: {
            10: "职员",
            20: "供应商",
            30: "客户"
        },
        active: ''
    },
    setUrl(type) {
        var url = ''
        if (type === '10J') {
            url = app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&status=10&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,'
        }
        if (type === '80J') {
            url = app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&status=80&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,'
        }
        if (type === '20J') {
            url = app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&status_begin=11&status_end=79&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,'
        }
        if (type === '10B') {
            url = app.globalData.url + 'reimbursementBillController.do?datagrid&reverseVerifyStatus=0&status=10&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,submitterId,submitter.realName,childrenCount,accountbook.oaModule,status'
        }
        if (type === '80B') {
            url = app.globalData.url + 'reimbursementBillController.do?datagrid&reverseVerifyStatus=0&status=80&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,submitterId,submitter.realName,childrenCount,accountbook.oaModule,status'
        }
        if (type === '20B') {
            url = app.globalData.url + 'reimbursementBillController.do?datagrid&reverseVerifyStatus=0&status_begin=11&status_end=79&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,submitterId,submitter.realName,childrenCount,accountbook.oaModule,status'
        }
        return url
    },
    // 点击tab页请求
    getData(e) {
        this.addLoading()
        var active = e.currentTarget.dataset.active
        var url = this.setUrl(active + this.data.flag)
        this.setData({
            active
        })
        dd.httpRequest({
            url: url,
            method: 'GET',
            success: res => {
                this.hideLoading()
                console.log(res)
                this.setData({
                    list: res.data.rows,
                })
            },
            fail: res => {
                console.log(res, 'failed')
            },
            complete: res => {
                console.log('completed')
            }
        })
    },
    onLoad(query) {
        // type是状态码
        var type = query.type
        // 区分是借款还是报销
        var flag = query.flag
        this.setData({
            type: type + flag,
            active: type,
            flag
        })
        // 页面加载完成,设置请求地址
        var url = this.setUrl(type + flag)
        this.addLoading()
        dd.httpRequest({
            url: url,
            method: 'GET',
            success: res => {
                this.hideLoading()
                console.log(res)
                this.setData({
                    list: res.data.rows
                })
            },
            fail: res => {
                console.log(res, 'failed')
            },
            complete: res => {
                console.log('completed')
            }
        })
    },
    addLoading() {
        dd.showLoading({
            content: '数据加载中...'
        })
        app.globalData.loadingCount++
    },
    hideLoading() {
        app.globalData.loadingCount--
        if (app.globalData.loadingCount === 0) {
            dd.hideLoading()
        }
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
    },
    onAddHide() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY('100%').step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: true
        })
    },
    onShowAddJiekuan(e) {
        dd.navigateTo({
            url: '../addJiekuan/index?type=add'
        })
        this.onAddHide()
    },
    onShowAddBaoxiao(e) {
        dd.navigateTo({
            url: '../addBaoxiao/index?type=add'
        })
        this.onAddHide()
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
    goToEdit(e) {
        var id = e.currentTarget.dataset.id
        console.log(this.data.type, 'type')
        if(this.data.type.indexOf('baoxiao') != -1) {
            dd.navigateTo({
                url: '../addBaoxiao/index?type=edit&id=' + id
            })
        }else{
            dd.navigateTo({
                url: '../addJiekuan/index?type=edit&id=' + id
            })
        }
    },
    onPullDownRefresh() {
        dd.alert({
            content: '下拉刷新',
            buttonText: '确定',
            success: res => {

            }
        })
        console.log('onPullDownRefresh', new Date())
    }
})
