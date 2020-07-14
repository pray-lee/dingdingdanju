import {loginFiled, formatNumber, request} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        isPhoneXSeries: false,
        animationInfo: {},
        maskHidden: true,
        jiekuanList: [],
        baoxiaoList: [],
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
    },
    seeAll(e) {
        // 查看全部
        dd.navigateTo({
            url: '../list/index?type=' + e.currentTarget.dataset.type + '&flag=' + e.currentTarget.dataset.flag
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
    },
    onAddHide() {
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'linear'
        })
        this.animation = animation
        animation.translateY('100%').step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: true
        })
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
    onLoad(query) {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
    },
    onReady() {
    },
    getJiekuanList() {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&page=1&rows=1&sort=updateDate&order=desc&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,',
            method: 'GET',
            success: res => {
                if(res.data.rows.length) {
                    const obj = res.data.rows[0]
                    obj.amount = formatNumber(obj.amount)
                    this.setData({
                        jiekuan: obj,
                    })
                }
            }
        })
    },
    getBaoxiaoList() {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'reimbursementBillController.do?datagrid&reverseVerifyStatus=0&page=1&rows=1&sort=updateDate&order=desc&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,submitterId,submitter.realName,childrenCount,accountbook.oaModule,status',
            method: 'GET',
            success: res => {
                if(res.data.rows.length) {
                    const obj = res.data.rows[0]
                    obj.totalAmount = formatNumber(obj.totalAmount)
                    this.setData({
                        baoxiao: obj,
                    })
                }
            }
        })
    },
    onShow() {
        this.addLoading()
        dd.getAuthCode({
            success: (res) => {
                this.hideLoading()
                this.addLoading()
                request({
                    hideLoading: this.hideLoading,
                    url: app.globalData.url + "loginController.do?loginDingTalk&code=" + res.authCode,
                    method: 'GET',
                    success: res => {
                        if (res.data.success) {
                            if(res.data.obj) {
                                app.globalData.realName = res.data.obj.realName
                                app.globalData.applicantId = res.data.obj.id
                                // 请求借款列表
                                this.getJiekuanList()
                                // 请求报销列表
                                this.getBaoxiaoList()
                            }else{
                                loginFiled(res.data.msg)
                            }
                        } else {
                            loginFiled(res.data.msg)
                        }
                    },
                })
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
    onHide() {
        // 页面隐藏
    },
    onUnload() {
        // 页面被关闭
    },
    onTitleClick() {
        // 标题被点击
        console.log('title clicked')
    },
    onPullDownRefresh() {
        console.log(1121)
        // 页面被下拉
    },
    onReachBottom() {
        // 页面被拉到底部
    },
    goToEdit(e) {
        var id = e.currentTarget.dataset.id
        var flag = e.currentTarget.dataset.flag
        var status = e.currentTarget.dataset.status
        if (flag === 'B') {
            if (status == 10 || status == 25) {
                dd.navigateTo({
                    url: '../addBaoxiao/index?type=edit&id=' + id
                })
            } else {
                dd.navigateTo({
                    url: '../viewBaoxiao/index?id=' + id
                })
            }
        } else {
            if (status == 10 || status == 25) {
                dd.navigateTo({
                    url: '../addJiekuan/index?type=edit&id=' + id
                })
            } else {
                dd.navigateTo({
                    url: '../viewJiekuan/index?id=' + id
                })
            }
        }
    },
});
