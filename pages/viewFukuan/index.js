import moment from "moment";
import clone from 'lodash/cloneDeep'
import {getErrorMessage, submitSuccess, formatNumber, validFn, request} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        isPhoneXSeries: false,
        process: null,
        result: null,
        caikaProcess: null,
        statusObj: {
            1: '审批中',
            2: '已同意',
            0: '',
            '-1': '已撤回',
            '-2': '已驳回'
        },
        // oa===============================
        historyOaList: [],
        showOaOperate: false,
        dialogHidden: true,
        maskHidden: true,
        animationInfo: {},
        approvalType: '',
        submitOaData: {
            id: '',
            processInstanceId: '',
            comment: '',
            approveResult: null
        },
        submitOaType: {
            approval: 1,
            reject: 0
        }
        // oa===============================
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
    previewFile(e) {
        var url = e.currentTarget.dataset.url
        dd.previewImage({
            urls: [url],
        })
    },
    onLoad(query) {
        // oa===============================
        if(query.processInstanceId) {
            this.setOaQuery(query)
        }
        this.getHistoryOaList(query)
        // oa===============================
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        this.addLoading()
        const id = query.id
        request({
            hideLoading: this.hideLoading(),
            url: app.globalData.url + 'paymentBillController.do?getDetail&id=' + id,
            method: 'GET',
            success: res => {
                if(res.data.obj) {
                    const result = clone(res.data.obj)
                    console.log(result, 'result')
                    result.applicationAmount = formatNumber(Number(result.applicationAmount).toFixed(2))
                    result.verificationAmount = formatNumber(Number(result.verificationAmount).toFixed(2))
                    result.totalAmount = formatNumber(Number(result.totalAmount).toFixed(2))
                    result.billDetailList.forEach(item => {
                        item.formatApplicationAmount = formatNumber(Number(item.applicationAmount).toFixed(2))
                    })
                    this.setData({
                        result
                    })
                    this.getProcessInstance(result.id, result.accountbookId)
                }
            }
        })
        // 获取审批信息
        this.getCaikaProcessInstance(query)
    },
    getHistoryOaList(query) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'oaController.do?lastActivityNodeList&billId=' + query.id,
            method: 'GET',
            success: res => {
                if(res.status === 200) {
                    const historyOaList = this.handleData(res.data)
                    this.setData({
                        historyOaList: historyOaList.map(item => ({...item, showUserList: false}))
                    })
                    console.log(this.data.historyOaList)
                }
            }
        })
    },
    toggleUserList(e) {
        const index = e.currentTarget.dataset.index
        this.data.caikaProcess[index].showUserList = !this.data.caikaProcess[index].showUserList
        this.setData({
            caikaProcess: this.data.caikaProcess
        })
    },
    toggleHistoryList(e) {
        const index = e.currentTarget.dataset.index
        this.data.historyOaList[index].showUserList = !this.data.historyOaList[index].showUserList
        this.setData({
            historyOaList: this.data.historyOaList
        })
    },
    getCaikaProcessInstance(query) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'oaController.do?activityNodeList&billId=' + query.id,
            method: 'GET',
            success: res => {
                if(res.data) {
                    const caikaProcess = this.handleData(res.data)
                    this.setData({
                        caikaProcess: caikaProcess.map(item => ({...item, showUserList: false}))
                    })
                    console.log(this.data.caikaProcess)
                }
            }
        })
    },
    handleData(sourceArr) {
        var arr = [];
        if (sourceArr.length == 0 || sourceArr == undefined) {
            return arr;
        }
        //给数组添加排序编号
        for (var i = 0; i < sourceArr.length; i++) {
            sourceArr[i].no = i;
        }
        //根据下标排序
        var compare = function (property) {
            return function (a, b) {
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        }
        //获取对应数据
        var getSourceArr = function (sourceArr, removeArr) {
            if (removeArr.length == 0) {
                return;
            }
            var index = 0;
            //循环删除数据
            for (var i = 0; i < removeArr.length; i++) {
                var deindex = removeArr[i] - index;
                sourceArr.splice(deindex, 1);
                index++;
            }
        }
        //获取status=2的数据
        var status2 = [];
        var removeArr = [];
        for (var i = 0; i < sourceArr.length; i++) {
            var json = sourceArr[i];
            if (json.status == 2 && json.activityType == 'userTask') {
                status2.push(json);
                removeArr.push(i);
            }
        }
        //删除statues=2
        getSourceArr(sourceArr, removeArr);
        //构建剩余数据构建有相同的activityId
        var otherStatus = [];
        var tempArr = [];
        for (var i = 0; i < sourceArr.length; i++) {
            var json = sourceArr[i];
            if (tempArr.indexOf(json.activityId) == -1) {
                //先做成简单的对象，可以扩展对象属性
                otherStatus.push({
                    activityId: json.activityId,
                    activityName: json.activityName,
                    activityType: json.activityType,
                    signType: json.signType,
                    children: [json],
                    no: json.no,
                    status: json.status
                });
                tempArr.push(json.activityId);
            } else {
                for (var j = 0; j < otherStatus.length; j++) {
                    var other = otherStatus[j];
                    if (json.activityId == other.activityId) {
                        otherStatus[j].children.push(json);
                    }
                }
            }
        }
        var sameArr = [];
        var onlyArr = [];
        //拆开有children的和无children的
        for (var i = 0; i < otherStatus.length; i++) {
            let json = otherStatus[i];
            if (json.children.length == 1) {
                onlyArr.push(json.children[0]);
            } else {
                sameArr.push(json);
            }
        }
        //拼接数组
        arr = status2.concat(sameArr).concat(onlyArr);
        arr.sort(compare('no'));
        return arr;
    },
    // oa===============================
    onCommentShow(e) {
        const type = e.currentTarget.dataset.type
        this.setData({
            approvalType: type,
            submitOaData: {
                ...this.data.submitOaData,
                approveResult: type === 'reject' ? 0 : 1
            }
        })
        var animation = dd.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY(0).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: false,
            dialogHidden: false
        })
    },
    onCommentHide() {
        this.setData({
            id: '',
            approveResult: '',
            comment: '',
            processInstanceId: ''
        })
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
        const t = setTimeout(() => {
            this.setData({
                dialogHidden: true
            })
            clearTimeout(t)
        }, 250)
    },
    commentInput(e) {
        this.setData({
            submitOaData: {
                ...this.data.submitOaData,
                comment: e.detail.value
            }
        })
    },
    setOaQuery(query) {
        this.setData({
            showOaOperate: query.showOaOperate,
            submitOaData: {
                ...this.data.submitOaData,
                id: query.oaId,
                processInstanceId: query.processInstanceId
            }
        })
    },
    submitOa() {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: `${app.globalData.url}oaTaskController.do?doProcess`,
            method: 'POST',
            data: this.data.submitOaData,
            success: res => {
                // 关闭弹框
                this.onCommentHide()
                if(res.data.success) {
                    // if(this.data.submitOaData.approveResult == 1) {
                    //     this.onLoad({
                    //         id: this.data.result.id,
                    //         oaId: this.data.submitOaData.id,
                    //         processInstanceId: this.data.submitOaData.processInstanceId,
                    //         showOaOperate: this.data.showOperate
                    //     })
                    // }else{
                    //     dd.redirectTo({
                    //         url: `/pages/addFukuan/index?id=${this.data.result.id}&type=edit`
                    //     })
                    // }
                    dd.navigateBack({
                        delta: 1
                    })
                }else{
                    dd.alert({
                        content: res.data.msg,
                        buttonText: '好的',
                        success: () => {}
                    })
                }
            }
        })
    },
    // oa===============================
    getProcessInstance(billId, accountbookId) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'dingtalkController.do?getProcessinstanceJson&billType=9&billId=' + billId + '&accountbookId=' + accountbookId,
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
    showFukuanDetail(e) {
        const index = e.currentTarget.dataset.index
        const tempData = clone(this.data.result.billDetailList[index])
        console.log(tempData, 'viewFukuan')
        dd.setStorage({
            key: 'fukuanDetail',
            data: tempData,
            success: res => {
                dd.navigateTo({
                    url: '/pages/viewFukuanDetail/index'
                })
            }
        })
    }
})
