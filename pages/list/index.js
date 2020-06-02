var app = getApp()
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
            10:"职员",
            20:"供应商",
            30:"客户"
        }
    },
    onLoad(query) {
        var type = query.type
        this.setData({
            type
        })
        // 页面加载完成
        if(type === 'jiekuan') {
            dd.httpRequest({
                url: app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,',
                method: 'GET',
                success: res => {
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
        }else{
           console.log('报销单列表获取, 还没写')
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
        animation.translateY(360).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: true
        })
    },
    onShowAddJiekuan(e) {
        dd.navigateTo({
            url: '../addJiekuan/index'
        })
    },
    onShowAddBaoxiao(e) {
        dd.navigateTo({
            url: '../addBaoxiao/index'
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
    }
})
