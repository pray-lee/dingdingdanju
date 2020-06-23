import {loginFiled} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
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
            10:"职员",
            20:"供应商",
            30:"客户"
        },
    },
    seeAll(e) {
        // 查看全部
        dd.navigateTo({
            url: '../list/index?type=' + e.currentTarget.dataset.type
        })
    },
    onAddShow() {
        console.log(11111)
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
        animation.translateY(260).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: true
        })
    },
    addLoading() {
        if(app.globalData.loadingCount < 1) {
            dd.showLoading({
                content: '加载中...'
            })
        }
        app.globalData.loadingCount ++
    },
    hideLoading(){
        app.globalData.loadingCount--
        if(app.globalData.loadingCount === 0) {
            dd.hideLoading()
        }
    },
    onLoad(query) {
        this.addLoading()
        dd.getAuthCode({
            success: (res) => {
                console.log(res)
                dd.httpRequest({
                    url: app.globalData.url + "loginController.do?loginDingTalk&code=" + res.authCode,
                    method: "GET",
                    dataType: "json",
                    success: res => {
                        if(res.data.success){
                            app.globalData.realName=res.data.obj.realName
                            // 请求借款列表
                            this.getJiekuanList()
                            // 请求报销列表
                            this.getBaoxiaoList()
                            this.hideLoading()
                        }else{
                            loginFiled()
                            this.hideLoading()
                        }
                    },
                    fail: res => {
                        loginFiled('网络错误！')
                        this.hideLoading()
                        console.log(res, 'failed')
                    },
                })
            },
            fail: res => {
                loginFiled('当前组织没有该小程序')
            }
        })
    },
    onReady() {
    },
    getJiekuanList() {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,',
            method: 'GET',
            dataType: 'json',
            success: res => {
                this.setData({
                    jiekuanList: res.data.rows,
                })
                this.hideLoading()
            }
        })
    },
    getBaoxiaoList() {
        this.addLoading()
        dd.httpRequest({
            url: app.globalData.url + 'reimbursementBillController.do?datagrid&reverseVerifyStatus=0&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,submitterId,submitter.realName,childrenCount,accountbook.oaModule,status',
            method: 'GET',
            dataType: 'json',
            success: res => {
                this.setData({
                    baoxiaoList: res.data.rows,
                })
                this.hideLoading()
            }
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
    // onShareAppMessage() {
    //   // 返回自定义分享信息
    //   return {
    //     title: 'My App',
    //     desc: 'My App description',
    //     path: 'pages/index/index',
    //   };
    // },
});
