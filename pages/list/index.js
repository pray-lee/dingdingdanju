var app = getApp()
app.globalData.loadingCount = 0
import {formatNumber, request} from '../../util/getErrorMessage'
Page({
    data: {
        isPhoneXSeries: false,
        type: '',
        scrollTop: 0,
        maskHidden: true,
        animationInfo: {},
        list: [],
        x: 0,
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
            url = app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&status=10&sort=updateDate&order=desc&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,'
        }
        if (type === '80J') {
            url = app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&sort=updateDate&order=desc&status_begin=80&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,'
        }
        if (type === '20J') {
            url = app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&sort=updateDate&order=desc&status_begin=11&status_end=79&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,'
        }
        if (type === '10B') {
            url = app.globalData.url + 'reimbursementBillController.do?datagrid&reverseVerifyStatus=0&sort=updateDate&order=desc&status=10&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,submitterId,submitter.realName,childrenCount,accountbook.oaModule,status'
        }
        if (type === '80B') {
            url = app.globalData.url + 'reimbursementBillController.do?datagrid&reverseVerifyStatus=0&sort=updateDate&order=desc&status_begin=80&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,submitterId,submitter.realName,childrenCount,accountbook.oaModule,status'
        }
        if (type === '20B') {
            url = app.globalData.url + 'reimbursementBillController.do?datagrid&reverseVerifyStatus=0&sort=updateDate&order=desc&status_begin=11&status_end=79&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,submitterId,submitter.realName,childrenCount,accountbook.oaModule,status'
        }
        return url
    },
    // scroll
    // onScroll(e) {
    //     const {scrollTop} = e.detail
    //     this.setData({
    //         scrollTop
    //     })
    // },
    // 点击tab页请求
    getData(e) {
        this.addLoading()
        // this.setData({
        //     scrollTop: 0
        // })
        var active = e.currentTarget.dataset.active
        var url = this.setUrl(active + this.data.flag)
        this.setData({
            active
        })
        request({
            hideLoading: this.hideLoading,
            url: url,
            method: 'GET',
            success: res => {
                let arr = []
                if(this.data.flag === 'J') {
                    arr = res.data.rows.map(item => {
                        return {
                            ...item,
                            amount: formatNumber(item.amount)
                        }
                    })
                }else{
                    arr = res.data.rows.map(item => {
                        return {
                            ...item,
                            amount: formatNumber(item.totalAmount)
                        }
                    })
                }
                this.setData({
                    list: arr,
                })
            },
            fail: res => {
                console.log(res, 'failed')
            },
        })
    },
    onLoad(query) {
        console.log(query)
        // type是状态码
        var type = query.type
        // 区分是借款还是报销
        var flag = query.flag
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries,
            type: type + flag,
            active: type,
            flag
        })
        // 页面加载完成,设置请求地址
        var url = this.setUrl(type + flag)
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: url,
            method: 'GET',
            success: res => {
                console.log(res)
                let arr = []
                if(flag === 'J') {
                    arr = res.data.rows.map(item => {
                        return {
                            ...item,
                            amount: formatNumber(item.amount)
                        }
                    })
                }else{
                    arr = res.data.rows.map(item => {
                        return {
                            ...item,
                            amount: formatNumber(item.totalAmount)
                        }
                    })
                }
                this.setData({
                    list: arr
                })
            },
            fail: res => {
                console.log(res, 'failed')
            },
        })
    },
    addLoading() {
        if(app.globalData.loadingCount < 1) {
            dd.showLoading({
                content: '加载中...'
            })
        }
        app.globalData.loadingCount +=1
    },
    hideLoading() {
        if(app.globalData.loadingCount <= 1) {
            dd.hideLoading()
            app.globalData.loadingCount = 0
        }else{
            app.globalData.loadingCount-=1
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
        //刷新
        const query = dd.getStorageSync({key: 'query'}).data
        console.log(query)

        if(query) {
            // 如果是审批驳回的，返回20，进未完成tab
            if(query.type == 25) {
                query.type = 20
            }
            dd.removeStorage({
                key: 'query'
            })
            this.onLoad(query)
        }
    },
    goToEdit(e) {
        var id = e.currentTarget.dataset.id
        const status = e.currentTarget.dataset.status
        console.log(this.data.type, 'type')
        if(this.data.type.indexOf('B') != -1) {
            if(status == 10 || status == 25) {
                dd.navigateTo({
                    url: '../addBaoxiao/index?type=edit&id=' + id
                })
            }else{
                dd.navigateTo({
                    url: '../viewBaoxiao/index?id=' + id
                })
            }
        }else{
            if(status == 10 || status == 25) {
                dd.navigateTo({
                    url: '../addJiekuan/index?type=edit&id=' + id
                })
            }else{
                dd.navigateTo({
                    url: '../viewJiekuan/index?id=' + id
                })
            }
        }
    },
    deleteBill(e) {
        const {id, flag, status} = e.currentTarget.dataset
        console.log(status, 'deleteBill')
        let url = ''
        if(flag === 'J') {
            url = app.globalData.url + 'borrowBillController.do?doBatchDel&ids=' + id
        }else{
            url = app.globalData.url + 'reimbursementBillController.do?doBatchDel&ids=' + id
        }
        dd.confirm({
            title: '温馨提示',
            content: '确认删除该单据吗?',
            confirmButtonText: '是',
            cancelButtonText: '否',
            success: res => {
                this.setData({
                    x: 0
                })
                if(res.confirm) {
                    this.addLoading()
                    request({
                        hideLoading: this.hideLoading,
                        url,
                        method: 'GET',
                        success: res => {
                            console.log(res)
                            if(res.data.success) {
                                this.onLoad({
                                    flag,
                                    type: status == 25 ? 20 : status
                                })
                            }else{
                                dd.showToast({
                                    type: 'none',
                                    content: '单据删除失败'
                                })
                            }
                        },
                    })
                }
            }
        })
    },
    onChangeEnd(e) {
        console.log(e)
        this.setData({
            x: 300
        })
    },
    onChange(e) {
        console.log(e)
    }
})
